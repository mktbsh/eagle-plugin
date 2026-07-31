import {
  copyFile,
  mkdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, join, posix, relative, resolve, sep } from "node:path";
import { type InlineConfig, build as viteBuild } from "vite";
import { resolveWindowConfig } from "./config.js";
import { EagleProjectError } from "./errors.js";
import { loadEagleConfig } from "./load-config.js";
import { discoverWindowProject } from "./project.js";

export const EAGLE_CHROMIUM_TARGET = "chrome108";

interface ViteBuildInput {
  readonly root: string;
  readonly entrypointPath: string;
  readonly outputPath: string;
}

export function createViteBuildConfig(input: ViteBuildInput): InlineConfig {
  return {
    root: input.root,
    base: "./",
    configFile: false,
    publicDir: false,
    logLevel: "silent",
    clearScreen: false,
    mode: "production",
    build: {
      target: EAGLE_CHROMIUM_TARGET,
      outDir: input.outputPath,
      emptyOutDir: false,
      copyPublicDir: false,
      assetsInlineLimit: 0,
      cssCodeSplit: true,
      manifest: true,
      modulePreload: false,
      rolldownOptions: {
        input: { window: input.entrypointPath },
        output: {
          entryFileNames: "assets/window.js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
      },
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireReleasePath(value: unknown, label: string): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.includes("\\") ||
    posix.isAbsolute(value) ||
    posix.normalize(value) !== value ||
    value
      .split("/")
      .some(
        (segment) =>
          segment.length === 0 || segment === "." || segment === "..",
      )
  ) {
    throw new EagleProjectError(`Vite emitted an unsafe ${label} path`);
  }
  return value;
}

function releaseUrl(path: string): string {
  return `./${path.split("/").map(encodeURIComponent).join("/")}`;
}

interface ViteEntryMetadata {
  readonly file: string;
  readonly css: readonly string[];
}

async function readViteEntry(outputPath: string): Promise<ViteEntryMetadata> {
  const metadataPath = join(outputPath, ".vite", "manifest.json");
  const input = JSON.parse(await readFile(metadataPath, "utf8")) as unknown;

  if (!isRecord(input)) {
    throw new EagleProjectError("Vite emitted an invalid build manifest");
  }

  const entry = Object.values(input).find(
    (value) => isRecord(value) && value.isEntry === true,
  );

  if (!isRecord(entry)) {
    throw new EagleProjectError("Vite did not emit the Window entrypoint");
  }

  const file = requireReleasePath(entry.file, "entrypoint");
  const cssInput = entry.css ?? [];
  if (
    !Array.isArray(cssInput) ||
    !cssInput.every((value) => typeof value === "string")
  ) {
    throw new EagleProjectError("Vite emitted invalid CSS metadata");
  }

  return {
    file,
    css: cssInput.map((value) => requireReleasePath(value, "CSS")),
  };
}

function renderWindowHtml(entry: ViteEntryMetadata): string {
  const styles = entry.css
    .map((path) => `    <link rel="stylesheet" href="${releaseUrl(path)}">`)
    .join("\n");
  const styleBlock = styles.length > 0 ? `${styles}\n` : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
${styleBlock}    <title>Eagle Plugin</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="${releaseUrl(entry.file)}"></script>
  </body>
</html>
`;
}

async function requireFile(path: string, label: string): Promise<void> {
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

function resolveInside(root: string, projectPath: string): string {
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

export interface BuildResult {
  readonly outputPath: string;
}

export async function buildProject(root: string): Promise<BuildResult> {
  const project = await discoverWindowProject(resolve(root));
  const configInput = await loadEagleConfig(project.configPath, project.root);
  const config = resolveWindowConfig(configInput);
  const logoSourcePath = resolveInside(project.root, config.logoPath);

  await requireFile(project.entrypointPath, "Window entrypoint");
  await requireFile(logoSourcePath, "Logo");

  await rm(project.stagingPath, { recursive: true, force: true });
  await mkdir(project.stagingPath, { recursive: true });

  try {
    await viteBuild(
      createViteBuildConfig({
        root: project.root,
        entrypointPath: project.entrypointPath,
        outputPath: project.stagingPath,
      }),
    );

    const viteEntry = await readViteEntry(project.stagingPath);
    const logoOutputPath = resolveInside(project.stagingPath, config.logoPath);
    await mkdir(dirname(logoOutputPath), { recursive: true });
    await copyFile(logoSourcePath, logoOutputPath);
    await writeFile(
      join(project.stagingPath, "index.html"),
      renderWindowHtml(viteEntry),
      "utf8",
    );
    await writeFile(
      join(project.stagingPath, "manifest.json"),
      `${JSON.stringify(config.manifest, null, 2)}\n`,
      "utf8",
    );
    await rm(join(project.stagingPath, ".vite"), {
      recursive: true,
      force: true,
    });

    await rm(project.outputPath, { recursive: true, force: true });
    await rename(project.stagingPath, project.outputPath);
    return { outputPath: project.outputPath };
  } finally {
    await rm(project.stagingPath, { recursive: true, force: true });
  }
}
