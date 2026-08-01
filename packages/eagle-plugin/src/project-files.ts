import { stat } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { EagleProjectError } from "./errors.js";

export async function requireFile(path: string, label: string): Promise<void> {
  try {
    const file = await stat(path);
    if (!file.isFile()) {
      throw new EagleProjectError(`${label} is not a file: ${path}`);
    }
  } catch (error) {
    if (error instanceof EagleProjectError) {
      throw error;
    }
    throw new EagleProjectError(`${label} does not exist: ${path}`, {
      cause: error,
    });
  }
}

export function resolveInside(root: string, projectPath: string): string {
  const resolvedPath = resolve(root, projectPath);
  const relativePath = relative(root, resolvedPath);
  if (
    relativePath === ".." ||
    relativePath.startsWith(`..${sep}`) ||
    relativePath === ""
  ) {
    throw new EagleProjectError(
      `Path must stay inside the project: ${projectPath}`,
    );
  }
  return resolvedPath;
}
