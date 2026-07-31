import { randomUUID } from "node:crypto";
import { lstat, mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  parse,
  relative,
  resolve,
} from "node:path";
import { GenerationError } from "./errors.js";
import { createVanillaWindowProject } from "./template.js";

export type DestinationState =
  | "missing"
  | "empty-directory"
  | "nonempty-directory";

export interface GenerationSelection {
  readonly directory: string;
  readonly topology: "window";
  readonly template: "vanilla-ts";
}

function isMissing(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

export async function inspectDestination(
  targetPath: string,
): Promise<DestinationState> {
  try {
    const target = await lstat(targetPath);
    if (!target.isDirectory() || target.isSymbolicLink()) {
      throw new GenerationError(
        `Output path is not a regular directory: ${targetPath}`,
      );
    }
    const entries = await readdir(targetPath);
    return entries.length === 0 ? "empty-directory" : "nonempty-directory";
  } catch (error) {
    if (isMissing(error)) {
      return "missing";
    }
    throw error;
  }
}

function packageNameFor(targetPath: string): string {
  const packageName = basename(targetPath)
    .toLowerCase()
    .replaceAll(/[^a-z0-9._-]+/gu, "-")
    .replaceAll(/^[._-]+|[._-]+$/gu, "");

  if (
    packageName.length === 0 ||
    packageName.length > 214 ||
    packageName === "node_modules" ||
    packageName === "favicon.ico"
  ) {
    throw new GenerationError(
      `Cannot derive a package name from output path: ${targetPath}`,
    );
  }
  return packageName;
}

function containsPath(parent: string, child: string): boolean {
  const pathFromParent = relative(parent, child);
  return (
    pathFromParent === "" ||
    (!pathFromParent.startsWith("..") && !isAbsolute(pathFromParent))
  );
}

function assertSafeReplacement(
  targetPath: string,
  currentDirectory: string,
): void {
  if (
    targetPath === parse(targetPath).root ||
    targetPath === resolve(homedir()) ||
    containsPath(targetPath, currentDirectory)
  ) {
    throw new GenerationError(
      `Refusing to replace a broad or active directory: ${targetPath}`,
    );
  }
}

async function writeProject(
  stagingPath: string,
  packageName: string,
): Promise<void> {
  const project = createVanillaWindowProject(packageName);
  for (const file of project.files) {
    const outputPath = join(stagingPath, file.path);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, file.contents, "utf8");
  }
}

export interface GenerationResult {
  readonly outputPath: string;
  readonly packageName: string;
}

export async function generateProject(
  currentDirectory: string,
  selection: GenerationSelection,
  replaceExisting: boolean,
): Promise<GenerationResult> {
  const root = resolve(currentDirectory);
  const targetPath = resolve(root, selection.directory);
  const targetState = await inspectDestination(targetPath);

  if (targetState === "nonempty-directory" && !replaceExisting) {
    throw new GenerationError(
      `Output directory is not empty: ${targetPath}. Re-run with --force to replace it.`,
    );
  }
  if (targetState !== "missing") {
    assertSafeReplacement(targetPath, root);
  }

  const packageName = packageNameFor(targetPath);
  const parentPath = dirname(targetPath);
  const operationId = randomUUID();
  const stagingPath = join(parentPath, `.create-eagle-plugin-${operationId}`);
  const backupPath = join(
    parentPath,
    `.create-eagle-plugin-backup-${operationId}`,
  );
  let backupCreated = false;
  let installed = false;

  await mkdir(parentPath, { recursive: true });
  await mkdir(stagingPath);

  try {
    await writeProject(stagingPath, packageName);

    const currentTargetState = await inspectDestination(targetPath);
    if (currentTargetState !== targetState) {
      throw new GenerationError(
        `Output directory changed while the project was being prepared: ${targetPath}`,
      );
    }

    if (targetState !== "missing") {
      await rename(targetPath, backupPath);
      backupCreated = true;
    }

    try {
      await rename(stagingPath, targetPath);
      installed = true;
    } catch (error) {
      if (backupCreated) {
        try {
          await rename(backupPath, targetPath);
          backupCreated = false;
        } catch (restoreError) {
          throw new GenerationError(
            `Project installation failed and the previous directory remains at ${backupPath}`,
            { cause: new AggregateError([error, restoreError]) },
          );
        }
      }
      throw error;
    }

    if (backupCreated) {
      try {
        await rm(backupPath, { recursive: true, force: true });
        backupCreated = false;
      } catch (error) {
        throw new GenerationError(
          `Project was created at ${targetPath}, but the previous directory remains at ${backupPath}`,
          { cause: error },
        );
      }
    }

    return { outputPath: targetPath, packageName };
  } finally {
    if (!installed) {
      await rm(stagingPath, { recursive: true, force: true });
    }
  }
}
