import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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
  assert.equal(result.schemaVersion, 1);
  assert.equal(result.mechanicalStatus, "pass");
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
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
      assert.equal(result.manualChecks.length, 5);
    });
  }
});

test("keeps warning-only findings successful and separate from errors", async (t) => {
  const projectPath = await createProject(t);
  await writeFile(
    join(projectPath, "dist", "assets", "window.js"),
    'fetch("https://api.example.com/items");\n',
    "utf8",
  );

  const processResult = runCheck(projectPath, ["--json"]);
  assert.equal(processResult.status, 0, processResult.stderr);
  const result = JSON.parse(processResult.stdout);
  assert.equal(result.mechanicalStatus, "pass");
  assert.deepEqual(result.errors, []);
  assert.equal(result.warnings[0]?.code, "release.network_reference.detected");
  assert.equal(result.warnings[0]?.path, "assets/window.js");
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
