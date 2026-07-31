import { stat } from "node:fs/promises";
import { join } from "node:path";
import { EagleProjectError } from "./errors.js";

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error.code === "ENOENT" || error.code === "ENOTDIR")
    ) {
      return false;
    }
    throw error;
  }
}

async function existingPaths(
  paths: readonly string[],
): Promise<readonly string[]> {
  const results = await Promise.all(
    paths.map(async (path) => ({ path, exists: await exists(path) })),
  );
  return results.filter((result) => result.exists).map((result) => result.path);
}

export interface WindowProject {
  readonly root: string;
  readonly configPath: string;
  readonly entrypointPath: string;
  readonly outputPath: string;
  readonly stagingPath: string;
}

export async function discoverWindowProject(
  root: string,
): Promise<WindowProject> {
  const entrypointsPath = join(root, "entrypoints");
  const windowEntrypoints = await existingPaths([
    join(entrypointsPath, "window.ts"),
    join(entrypointsPath, "window.tsx"),
  ]);
  const serviceEntrypoints = await existingPaths([
    join(entrypointsPath, "service.ts"),
    join(entrypointsPath, "service.tsx"),
  ]);
  const formatsPath = join(entrypointsPath, "formats");
  const hasFormats = await exists(formatsPath);

  const detectedTopologies = [
    windowEntrypoints.length > 0 ? "Window" : undefined,
    serviceEntrypoints.length > 0 ? "Service" : undefined,
    hasFormats ? "Formats" : undefined,
  ].filter((topology): topology is string => topology !== undefined);

  if (detectedTopologies.length > 1) {
    throw new EagleProjectError(
      `Conflicting plugin topology: ${detectedTopologies.join(", ")} entrypoints cannot coexist`,
    );
  }

  if (windowEntrypoints.length === 0) {
    if (detectedTopologies.length === 1) {
      throw new EagleProjectError(
        `${detectedTopologies[0]} plugins are not supported yet; add entrypoints/window.ts for a Window plugin`,
      );
    }
    throw new EagleProjectError(
      "No plugin entrypoint found; add entrypoints/window.ts",
    );
  }

  if (windowEntrypoints.length > 1) {
    throw new EagleProjectError(
      "Ambiguous Window entrypoint: keep only one of entrypoints/window.ts or entrypoints/window.tsx",
    );
  }

  const entrypointPath = windowEntrypoints[0];
  if (entrypointPath?.endsWith(".tsx")) {
    throw new EagleProjectError(
      "React Window entrypoints are not supported yet; use entrypoints/window.ts",
    );
  }

  if (entrypointPath === undefined) {
    throw new EagleProjectError("No Window entrypoint found");
  }

  return {
    root,
    configPath: join(root, "eagle.config.ts"),
    entrypointPath,
    outputPath: join(root, "dist"),
    stagingPath: join(root, ".eagle-plugin-build"),
  };
}
