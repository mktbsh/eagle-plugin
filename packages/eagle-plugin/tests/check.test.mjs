import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import test from "node:test";

const packageRoot = resolve(import.meta.dirname, "..");
const repositoryRoot = resolve(packageRoot, "../..");
const cliPath = join(packageRoot, "dist", "cli.js");
const fixturePath = join(import.meta.dirname, "fixtures", "window-release");
const scratchParent = join(repositoryRoot, ".context", "eagle-check-tests");

async function createProject(t) {
  await mkdir(scratchParent, { recursive: true });
  const projectPath = await mkdtemp(join(scratchParent, "project-"));
  t.after(() => rm(projectPath, { recursive: true, force: true }));
  await cp(fixturePath, join(projectPath, "dist"), { recursive: true });
  return projectPath;
}

function runCheck(projectPath, args = []) {
  return spawnSync(process.execPath, [cliPath, "check", ...args], {
    cwd: projectPath,
    encoding: "utf8",
  });
}

async function readManifest(projectPath) {
  return JSON.parse(
    await readFile(join(projectPath, "dist", "manifest.json"), "utf8"),
  );
}

async function writeManifest(projectPath, manifest) {
  await writeFile(
    join(projectPath, "dist", "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
}

test("reports a valid Window release for a person", async (t) => {
  const projectPath = await createProject(t);
  const result = runCheck(projectPath);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
  assert.match(result.stdout, /Errors \(0\)/u);
  assert.match(result.stdout, /Warnings \(0\)/u);
  assert.match(result.stdout, /Manual checks \(5\)/u);
  assert.match(result.stdout, /\[manual\] \[manual\.functionality\]/u);
  assert.match(result.stdout, /rule: https:\/\//u);
  assert.match(result.stdout, /checked 2026-08-01/u);
  assert.match(result.stdout, /No mechanical blockers were detected/u);
  assert.match(
    result.stdout,
    /Eagle Plugin Center review (?:is|are) still required/u,
  );
  assert.doesNotMatch(result.stdout, /approved|certified/iu);
});

test("returns the documented JSON shape for the same assessment", async (t) => {
  const projectPath = await createProject(t);
  const processResult = runCheck(projectPath, ["--json"]);

  assert.equal(processResult.status, 0, processResult.stderr);
  assert.equal(processResult.stderr, "");
  const result = JSON.parse(processResult.stdout);
  assert.deepEqual(Object.keys(result), [
    "schemaVersion",
    "mechanicalStatus",
    "errors",
    "warnings",
    "manualChecks",
  ]);
  assert.equal(result.schemaVersion, 2);
  assert.equal(result.mechanicalStatus, "pass");
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
  assert.ok(
    result.manualChecks.every(
      (check) =>
        check.severity === "manual" &&
        check.rule.sourceUrl.startsWith("https://developer.eagle.cool/") &&
        check.rule.checkedAt === "2026-08-01",
    ),
  );
  assert.deepEqual(
    result.manualChecks.map((check) => check.code),
    [
      "manual.functionality",
      "manual.visual_assets",
      "manual.cancellation_and_data_safety",
      "manual.author_understanding",
      "manual.fresh_install",
    ],
  );
});

test("reports stable error codes and a nonzero status for mechanical blockers", async (t) => {
  const cases = [
    {
      name: "missing manifest",
      code: "release.manifest.missing",
      change: (projectPath) =>
        rm(join(projectPath, "dist", "manifest.json"), { force: true }),
    },
    {
      name: "invalid manifest JSON",
      code: "release.manifest.invalid_json",
      change: (projectPath) =>
        writeFile(
          join(projectPath, "dist", "manifest.json"),
          "{ invalid\n",
          "utf8",
        ),
    },
    {
      name: "invalid manifest",
      code: "manifest.invalid_type",
      change: async (projectPath) => {
        const manifest = await readManifest(projectPath);
        manifest.name = 42;
        await writeManifest(projectPath, manifest);
      },
    },
    {
      name: "missing HTML",
      code: "release.html.missing",
      change: (projectPath) =>
        rm(join(projectPath, "dist", "index.html"), { force: true }),
    },
    {
      name: "missing logo",
      code: "release.logo.missing",
      change: (projectPath) =>
        rm(join(projectPath, "dist", "logo.svg"), { force: true }),
    },
    {
      name: "missing entrypoint",
      code: "release.entrypoint.missing",
      change: (projectPath) =>
        rm(join(projectPath, "dist", "assets", "window.js"), { force: true }),
    },
    {
      name: "development tools",
      code: "release.dev_tools.enabled",
      change: async (projectPath) => {
        const manifest = await readManifest(projectPath);
        manifest.devTools = true;
        await writeManifest(projectPath, manifest);
      },
    },
    {
      name: "unsafe reference",
      code: "release.reference.unsafe",
      change: async (projectPath) => {
        const manifest = await readManifest(projectPath);
        manifest.logo = "../outside.svg";
        await writeManifest(projectPath, manifest);
      },
    },
    {
      name: "absolute reference",
      code: "release.reference.unsafe",
      change: async (projectPath) => {
        const manifest = await readManifest(projectPath);
        manifest.logo = "C:/outside.svg";
        await writeManifest(projectPath, manifest);
      },
    },
    {
      name: "secret-like file",
      code: "release.sensitive_file.detected",
      change: (projectPath) =>
        writeFile(
          join(projectPath, "dist", ".env.production"),
          "TOKEN=secret\n",
          "utf8",
        ),
    },
    {
      name: "npm token",
      code: "release.sensitive_file.detected",
      change: (projectPath) =>
        writeFile(
          join(projectPath, "dist", ".npmrc"),
          "//registry.example/:_authToken=secret\n",
          "utf8",
        ),
    },
    {
      name: "version-control metadata",
      code: "release.development_artifact.detected",
      change: async (projectPath) => {
        const directory = join(projectPath, "dist", ".git");
        await mkdir(directory);
        await writeFile(join(directory, "config"), "[core]\n", "utf8");
      },
    },
    {
      name: "editor metadata",
      code: "release.development_artifact.detected",
      change: (projectPath) => mkdir(join(projectPath, "dist", ".vscode")),
    },
    {
      name: "cache directory",
      code: "release.development_artifact.detected",
      change: (projectPath) => mkdir(join(projectPath, "dist", "__pycache__")),
    },
    {
      name: "temporary file",
      code: "release.development_artifact.detected",
      change: (projectPath) =>
        writeFile(join(projectPath, "dist", "debug.log"), "log\n", "utf8"),
    },
    {
      name: "nested archive",
      code: "release.nested_archive.detected",
      change: (projectPath) =>
        writeFile(join(projectPath, "dist", "backup.zip"), "archive", "utf8"),
    },
    {
      name: "symbolic link",
      code: "release.symlink.detected",
      change: (projectPath) =>
        symlink("../outside", join(projectPath, "dist", "escape")),
    },
    {
      name: "name code point limit",
      code: "release.name.too_long",
      change: async (projectPath) => {
        const manifest = await readManifest(projectPath);
        manifest.name = "名".repeat(31);
        await writeManifest(projectPath, manifest);
      },
    },
    {
      name: "name word limit",
      code: "release.name.too_many_words",
      change: async (projectPath) => {
        const manifest = await readManifest(projectPath);
        manifest.name = "one two three four five six seven";
        await writeManifest(projectPath, manifest);
      },
    },
    {
      name: "keyword limit",
      code: "release.keywords.too_many",
      change: async (projectPath) => {
        const manifest = await readManifest(projectPath);
        manifest.keywords = ["a", "b", "c", "d", "e", "f", "g"];
        await writeManifest(projectPath, manifest);
      },
    },
  ];

  for (const fixture of cases) {
    await t.test(fixture.name, async (t) => {
      const projectPath = await createProject(t);
      await fixture.change(projectPath);
      const processResult = runCheck(projectPath, ["--json"]);

      assert.equal(processResult.status, 1);
      assert.equal(processResult.stderr, "");
      const result = JSON.parse(processResult.stdout);
      assert.equal(result.mechanicalStatus, "fail");
      assert.ok(
        result.errors.some((error) => error.code === fixture.code),
        `${fixture.code} was not reported: ${processResult.stdout}`,
      );
      const finding = result.errors.find(
        (error) => error.code === fixture.code,
      );
      assert.equal(finding.severity, "error");
      assert.ok(finding.evidence.length > 0);
      assert.match(
        finding.rule.sourceUrl,
        /^https:\/\/developer\.eagle\.cool\//u,
      );
      assert.equal(finding.rule.checkedAt, "2026-08-01");
      assert.equal(result.manualChecks.length, 5);
    });
  }
});

test("keeps each context-dependent finding warning-only", async (t) => {
  const cases = [
    {
      name: "native binary",
      code: "release.binary.detected",
      change: (projectPath) =>
        writeFile(join(projectPath, "dist", "helper.exe"), "binary", "utf8"),
    },
    {
      name: "external network",
      code: "release.network_reference.detected",
      change: (projectPath) =>
        writeFile(
          join(projectPath, "dist", "assets", "window.js"),
          'fetch("https://api.example.com/items?token=secret#private");\n',
          "utf8",
        ),
    },
    {
      name: "local network",
      code: "release.local_network_reference.detected",
      change: (projectPath) =>
        writeFile(
          join(projectPath, "dist", "assets", "window.js"),
          'fetch("http://127.0.0.1:3000/items");\n',
          "utf8",
        ),
    },
    {
      name: "unencrypted HTTP",
      code: "release.unencrypted_http.detected",
      change: (projectPath) =>
        writeFile(
          join(projectPath, "dist", "assets", "window.js"),
          'fetch("http://service.example/items");\n',
          "utf8",
        ),
    },
    {
      name: "system command",
      code: "release.system_command.detected",
      change: (projectPath) =>
        writeFile(
          join(projectPath, "dist", "assets", "window.js"),
          'child_process.execFile("helper");\n',
          "utf8",
        ),
    },
    {
      name: "destructive operation",
      code: "release.destructive_operation.detected",
      change: (projectPath) =>
        writeFile(
          join(projectPath, "dist", "assets", "window.js"),
          'fs.rm("selected-file");\n',
          "utf8",
        ),
    },
    {
      name: "remote code",
      code: "release.remote_code.detected",
      change: (projectPath) =>
        writeFile(
          join(projectPath, "dist", "assets", "window.js"),
          "eval(downloadedSource);\n",
          "utf8",
        ),
    },
    {
      name: "permission",
      code: "release.elevated_permission.detected",
      change: (projectPath) =>
        writeFile(
          join(projectPath, "dist", "assets", "window.js"),
          'chmod("helper", 0o755);\n',
          "utf8",
        ),
    },
    {
      name: "listing disclosure",
      code: "release.disclosure_candidate.detected",
      change: async (projectPath) => {
        const manifest = await readManifest(projectPath);
        manifest.platform = "mac";
        await writeManifest(projectPath, manifest);
      },
    },
    {
      name: "runtime dependency directory",
      code: "release.dependency_directory.detected",
      change: (projectPath) => mkdir(join(projectPath, "dist", "node_modules")),
    },
  ];

  for (const fixture of cases) {
    await t.test(fixture.name, async (t) => {
      const projectPath = await createProject(t);
      await fixture.change(projectPath);
      const processResult = runCheck(projectPath, ["--json"]);

      assert.equal(processResult.status, 0, processResult.stderr);
      const result = JSON.parse(processResult.stdout);
      assert.equal(result.mechanicalStatus, "pass");
      assert.deepEqual(result.errors, []);
      const finding = result.warnings.find(
        (warning) => warning.code === fixture.code,
      );
      assert.ok(finding, `${fixture.code} was not reported`);
      assert.equal(finding.severity, "warning");
      assert.ok(finding.evidence.length > 0);
      assert.match(
        finding.rule.sourceUrl,
        /^https:\/\/developer\.eagle\.cool\//u,
      );
      assert.equal(finding.rule.checkedAt, "2026-08-01");

      if (fixture.code === "release.network_reference.detected") {
        assert.equal(finding.evidence[0].excerpt, "https://api.example.com");
        assert.doesNotMatch(
          JSON.stringify(finding.evidence),
          /secret|private/u,
        );
      }
    });
  }
});

test("accepts exact listing limits and non-secret metadata", async (t) => {
  const projectPath = await createProject(t);
  const manifest = await readManifest(projectPath);
  manifest.name = "aaaa bbbb cccc dddd eeee fffff";
  manifest.keywords = ["a", "b", "c", "d", "e", "f"];
  await writeManifest(projectPath, manifest);
  await writeFile(
    join(projectPath, "dist", ".npmrc"),
    "registry=https://registry.npmjs.org/\n",
    "utf8",
  );
  await writeFile(
    join(projectPath, "dist", "README.md"),
    "Support: https://support.example.com\n",
    "utf8",
  );

  const processResult = runCheck(projectPath, ["--json"]);
  assert.equal(processResult.status, 0, processResult.stderr);
  const result = JSON.parse(processResult.stdout);
  assert.equal(result.mechanicalStatus, "pass");
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
});

test("renders the same warning code, evidence, severity, and rule for people", async (t) => {
  const projectPath = await createProject(t);
  await writeFile(
    join(projectPath, "dist", "assets", "window.js"),
    'fetch("https://api.example.com/items");\n',
    "utf8",
  );

  const result = runCheck(projectPath);
  assert.equal(result.status, 0, result.stderr);
  assert.match(
    result.stdout,
    /\[warning\] \[release\.network_reference\.detected\] assets\/window\.js:/u,
  );
  assert.match(
    result.stdout,
    /evidence: assets\/window\.js:1 — https:\/\/api\.example\.com/u,
  );
  assert.match(result.stdout, /rule: https:\/\//u);
  assert.match(result.stdout, /checked 2026-08-01/u);
});

test("writes help to stdout and usage diagnostics to stderr", async (t) => {
  const projectPath = await createProject(t);
  const help = runCheck(projectPath, ["--help"]);
  assert.equal(help.status, 0);
  assert.match(help.stdout, /eagle check \[--json\]/u);
  assert.equal(help.stderr, "");

  const invalid = runCheck(projectPath, ["unexpected"]);
  assert.equal(invalid.status, 2);
  assert.equal(invalid.stdout, "");
  assert.match(invalid.stderr, /^eagle check:/u);
});
