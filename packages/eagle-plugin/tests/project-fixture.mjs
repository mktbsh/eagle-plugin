import { spawn } from "node:child_process";
import { cp, mkdir, mkdtemp, symlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const packageRoot = fileURLToPath(new URL("..", import.meta.url));
export const repositoryRoot = fileURLToPath(
  new URL("../../..", import.meta.url),
);
export const contextRoot = join(repositoryRoot, ".context");
export const cliPath = join(packageRoot, "dist", "cli.js");

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

export async function runCli(args, cwd) {
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

export async function prepareFixture(name, prefix = "eagle-project-") {
  await mkdir(contextRoot, { recursive: true });
  const projectRoot = await mkdtemp(join(contextRoot, prefix));
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
