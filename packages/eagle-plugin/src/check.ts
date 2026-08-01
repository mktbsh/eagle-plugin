import { posix } from "node:path";
import { type ManifestJSON, validateManifest } from "eagle-plugin-manifest";
import {
  type ManualCheckCode,
  type PreflightErrorCode,
  type PreflightRuleReference,
  type PreflightWarningCode,
  preflightRuleReference,
} from "./preflight-rules.js";
import {
  captureRelease,
  type ReleaseEntry,
  type ReleaseSnapshot,
} from "./release-snapshot.js";

export type {
  ManualCheckCode,
  PreflightErrorCode,
  PreflightWarningCode,
} from "./preflight-rules.js";

export interface PreflightEvidence {
  readonly path: string;
  readonly line?: number;
  readonly excerpt?: string;
}

export interface PreflightFinding<Code extends string = string> {
  readonly code: Code;
  readonly severity: "error" | "warning";
  readonly message: string;
  readonly path?: string;
  readonly evidence: readonly PreflightEvidence[];
  readonly rule: PreflightRuleReference;
}

export interface ManualCheck {
  readonly code: ManualCheckCode;
  readonly severity: "manual";
  readonly message: string;
  readonly rule: PreflightRuleReference;
}

export interface PreflightResult {
  readonly schemaVersion: 2;
  readonly mechanicalStatus: "pass" | "fail";
  readonly errors: readonly PreflightFinding<PreflightErrorCode>[];
  readonly warnings: readonly PreflightFinding<PreflightWarningCode>[];
  readonly manualChecks: readonly ManualCheck[];
}

const manualChecks: readonly ManualCheck[] = [
  {
    code: "manual.functionality",
    severity: "manual",
    message: "Confirm that the plugin behavior and listing text are accurate.",
    rule: preflightRuleReference("manual.functionality"),
  },
  {
    code: "manual.visual_assets",
    severity: "manual",
    message: "Confirm that the logo and listing images are relevant and final.",
    rule: preflightRuleReference("manual.visual_assets"),
  },
  {
    code: "manual.cancellation_and_data_safety",
    severity: "manual",
    message:
      "Confirm cancellation behavior and the safety of every data-changing action.",
    rule: preflightRuleReference("manual.cancellation_and_data_safety"),
  },
  {
    code: "manual.author_understanding",
    severity: "manual",
    message:
      "Understand and test all included code, including AI-assisted changes.",
    rule: preflightRuleReference("manual.author_understanding"),
  },
  {
    code: "manual.fresh_install",
    severity: "manual",
    message:
      "Pack with Eagle and test a freshly installed .eagleplugin artifact.",
    rule: preflightRuleReference("manual.fresh_install"),
  },
];

function pathLabel(path: readonly (string | number)[]): string {
  return path.length === 0
    ? "manifest.json"
    : `manifest.json#${path.join(".")}`;
}

function errorFinding(
  code: PreflightErrorCode,
  message: string,
  path?: string,
  evidence: readonly PreflightEvidence[] = path === undefined ? [] : [{ path }],
): PreflightFinding<PreflightErrorCode> {
  return {
    code,
    severity: "error",
    message,
    ...(path === undefined ? {} : { path }),
    evidence,
    rule: preflightRuleReference(code),
  };
}

function warningFinding(
  code: PreflightWarningCode,
  message: string,
  path?: string,
  evidence: readonly PreflightEvidence[] = path === undefined ? [] : [{ path }],
): PreflightFinding<PreflightWarningCode> {
  return {
    code,
    severity: "warning",
    message,
    ...(path === undefined ? {} : { path }),
    evidence,
    rule: preflightRuleReference(code),
  };
}

function missingFileError(
  code: PreflightErrorCode,
  label: string,
  path: string,
): PreflightFinding<PreflightErrorCode> {
  return errorFinding(
    code,
    `${label} does not exist in the release candidate.`,
    path,
  );
}

type ReleaseReference =
  | { readonly success: true; readonly path: string }
  | {
      readonly success: false;
      readonly error: PreflightFinding<PreflightErrorCode>;
    };

function resolveReleaseReference(
  value: string,
  baseDirectory = "",
): ReleaseReference {
  const rootRelativeValue = value.replace(/^\/+/, "");
  const fromRoot = value.startsWith("/");
  const candidate = fromRoot
    ? rootRelativeValue
    : posix.join(baseDirectory, rootRelativeValue);
  const normalized = posix.normalize(candidate);
  const hasScheme = /^[A-Za-z][A-Za-z\d+.-]*:/u.test(value);
  const unsafe =
    value.length === 0 ||
    value.includes("\0") ||
    value.includes("\\") ||
    value.startsWith("//") ||
    value.includes("?") ||
    value.includes("#") ||
    hasScheme ||
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("../");

  if (unsafe) {
    return {
      success: false,
      error: errorFinding(
        "release.reference.unsafe",
        "Release references must stay inside the release directory.",
        value,
      ),
    };
  }
  return { success: true, path: normalized };
}

function moduleScriptSources(html: string): readonly string[] {
  return [...html.matchAll(/<script\b([^>]*)>/giu)].flatMap((match) => {
    const attributes = match[1] ?? "";
    const type = /\btype\s*=\s*["']([^"']+)["']/iu.exec(attributes)?.[1];
    const source = /\bsrc\s*=\s*["']([^"']+)["']/iu.exec(attributes)?.[1];
    return type === "module" && source !== undefined ? [source] : [];
  });
}

function manifestErrors(input: unknown):
  | { readonly success: true; readonly manifest: ManifestJSON }
  | {
      readonly success: false;
      readonly errors: readonly PreflightFinding<PreflightErrorCode>[];
    } {
  const result = validateManifest(input);
  if (result.success) {
    return { success: true, manifest: result.data };
  }
  return {
    success: false,
    errors: result.issues.map((issue) =>
      errorFinding(issue.code, issue.message, pathLabel(issue.path)),
    ),
  };
}

interface ManifestReadResult {
  readonly input?: unknown;
  readonly errors: readonly PreflightFinding<PreflightErrorCode>[];
}

function readManifest(snapshot: ReleaseSnapshot): ManifestReadResult {
  const path = "manifest.json";
  const entry = snapshot.byPath.get(path);
  if (entry?.kind !== "file") {
    return {
      errors: [missingFileError("release.manifest.missing", "Manifest", path)],
    };
  }

  const source = entry.contents ?? "";
  try {
    return { input: JSON.parse(source) as unknown, errors: [] };
  } catch {
    return {
      errors: [
        errorFinding(
          "release.manifest.invalid_json",
          "manifest.json is not valid JSON.",
          path,
        ),
      ],
    };
  }
}

function inspectReferencedFile(
  snapshot: ReleaseSnapshot,
  value: string,
  missingCode: PreflightErrorCode,
  label: string,
  baseDirectory = "",
):
  | {
      readonly success: true;
      readonly path: string;
      readonly contents: string;
    }
  | {
      readonly success: false;
      readonly error: PreflightFinding<PreflightErrorCode>;
    } {
  const reference = resolveReleaseReference(value, baseDirectory);
  if (!reference.success) {
    return reference;
  }
  const entry = snapshot.byPath.get(reference.path);
  if (entry?.kind !== "file") {
    return {
      success: false,
      error: missingFileError(missingCode, label, reference.path),
    };
  }
  return {
    success: true,
    path: reference.path,
    contents: entry.contents ?? "",
  };
}

function pathExtension(path: string): string {
  const name = posix.basename(path).toLowerCase();
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot);
}

function packageContentFindings(snapshot: ReleaseSnapshot): {
  readonly errors: readonly PreflightFinding<PreflightErrorCode>[];
  readonly warnings: readonly PreflightFinding<PreflightWarningCode>[];
} {
  const errors: PreflightFinding<PreflightErrorCode>[] = [];
  const warnings: PreflightFinding<PreflightWarningCode>[] = [];
  const developmentDirectories = new Set([
    ".bzr",
    ".git",
    ".hg",
    ".idea",
    ".pytest_cache",
    ".svn",
    ".venv",
    ".vscode",
    "__pycache__",
    "venv",
  ]);
  const systemFiles = new Set([".ds_store", "desktop.ini", "thumbs.db"]);
  const sensitiveFiles = new Set([
    "credentials.json",
    "id_dsa",
    "id_ed25519",
    "id_rsa",
    "secrets.json",
  ]);
  const archiveExtensions = new Set([
    ".7z",
    ".dmg",
    ".eagleplugin",
    ".gz",
    ".iso",
    ".rar",
    ".tar",
    ".tgz",
    ".zip",
  ]);
  const binaryExtensions = new Set([
    ".app",
    ".bin",
    ".dll",
    ".dylib",
    ".exe",
    ".msi",
    ".node",
    ".pkg",
    ".so",
  ]);

  for (const entry of snapshot.entries) {
    const name = posix.basename(entry.path).toLowerCase();
    const extension = pathExtension(entry.path);

    if (entry.kind === "symlink") {
      errors.push(
        errorFinding(
          "release.symlink.detected",
          "Release packages must not contain symbolic links.",
          entry.path,
        ),
      );
    }

    const isDevelopmentArtifact =
      developmentDirectories.has(name) ||
      systemFiles.has(name) ||
      [".log", ".swo", ".swp", ".tmp"].includes(extension);
    if (isDevelopmentArtifact) {
      errors.push(
        errorFinding(
          "release.development_artifact.detected",
          "A version-control, editor, cache, system, or temporary artifact was detected.",
          entry.path,
        ),
      );
    }

    const containsPrivateKey =
      entry.kind === "file" &&
      /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/u.test(entry.contents ?? "");
    const containsNpmToken =
      name === ".npmrc" &&
      /(?:_authToken|_auth|password)\s*=/iu.test(entry.contents ?? "");
    const isSensitive =
      entry.kind === "file" &&
      (name === ".env" ||
        name.startsWith(".env.") ||
        sensitiveFiles.has(name) ||
        [".p12", ".pfx"].includes(extension) ||
        containsPrivateKey ||
        containsNpmToken);
    if (isSensitive) {
      errors.push(
        errorFinding(
          "release.sensitive_file.detected",
          "A credential-bearing or secret-like file forbidden by the framework release contract was detected.",
          entry.path,
        ),
      );
    }

    if (entry.kind === "file" && archiveExtensions.has(extension)) {
      errors.push(
        errorFinding(
          "release.nested_archive.detected",
          "A nested archive or installer forbidden by the framework release contract was detected.",
          entry.path,
        ),
      );
    }

    if (entry.kind === "file" && binaryExtensions.has(extension)) {
      warnings.push(
        warningFinding(
          "release.binary.detected",
          "A native executable or binary was detected. Confirm its source, purpose, redistribution rights, platforms, and architectures.",
          entry.path,
        ),
      );
    }

    if (entry.kind === "directory" && name === "node_modules") {
      warnings.push(
        warningFinding(
          "release.dependency_directory.detected",
          "A dependency directory was detected. Keep only packages required at runtime.",
          entry.path,
        ),
      );
    }
  }

  return { errors, warnings };
}

interface PatternWarning {
  readonly code: PreflightWarningCode;
  readonly pattern: RegExp;
  readonly message: string;
}

const behaviorPatterns: readonly PatternWarning[] = [
  {
    code: "release.local_network_reference.detected",
    pattern:
      /https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|\[::1\]|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|169\.254(?:\.\d{1,3}){2})(?::\d+)?/iu,
    message:
      "A localhost, loopback, private-network, or link-local connection was detected. Confirm and disclose the local integration purpose.",
  },
  {
    code: "release.unencrypted_http.detected",
    pattern: /http:\/\/[^\s"'`<>]+/iu,
    message:
      "An unencrypted HTTP reference was detected. Confirm that sensitive data cannot be exposed.",
  },
  {
    code: "release.system_command.detected",
    pattern:
      /(?:child_process|execFile(?:Sync)?\s*\(|execSync\s*\(|spawn(?:Sync)?\s*\(|\.exec\s*\()/iu,
    message:
      "System-command or child-process behavior was detected. Confirm its purpose, scope, and user-facing explanation.",
  },
  {
    code: "release.destructive_operation.detected",
    pattern:
      /(?:(?:\bfs\.|\bpromises\.)(?:unlink|rmdir|rm)(?:Sync)?|\b(?:emptyTrash|trashItem|deleteFile))\s*\(/iu,
    message:
      "Deletion or destructive file behavior was detected. Confirm disclosure, user awareness, cancellation, and recovery behavior.",
  },
  {
    code: "release.remote_code.detected",
    pattern:
      /(?:\beval\s*\(|new\s+Function\s*\(|import\s*\(\s*["']https?:|new\s+(?:Shared)?Worker\s*\(\s*["']https?:)/iu,
    message:
      "Dynamic execution or remotely loaded executable code was detected. Confirm necessity and supply-chain protection.",
  },
  {
    code: "release.elevated_permission.detected",
    pattern:
      /(?:chmod|chown|sudo|requestPermission|systemPreferences|runWithPrivileges)\b/iu,
    message:
      "Permission or privileged-system behavior was detected. Confirm that it is necessary and clearly explained.",
  },
];

function evidenceForMatch(
  path: string,
  contents: string,
  match: RegExpExecArray,
): PreflightEvidence {
  const line = contents.slice(0, match.index).split("\n").length;
  return {
    path,
    line,
    excerpt: match[0].trim().slice(0, 160),
  };
}

function sanitizedNetworkEvidence(
  path: string,
  contents: string,
  match: RegExpExecArray,
): PreflightEvidence {
  const evidence = evidenceForMatch(path, contents, match);
  try {
    const url = new URL(match[0]);
    return {
      path,
      ...(evidence.line === undefined ? {} : { line: evidence.line }),
      excerpt: `${url.protocol}//${url.hostname}${url.port === "" ? "" : `:${url.port}`}`,
    };
  } catch {
    return {
      path,
      ...(evidence.line === undefined ? {} : { line: evidence.line }),
      excerpt: "network URL",
    };
  }
}

const runtimeTextExtensions = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".mjs",
  ".ts",
  ".tsx",
]);

function behaviorWarnings(
  entries: readonly ReleaseEntry[],
): readonly PreflightFinding<PreflightWarningCode>[] {
  const warnings: PreflightFinding<PreflightWarningCode>[] = [];
  for (const entry of entries) {
    if (
      entry.kind !== "file" ||
      entry.contents === undefined ||
      !runtimeTextExtensions.has(pathExtension(entry.path)) ||
      entry.path === "manifest.json"
    ) {
      continue;
    }

    const networkMatch = /https?:\/\/[^\s"'`<>]+/iu.exec(entry.contents);
    if (networkMatch !== null) {
      warnings.push(
        warningFinding(
          "release.network_reference.detected",
          "A network reference was detected. Confirm its destination, transmitted data, purpose, and required disclosure.",
          entry.path,
          [sanitizedNetworkEvidence(entry.path, entry.contents, networkMatch)],
        ),
      );
    }

    for (const behavior of behaviorPatterns) {
      const match = behavior.pattern.exec(entry.contents);
      if (match === null) {
        continue;
      }
      const evidence =
        behavior.code === "release.local_network_reference.detected" ||
        behavior.code === "release.unencrypted_http.detected"
          ? sanitizedNetworkEvidence(entry.path, entry.contents, match)
          : evidenceForMatch(entry.path, entry.contents, match);
      warnings.push(
        warningFinding(behavior.code, behavior.message, entry.path, [evidence]),
      );
    }
  }
  return warnings;
}

function listingErrors(
  manifest: ManifestJSON,
): readonly PreflightFinding<PreflightErrorCode>[] {
  const errors: PreflightFinding<PreflightErrorCode>[] = [];
  const codePointCount = [...manifest.name].length;
  if (codePointCount > 30) {
    errors.push(
      errorFinding(
        "release.name.too_long",
        `Plugin names must contain at most 30 Unicode code points; found ${codePointCount}.`,
        "manifest.json#name",
        [
          {
            path: "manifest.json#name",
            excerpt: `${codePointCount} Unicode code points`,
          },
        ],
      ),
    );
  }

  const wordCount = manifest.name.trim().split(/\s+/u).filter(Boolean).length;
  if (wordCount > 6) {
    errors.push(
      errorFinding(
        "release.name.too_many_words",
        `Plugin names in whitespace-delimited languages must contain at most 6 words; found ${wordCount}.`,
        "manifest.json#name",
        [{ path: "manifest.json#name", excerpt: `${wordCount} words` }],
      ),
    );
  }

  const keywordCount = manifest.keywords.length;
  if (keywordCount > 6) {
    errors.push(
      errorFinding(
        "release.keywords.too_many",
        `Plugin keywords must contain at most 6 entries; found ${keywordCount}.`,
        "manifest.json#keywords",
        [
          {
            path: "manifest.json#keywords",
            excerpt: `${keywordCount} entries`,
          },
        ],
      ),
    );
  }
  return errors;
}

function disclosureWarnings(
  manifest: ManifestJSON,
): readonly PreflightFinding<PreflightWarningCode>[] {
  const fields = [
    manifest.platform !== undefined && manifest.platform !== "all"
      ? "platform"
      : undefined,
    manifest.arch !== undefined && manifest.arch !== "all" ? "arch" : undefined,
    manifest.dependencies !== undefined && manifest.dependencies.length > 0
      ? "dependencies"
      : undefined,
  ].filter((value): value is string => value !== undefined);
  if (fields.length === 0) {
    return [];
  }
  return [
    warningFinding(
      "release.disclosure_candidate.detected",
      "A platform, architecture, or dependency limitation was detected. Confirm that limitations affecting core use are disclosed.",
      "manifest.json",
      fields.map((field) => ({ path: `manifest.json#${field}` })),
    ),
  ];
}

export async function inspectRelease(root: string): Promise<PreflightResult> {
  const errors: PreflightFinding<PreflightErrorCode>[] = [];
  const warnings: PreflightFinding<PreflightWarningCode>[] = [];
  const snapshot = await captureRelease(root);
  const packageFindings = packageContentFindings(snapshot);
  errors.push(...packageFindings.errors);
  warnings.push(...packageFindings.warnings);
  warnings.push(...behaviorWarnings(snapshot.entries));

  const manifestRead = readManifest(snapshot);
  errors.push(...manifestRead.errors);

  if (manifestRead.input !== undefined) {
    const manifestResult = manifestErrors(manifestRead.input);
    if (!manifestResult.success) {
      errors.push(...manifestResult.errors);
    } else {
      const { manifest } = manifestResult;
      errors.push(...listingErrors(manifest));
      warnings.push(...disclosureWarnings(manifest));

      if (manifest.devTools === true) {
        errors.push(
          errorFinding(
            "release.dev_tools.enabled",
            "devTools must not be enabled in a release candidate.",
            "manifest.json#devTools",
          ),
        );
      }

      const logo = inspectReferencedFile(
        snapshot,
        manifest.logo,
        "release.logo.missing",
        "Logo",
      );
      if (!logo.success) {
        errors.push(logo.error);
      }

      if ("main" in manifest && manifest.main !== undefined) {
        const html = inspectReferencedFile(
          snapshot,
          manifest.main.url,
          "release.html.missing",
          "HTML entrypoint",
        );
        if (!html.success) {
          errors.push(html.error);
        } else {
          const sources = moduleScriptSources(html.contents);
          if (sources.length === 0) {
            errors.push(
              errorFinding(
                "release.entrypoint.missing",
                "HTML does not reference a module entrypoint.",
                html.path,
              ),
            );
          }

          for (const source of sources) {
            const entrypoint = inspectReferencedFile(
              snapshot,
              source,
              "release.entrypoint.missing",
              "Compiled entrypoint",
              posix.dirname(html.path),
            );
            if (!entrypoint.success) {
              errors.push(entrypoint.error);
            }
          }
        }
      }
    }
  }

  return {
    schemaVersion: 2,
    mechanicalStatus: errors.length === 0 ? "pass" : "fail",
    errors,
    warnings,
    manualChecks,
  };
}

function renderFindings(
  title: string,
  findings: readonly PreflightFinding[],
): string {
  const lines = [`${title} (${findings.length})`];
  if (findings.length === 0) {
    lines.push("  None.");
  } else {
    for (const finding of findings) {
      lines.push(
        `  [${finding.severity}] [${finding.code}]${finding.path === undefined ? "" : ` ${finding.path}:`} ${finding.message}`,
      );
      for (const evidence of finding.evidence) {
        lines.push(
          `    evidence: ${evidence.path}${evidence.line === undefined ? "" : `:${evidence.line}`}${evidence.excerpt === undefined ? "" : ` — ${evidence.excerpt}`}`,
        );
      }
      lines.push(
        `    rule: ${finding.rule.sourceUrl} (checked ${finding.rule.checkedAt})`,
      );
    }
  }
  return lines.join("\n");
}

export function renderPreflightResult(result: PreflightResult): string {
  const manual = [
    `Manual checks (${result.manualChecks.length})`,
    ...result.manualChecks.flatMap((check) => [
      `  [ ] [${check.severity}] [${check.code}] ${check.message}`,
      `    rule: ${check.rule.sourceUrl} (checked ${check.rule.checkedAt})`,
    ]),
  ].join("\n");
  const conclusion =
    result.mechanicalStatus === "pass"
      ? "No mechanical blockers were detected. Manual checks and Eagle Plugin Center review are still required."
      : "Mechanical blockers were detected. Resolve them before packaging; manual checks and Eagle Plugin Center review are still required.";

  return `Eagle release Preflight

${renderFindings("Errors", result.errors)}

${renderFindings("Warnings", result.warnings)}

${manual}

${conclusion}
`;
}
