import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import test from "node:test";
import { parseManifest } from "../../eagle-plugin-manifest/dist/index.js";

const packageRoot = resolve(import.meta.dirname, "..");
const repositoryRoot = resolve(packageRoot, "../..");
const cliPath = join(packageRoot, "dist", "cli.js");
const scratchParent = join(
  repositoryRoot,
  ".context",
  "create-eagle-plugin-tests",
);

async function createScratch() {
  await mkdir(scratchParent, { recursive: true });
  return mkdtemp(join(scratchParent, "case-"));
}

function runGenerator(cwd, args, input) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: "utf8",
    input,
  });
}

function runPnpm(cwd, args) {
  return spawnSync("pnpm", args, {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      CI: "1",
    },
  });
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

test("shows help and requires complete non-interactive selections", () => {
  const help = runGenerator(repositoryRoot, ["--help"]);
  assert.equal(help.status, 0);
  assert.match(help.stdout, /--topology <topology>/u);
  assert.match(help.stdout, /--template <template>/u);

  const incomplete = runGenerator(repositoryRoot, []);
  assert.equal(incomplete.status, 2);
  assert.match(incomplete.stderr, /Non-interactive mode requires/u);
  assert.doesNotMatch(incomplete.stderr, /\n\s+at /u);

  const invalid = runGenerator(repositoryRoot, [
    "plugin",
    "--topology",
    "service",
    "--template",
    "vanilla-ts",
  ]);
  assert.equal(invalid.status, 2);
  assert.match(invalid.stderr, /Invalid topology: service/u);
});

test("creates the same Vanilla Window project interactively and non-interactively", async (t) => {
  const scratch = await createScratch();
  t.after(() => rm(scratch, { recursive: true, force: true }));

  const generated = runGenerator(scratch, [
    "sample-plugin",
    "--topology",
    "window",
    "--template",
    "vanilla-ts",
  ]);
  assert.equal(generated.status, 0, generated.stderr);
  assert.match(generated.stdout, /Created sample-plugin/u);

  const projectPath = join(scratch, "sample-plugin");
  const packageJson = await readJson(join(projectPath, "package.json"));
  assert.equal(packageJson.devDependencies["eagle-plugin"], "0.1.0");
  assert.equal(packageJson.devDependencies["eagle-plugin-dts"], "0.1.0");
  assert.equal(packageJson.scripts.typecheck, "tsc --noEmit");
  assert.equal(packageJson.scripts.dev, "eagle dev");
  assert.equal(packageJson.scripts.build, "eagle build");
  assert.equal(packageJson.scripts.check, "eagle check");
  assert.match(
    await readFile(join(projectPath, "env.d.ts"), "utf8"),
    /reference types="eagle-plugin-dts"/u,
  );
  assert.match(
    await readFile(join(projectPath, "env.d.ts"), "utf8"),
    /declare module "\*\.css"/u,
  );
  assert.match(
    await readFile(join(projectPath, "entrypoints", "window.ts"), "utf8"),
    /eagle\.app\.version/u,
  );
  assert.match(
    await readFile(join(projectPath, "eagle.config.ts"), "utf8"),
    /defineConfig/u,
  );
  const logo = await readFile(join(projectPath, "logo.png"));
  assert.deepEqual([...logo.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);

  const interactive = runGenerator(
    scratch,
    ["--interactive"],
    "prompted-plugin\n\n\n",
  );
  assert.equal(interactive.status, 0, interactive.stderr);
  assert.match(interactive.stdout, /Output directory/u);
  assert.match(interactive.stdout, /topology \(window\)/u);
  assert.match(interactive.stdout, /template \(vanilla-ts\)/u);
  assert.equal(
    (await readJson(join(scratch, "prompted-plugin", "package.json"))).name,
    "prompted-plugin",
  );
});

test("does not confuse cancellation or file-system failures with success", async (t) => {
  const scratch = await createScratch();
  t.after(() => rm(scratch, { recursive: true, force: true }));

  const cancelled = runGenerator(scratch, ["--interactive"], "");
  assert.equal(cancelled.status, 130);
  assert.match(cancelled.stderr, /cancelled\. No project was created/u);
  assert.doesNotMatch(cancelled.stdout, /Created/u);

  await writeFile(join(scratch, "not-a-directory"), "blocked", "utf8");
  const failed = runGenerator(scratch, [
    "not-a-directory",
    "--topology",
    "window",
    "--template",
    "vanilla-ts",
    "--force",
  ]);
  assert.equal(failed.status, 1);
  assert.match(failed.stderr, /not a regular directory/u);
  assert.doesNotMatch(failed.stdout, /Created/u);
});

test("requires permission before replacing a non-empty directory", async (t) => {
  const scratch = await createScratch();
  t.after(() => rm(scratch, { recursive: true, force: true }));

  const targetPath = join(scratch, "occupied");
  await mkdir(targetPath);
  await writeFile(join(targetPath, "sentinel.txt"), "keep", "utf8");

  const refused = runGenerator(scratch, [
    "occupied",
    "--topology",
    "window",
    "--template",
    "vanilla-ts",
  ]);
  assert.equal(refused.status, 1);
  assert.equal(
    await readFile(join(targetPath, "sentinel.txt"), "utf8"),
    "keep",
  );

  const replaced = runGenerator(scratch, [
    "occupied",
    "--topology",
    "window",
    "--template",
    "vanilla-ts",
    "--force",
  ]);
  assert.equal(replaced.status, 0, replaced.stderr);
  await assert.rejects(readFile(join(targetPath, "sentinel.txt"), "utf8"));
  assert.equal(
    (await readJson(join(targetPath, "package.json"))).name,
    "occupied",
  );
});

test("installs, typechecks, builds, and checks a generated project", async (t) => {
  const scratch = await createScratch();
  t.after(() => rm(scratch, { recursive: true, force: true }));

  const generated = runGenerator(scratch, [
    "installed-plugin",
    "--topology",
    "window",
    "--template",
    "vanilla-ts",
  ]);
  assert.equal(generated.status, 0, generated.stderr);

  const projectPath = join(scratch, "installed-plugin");
  const packagePath = join(projectPath, "package.json");
  const packageJson = await readJson(packagePath);
  packageJson.devDependencies["eagle-plugin"] = `link:${relative(
    projectPath,
    join(repositoryRoot, "packages", "eagle-plugin"),
  )}`;
  packageJson.devDependencies["eagle-plugin-dts"] = `link:${relative(
    projectPath,
    join(repositoryRoot, "packages", "eagle-plugin-dts"),
  )}`;
  packageJson.devDependencies["eagle-plugin-manifest"] = `link:${relative(
    projectPath,
    join(repositoryRoot, "packages", "eagle-plugin-manifest"),
  )}`;
  await writeFile(
    packagePath,
    `${JSON.stringify(packageJson, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    join(projectPath, "pnpm-workspace.yaml"),
    "packages: []\n",
    "utf8",
  );

  const install = runPnpm(projectPath, ["install", "--offline"]);
  assert.equal(install.status, 0, `${install.stdout}\n${install.stderr}`);

  const typecheck = runPnpm(projectPath, ["typecheck"]);
  assert.equal(typecheck.status, 0, `${typecheck.stdout}\n${typecheck.stderr}`);

  const build = runPnpm(projectPath, ["build"]);
  assert.equal(build.status, 0, `${build.stdout}\n${build.stderr}`);

  const check = runPnpm(projectPath, ["run", "check", "--json"]);
  assert.equal(check.status, 0, `${check.stdout}\n${check.stderr}`);
  assert.match(check.stdout, /"mechanicalStatus": "pass"/u);

  const manifest = await readJson(join(projectPath, "dist", "manifest.json"));
  const validatedManifest = parseManifest(manifest);
  assert.equal(validatedManifest.id, "installed-plugin");
  assert.equal(validatedManifest.logo, "logo.png");
  await readFile(join(projectPath, "dist", "logo.png"));
});
