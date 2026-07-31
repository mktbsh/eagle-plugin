import { loadConfigFromFile } from "vite";
import { EagleProjectError } from "./errors.js";

export async function loadEagleConfig(
  configPath: string,
  root: string,
): Promise<unknown> {
  const loaded = await loadConfigFromFile(
    {
      command: "build",
      mode: "production",
      isSsrBuild: false,
      isPreview: false,
    },
    configPath,
    root,
    "silent",
    undefined,
    "bundle",
  );

  if (loaded === null) {
    throw new EagleProjectError("No eagle.config.ts found in the project root");
  }

  return loaded.config as unknown;
}
