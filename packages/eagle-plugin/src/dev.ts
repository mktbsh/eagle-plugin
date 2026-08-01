import { copyFile, mkdir, rename, rm, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { dirname, join, relative, resolve } from "node:path";
import {
  createServer as createViteServer,
  type InlineConfig,
  type ViteDevServer,
} from "vite";
import { EagleProjectError } from "./errors.js";
import { requireFile, resolveInside } from "./project-files.js";
import {
  type ResolvedWindowProject,
  resolveWindowProject,
} from "./resolve-project.js";

const DEVELOPMENT_HOST = "127.0.0.1";
const DEFAULT_DEVELOPMENT_PORT = 5173;

export interface ViteDevelopmentInput {
  readonly root: string;
  readonly port?: number;
}

export function createViteDevelopmentConfig(
  input: ViteDevelopmentInput,
): InlineConfig {
  return {
    root: input.root,
    configFile: false,
    publicDir: false,
    clearScreen: false,
    logLevel: "silent",
    appType: "custom",
    server: {
      host: DEVELOPMENT_HOST,
      port: input.port ?? DEFAULT_DEVELOPMENT_PORT,
      strictPort: input.port !== undefined,
      cors: { origin: "null" },
      open: false,
      fs: {
        strict: true,
        allow: [input.root],
      },
    },
  };
}

function developmentUrl(server: ViteDevServer): string {
  const address = server.httpServer?.address();
  if (
    address === null ||
    typeof address === "string" ||
    address === undefined
  ) {
    throw new EagleProjectError(
      "Vite started without a usable TCP development address",
    );
  }
  return `http://${DEVELOPMENT_HOST}:${(address as AddressInfo).port}`;
}

function serverPath(projectPath: string): string {
  return projectPath.split("/").map(encodeURIComponent).join("/");
}

function renderDevelopmentBridge(
  serverUrl: string,
  entrypointPath: string,
): string {
  const entrypointUrl = `${serverUrl}/${serverPath(entrypointPath)}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eagle Plugin Development</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="${serverUrl}/@vite/client"></script>
    <script type="module" src="${entrypointUrl}"></script>
  </body>
</html>
`;
}

async function writeDevelopmentPlugin(
  resolvedProject: ResolvedWindowProject,
  serverUrl: string,
): Promise<void> {
  const { project, config } = resolvedProject;
  const logoSourcePath = resolveInside(project.root, config.logoPath);
  await requireFile(project.entrypointPath, "Window entrypoint");
  await requireFile(logoSourcePath, "Logo");

  const relativeEntrypoint = relative(
    project.root,
    project.entrypointPath,
  ).replaceAll("\\", "/");
  const logoOutputPath = resolveInside(
    project.developmentStagingPath,
    config.logoPath,
  );

  await rm(project.developmentStagingPath, { recursive: true, force: true });
  await mkdir(dirname(logoOutputPath), { recursive: true });

  try {
    await copyFile(logoSourcePath, logoOutputPath);
    await writeFile(
      join(project.developmentStagingPath, "index.html"),
      renderDevelopmentBridge(serverUrl, relativeEntrypoint),
      "utf8",
    );
    await writeFile(
      join(project.developmentStagingPath, "manifest.json"),
      `${JSON.stringify(config.manifest, null, 2)}\n`,
      "utf8",
    );
    await rm(project.developmentPath, { recursive: true, force: true });
    await rename(project.developmentStagingPath, project.developmentPath);
  } finally {
    await rm(project.developmentStagingPath, { recursive: true, force: true });
  }
}

export type DevelopmentRebuildReason = "configuration" | "entrypoint topology";

export type DevelopmentNotice =
  | {
      readonly type: "reload-required";
      readonly reasons: readonly DevelopmentRebuildReason[];
      readonly pluginPath: string;
    }
  | {
      readonly type: "rebuild-failed";
      readonly reasons: readonly DevelopmentRebuildReason[];
      readonly error: Error;
      readonly pluginPath: string;
    };

function watchReason(
  projectRoot: string,
  configPath: string,
  event: "add" | "addDir" | "change" | "unlink" | "unlinkDir",
  changedPath: string,
): DevelopmentRebuildReason | undefined {
  const absolutePath = resolve(changedPath);
  if (absolutePath === configPath) {
    return "configuration";
  }

  if (event === "change") {
    return undefined;
  }
  const projectPath = relative(projectRoot, absolutePath).replaceAll("\\", "/");
  if (
    /^(?:entrypoints\/(?:window|service)\.tsx?|entrypoints\/formats(?:\/|$))/u.test(
      projectPath,
    )
  ) {
    return "entrypoint topology";
  }
  return undefined;
}

export interface DevelopmentSession {
  readonly pluginPath: string;
  readonly serverUrl: string;
  close(): Promise<void>;
}

export async function startDevelopment(
  root: string,
  options: { readonly port?: number },
  report: (notice: DevelopmentNotice) => void,
): Promise<DevelopmentSession> {
  const initialProject = await resolveWindowProject(root);
  let viteServer: ViteDevServer | undefined;

  try {
    viteServer = await createViteServer(
      createViteDevelopmentConfig({
        root: initialProject.project.root,
        ...(options.port === undefined ? {} : { port: options.port }),
      }),
    );
    await viteServer.listen();
  } catch (error) {
    await viteServer?.close();
    const requestedPort = options.port ?? DEFAULT_DEVELOPMENT_PORT;
    throw new EagleProjectError(
      `Unable to start the Vite development server on ${DEVELOPMENT_HOST}:${requestedPort}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }

  const server = viteServer;
  const serverUrl = developmentUrl(server);
  try {
    await writeDevelopmentPlugin(initialProject, serverUrl);
  } catch (error) {
    await server.close();
    throw error;
  }

  const pendingReasons = new Set<DevelopmentRebuildReason>();
  let rebuildTimer: NodeJS.Timeout | undefined;
  let rebuildQueue = Promise.resolve();
  let closed = false;

  const rebuild = () => {
    const reasons = [...pendingReasons];
    pendingReasons.clear();
    rebuildQueue = rebuildQueue.then(async () => {
      try {
        const currentProject = await resolveWindowProject(
          initialProject.project.root,
        );
        await writeDevelopmentPlugin(currentProject, serverUrl);
        report({
          type: "reload-required",
          reasons,
          pluginPath: currentProject.project.developmentPath,
        });
      } catch (error) {
        report({
          type: "rebuild-failed",
          reasons,
          error: error instanceof Error ? error : new Error(String(error)),
          pluginPath: initialProject.project.developmentPath,
        });
      }
    });
  };

  const scheduleRebuild = (reason: DevelopmentRebuildReason) => {
    pendingReasons.add(reason);
    if (rebuildTimer !== undefined) {
      clearTimeout(rebuildTimer);
    }
    rebuildTimer = setTimeout(rebuild, 75);
  };

  const watch = (
    event: "add" | "addDir" | "change" | "unlink" | "unlinkDir",
    changedPath: string,
  ) => {
    if (closed) {
      return;
    }
    const reason = watchReason(
      initialProject.project.root,
      initialProject.project.configPath,
      event,
      changedPath,
    );
    if (reason !== undefined) {
      scheduleRebuild(reason);
    }
  };

  server.watcher.add([
    initialProject.project.configPath,
    join(initialProject.project.root, "entrypoints"),
  ]);
  server.watcher.on("add", (path) => watch("add", path));
  server.watcher.on("addDir", (path) => watch("addDir", path));
  server.watcher.on("change", (path) => watch("change", path));
  server.watcher.on("unlink", (path) => watch("unlink", path));
  server.watcher.on("unlinkDir", (path) => watch("unlinkDir", path));

  return {
    pluginPath: initialProject.project.developmentPath,
    serverUrl,
    async close() {
      closed = true;
      if (rebuildTimer !== undefined) {
        clearTimeout(rebuildTimer);
      }
      await rebuildQueue;
      await server.close();
    },
  };
}
