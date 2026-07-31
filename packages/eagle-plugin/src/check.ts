import { lstat, readFile } from "node:fs/promises";
import { join, posix } from "node:path";
import {
  type ManifestIssueCode,
  type ManifestJSON,
  validateManifest,
} from "eagle-plugin-manifest";
import { EagleProjectError } from "./errors.js";

export type PreflightErrorCode =
  | ManifestIssueCode
  | "release.manifest.missing"
  | "release.manifest.invalid_json"
  | "release.reference.unsafe"
  | "release.logo.missing"
  | "release.html.missing"
  | "release.entrypoint.missing"
  | "release.dev_tools.enabled";

export type PreflightWarningCode = "release.network_reference.detected";

export type ManualCheckCode =
  | "manual.functionality"
  | "manual.visual_assets"
  | "manual.cancellation_and_data_safety"
  | "manual.author_understanding"
  | "manual.fresh_install";

export interface PreflightFinding<Code extends string = string> {
  readonly code: Code;
  readonly message: string;
  readonly path?: string;
}

export interface ManualCheck {
  readonly code: ManualCheckCode;
  readonly message: string;
}

export interface PreflightResult {
  readonly schemaVersion: 1;
  readonly mechanicalStatus: "pass" | "fail";
  readonly errors: readonly PreflightFinding<PreflightErrorCode>[];
  readonly warnings: readonly PreflightFinding<PreflightWarningCode>[];
  readonly manualChecks: readonly ManualCheck[];
}

const manualChecks: readonly ManualCheck[] = [
  {
    code: "manual.functionality",
    message: "Confirm that the plugin behavior and listing text are accurate.",
  },
  {
    code: "manual.visual_assets",
    message: "Confirm that the logo and listing images are relevant and final.",
  },
  {
    code: "manual.cancellation_and_data_safety",
    message:
      "Confirm cancellation behavior and the safety of every data-changing action.",
  },
  {
    code: "manual.author_understanding",
    message:
      "Understand and test all included code, including AI-assisted changes.",
  },
  {
    code: "manual.fresh_install",
    message:
      "Pack with Eagle and test a freshly installed .eagleplugin artifact.",
  },
];

function pathLabel(path: readonly (string | number)[]): string {
  return path.length === 0
    ? "manifest.json"
    : `manifest.json#${path.join(".")}`;
}

function missingFileError(
  code: PreflightErrorCode,
  label: string,
  path: string,
): PreflightFinding<PreflightErrorCode> {
  return {
    code,
    message: `${label} does not exist in the release candidate.`,
    path,
  };
}

function isMissing(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

async function isFile(root: string, path: string): Promise<boolean> {
  try {
    return (await lstat(join(root, ...path.split("/")))).isFile();
  } catch (error) {
    if (isMissing(error)) {
      return false;
    }
    throw new EagleProjectError(`Unable to inspect release file: ${path}`, {
      cause: error,
    });
  }
}

async function readReleaseFile(root: string, path: string): Promise<string> {
  try {
    return await readFile(join(root, ...path.split("/")), "utf8");
  } catch (error) {
    throw new EagleProjectError(`Unable to read release file: ${path}`, {
      cause: error,
    });
  }
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
      error: {
        code: "release.reference.unsafe",
        message: "Release references must stay inside the release directory.",
        path: value,
      },
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

function networkWarning(
  path: string,
  contents: string,
): PreflightFinding<PreflightWarningCode> | undefined {
  if (!/https?:\/\//iu.test(contents)) {
    return undefined;
  }
  return {
    code: "release.network_reference.detected",
    message:
      "A network reference was detected. Confirm its purpose and disclose it where required.",
    path,
  };
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
    errors: result.issues.map((issue) => ({
      code: issue.code,
      message: issue.message,
      path: pathLabel(issue.path),
    })),
  };
}

interface ManifestReadResult {
  readonly input?: unknown;
  readonly errors: readonly PreflightFinding<PreflightErrorCode>[];
}

async function readManifest(root: string): Promise<ManifestReadResult> {
  const path = "manifest.json";
  if (!(await isFile(root, path))) {
    return {
      errors: [missingFileError("release.manifest.missing", "Manifest", path)],
    };
  }

  const source = await readReleaseFile(root, path);
  try {
    return { input: JSON.parse(source) as unknown, errors: [] };
  } catch {
    return {
      errors: [
        {
          code: "release.manifest.invalid_json",
          message: "manifest.json is not valid JSON.",
          path,
        },
      ],
    };
  }
}

async function inspectReferencedFile(
  root: string,
  value: string,
  missingCode: PreflightErrorCode,
  label: string,
  baseDirectory = "",
): Promise<
  | {
      readonly success: true;
      readonly path: string;
      readonly contents: string;
    }
  | {
      readonly success: false;
      readonly error: PreflightFinding<PreflightErrorCode>;
    }
> {
  const reference = resolveReleaseReference(value, baseDirectory);
  if (!reference.success) {
    return reference;
  }
  if (!(await isFile(root, reference.path))) {
    return {
      success: false,
      error: missingFileError(missingCode, label, reference.path),
    };
  }
  return {
    success: true,
    path: reference.path,
    contents: await readReleaseFile(root, reference.path),
  };
}

export async function inspectRelease(root: string): Promise<PreflightResult> {
  const errors: PreflightFinding<PreflightErrorCode>[] = [];
  const warnings: PreflightFinding<PreflightWarningCode>[] = [];
  const manifestRead = await readManifest(root);
  errors.push(...manifestRead.errors);

  if (manifestRead.input !== undefined) {
    const manifestResult = manifestErrors(manifestRead.input);
    if (!manifestResult.success) {
      errors.push(...manifestResult.errors);
    } else {
      const { manifest } = manifestResult;
      if (manifest.devTools === true) {
        errors.push({
          code: "release.dev_tools.enabled",
          message: "devTools must not be enabled in a release candidate.",
          path: "manifest.json#devTools",
        });
      }

      const logo = await inspectReferencedFile(
        root,
        manifest.logo,
        "release.logo.missing",
        "Logo",
      );
      if (!logo.success) {
        errors.push(logo.error);
      }

      if ("main" in manifest && manifest.main !== undefined) {
        const html = await inspectReferencedFile(
          root,
          manifest.main.url,
          "release.html.missing",
          "HTML entrypoint",
        );
        if (!html.success) {
          errors.push(html.error);
        } else {
          const htmlWarning = networkWarning(html.path, html.contents);
          if (htmlWarning !== undefined) {
            warnings.push(htmlWarning);
          }

          const sources = moduleScriptSources(html.contents);
          if (sources.length === 0) {
            errors.push({
              code: "release.entrypoint.missing",
              message: "HTML does not reference a module entrypoint.",
              path: html.path,
            });
          }

          for (const source of sources) {
            const entrypoint = await inspectReferencedFile(
              root,
              source,
              "release.entrypoint.missing",
              "Compiled entrypoint",
              posix.dirname(html.path),
            );
            if (!entrypoint.success) {
              errors.push(entrypoint.error);
              continue;
            }
            const entrypointWarning = networkWarning(
              entrypoint.path,
              entrypoint.contents,
            );
            if (entrypointWarning !== undefined) {
              warnings.push(entrypointWarning);
            }
          }
        }
      }
    }
  }

  return {
    schemaVersion: 1,
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
    lines.push(
      ...findings.map(
        (finding) =>
          `  [${finding.code}]${finding.path === undefined ? "" : ` ${finding.path}:`} ${finding.message}`,
      ),
    );
  }
  return lines.join("\n");
}

export function renderPreflightResult(result: PreflightResult): string {
  const manual = [
    `Manual checks (${result.manualChecks.length})`,
    ...result.manualChecks.map(
      (check) => `  [ ] [${check.code}] ${check.message}`,
    ),
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
