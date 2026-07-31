import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { parseManifest } from "eagle-plugin-manifest";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const repositoryRoot = fileURLToPath(new URL("../../..", import.meta.url));
const contextRoot = join(repositoryRoot, ".context");
const cliPath = join(packageRoot, "dist", "cli.js");
const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

async function runCli(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliPath, ...args], {
      cwd,
      env: { ...process.env, NO_COLOR: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

async function prepareFixture(name) {
  await mkdir(contextRoot, { recursive: true });
  const projectRoot = await mkdtemp(join(contextRoot, "eagle-build-"));
  const fixtureRoot = join(packageRoot, "tests", "fixtures", name);
  await cp(fixtureRoot, projectRoot, { recursive: true });
  await writeFile(join(projectRoot, "logo.png"), onePixelPng);
  const packageLink = join(projectRoot, "node_modules", "eagle-plugin");
  await mkdir(dirname(packageLink), { recursive: true });
  await symlink(
    packageRoot,
    packageLink,
    process.platform === "win32" ? "junction" : "dir",
  );
  return projectRoot;
}

test("builds a Vanilla Window release candidate", async () => {
  const projectRoot = await prepareFixture("window-project");

  try {
    const result = await runCli(["build"], projectRoot);
    assert.equal(result.code, 0, result.stderr);
    assert.equal(result.stdout, "Built Eagle plugin in dist\n");
    assert.equal(result.stderr, "");

    const manifestInput = JSON.parse(
      await readFile(join(projectRoot, "dist", "manifest.json"), "utf8"),
    );
    const manifest = parseManifest(manifestInput);
    assert.equal(manifest.main.url, "index.html");
    assert.equal(manifest.main.width, 640);
    assert.equal(manifest.logo, "logo.png");

    const html = await readFile(
      join(projectRoot, "dist", "index.html"),
      "utf8",
    );
    assert.match(html, /src="\.\/assets\/window\.js"/u);
    assert.match(html, /href="\.\/assets\/.+\.css"/u);
    await readFile(join(projectRoot, "dist", "assets", "window.js"));
    await readFile(join(projectRoot, "dist", "logo.png"));
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

test("replaces stale framework output", async () => {
  const projectRoot = await prepareFixture("window-project");

  try {
    const firstBuild = await runCli(["build"], projectRoot);
    assert.equal(firstBuild.code, 0, firstBuild.stderr);
    await writeFile(join(projectRoot, "dist", "stale.txt"), "stale");

    const secondBuild = await runCli(["build"], projectRoot);
    assert.equal(secondBuild.code, 0, secondBuild.stderr);
    await assert.rejects(readFile(join(projectRoot, "dist", "stale.txt")));
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

test("rejects conflicting plugin topologies before build", async () => {
  const projectRoot = await prepareFixture("conflicting-project");

  try {
    const result = await runCli(["build"], projectRoot);
    assert.equal(result.code, 1);
    assert.equal(result.stdout, "");
    assert.match(result.stderr, /Conflicting plugin topology/u);
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

test("reports invalid typed configuration without a stack trace", async () => {
  const projectRoot = await prepareFixture("invalid-config-project");

  try {
    const result = await runCli(["build"], projectRoot);
    assert.equal(result.code, 1);
    assert.equal(result.stdout, "");
    assert.match(result.stderr, /window\.width/u);
    assert.doesNotMatch(result.stderr, /at .*eagle-plugin/u);
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

test("shows root and build help with conventional exit behavior", async () => {
  const rootHelp = await runCli([], tmpdir());
  assert.equal(rootHelp.code, 1);
  assert.match(rootHelp.stdout, /eagle build/u);
  assert.equal(rootHelp.stderr, "");

  const explicitHelp = await runCli(["--help"], tmpdir());
  assert.equal(explicitHelp.code, 0);
  assert.match(explicitHelp.stdout, /Commands:/u);

  const buildHelp = await runCli(["build", "-h"], tmpdir());
  assert.equal(buildHelp.code, 0);
  assert.match(buildHelp.stdout, /eagle\.config\.ts/u);
});
