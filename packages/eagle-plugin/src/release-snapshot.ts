import type { Dirent } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, posix } from "node:path";
import { EagleProjectError } from "./errors.js";

export interface ReleaseEntry {
  readonly path: string;
  readonly kind: "directory" | "file" | "symlink";
  readonly contents?: string;
}

export interface ReleaseSnapshot {
  readonly entries: readonly ReleaseEntry[];
  readonly byPath: ReadonlyMap<string, ReleaseEntry>;
}

const textExtensions = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".key",
  ".md",
  ".mjs",
  ".pem",
  ".php",
  ".py",
  ".rb",
  ".sh",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".xml",
  ".yaml",
  ".yml",
]);

function isMissing(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

function shouldRead(path: string): boolean {
  const name = posix.basename(path).toLowerCase();
  return (
    textExtensions.has(extname(name)) ||
    name === ".npmrc" ||
    name === "license" ||
    name.startsWith("readme")
  );
}

async function captureDirectory(
  root: string,
  directory: string,
  entries: ReleaseEntry[],
): Promise<void> {
  const absoluteDirectory =
    directory.length === 0 ? root : join(root, ...directory.split("/"));
  let children: Dirent<string>[];
  try {
    children = await readdir(absoluteDirectory, { withFileTypes: true });
  } catch (error) {
    if (directory.length === 0 && isMissing(error)) {
      return;
    }
    throw new EagleProjectError(
      `Unable to inspect release directory: ${directory || "."}`,
      { cause: error },
    );
  }

  children.sort((left, right) =>
    left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
  );
  for (const child of children) {
    const path =
      directory.length === 0 ? child.name : `${directory}/${child.name}`;
    if (child.isSymbolicLink()) {
      entries.push({ path, kind: "symlink" });
      continue;
    }
    if (child.isDirectory()) {
      entries.push({ path, kind: "directory" });
      await captureDirectory(root, path, entries);
      continue;
    }
    if (!child.isFile()) {
      entries.push({ path, kind: "symlink" });
      continue;
    }

    if (!shouldRead(path)) {
      entries.push({ path, kind: "file" });
      continue;
    }
    try {
      entries.push({
        path,
        kind: "file",
        contents: await readFile(join(root, ...path.split("/")), "utf8"),
      });
    } catch (error) {
      throw new EagleProjectError(`Unable to read release file: ${path}`, {
        cause: error,
      });
    }
  }
}

export async function captureRelease(root: string): Promise<ReleaseSnapshot> {
  const entries: ReleaseEntry[] = [];
  await captureDirectory(root, "", entries);
  return {
    entries,
    byPath: new Map(entries.map((entry) => [entry.path, entry])),
  };
}
