import { resolve } from "node:path";
import { type ResolvedWindowConfig, resolveWindowConfig } from "./config.js";
import { loadEagleConfig } from "./load-config.js";
import { discoverWindowProject, type WindowProject } from "./project.js";

export interface ResolvedWindowProject {
  readonly project: WindowProject;
  readonly config: ResolvedWindowConfig;
}

export async function resolveWindowProject(
  root: string,
): Promise<ResolvedWindowProject> {
  const project = await discoverWindowProject(resolve(root));
  const configInput = await loadEagleConfig(project.configPath, project.root);
  return {
    project,
    config: resolveWindowConfig(configInput),
  };
}
