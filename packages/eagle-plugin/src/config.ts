import { posix } from "node:path";
import {
  type ManifestBase,
  ManifestValidationError,
  parseManifest,
  type WindowMainConfig,
  type WindowManifest,
} from "eagle-plugin-manifest";
import { EagleProjectError } from "./errors.js";

export type WindowConfig = Omit<WindowMainConfig, "url">;

export type EagleConfig = ManifestBase & {
  readonly window?: WindowConfig;
};

type WithoutExtraProperties<Actual, Expected> = Actual &
  Record<Exclude<keyof Actual, keyof Expected>, never>;

type ExactWindowConfig<Config extends EagleConfig> = Config extends {
  readonly window: infer Window;
}
  ? Window extends WindowConfig
    ? { readonly window: WithoutExtraProperties<Window, WindowConfig> }
    : never
  : unknown;

type ExactEagleConfig<Config extends EagleConfig> = WithoutExtraProperties<
  Config,
  EagleConfig
> &
  ExactWindowConfig<Config>;

export function defineConfig<const Config extends EagleConfig>(
  config: ExactEagleConfig<Config>,
): Config {
  return config;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatConfigPath(path: readonly (string | number)[]): string {
  const normalizedPath = path.map((segment, index) =>
    index === 0 && segment === "main" ? "window" : segment,
  );
  return normalizedPath.length === 0
    ? "eagle.config.ts"
    : normalizedPath.join(".");
}

function normalizeAssetPath(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new EagleProjectError(
      "Invalid eagle.config.ts\nlogo: Expected a non-empty project-relative path",
    );
  }

  const portablePath = value.replaceAll("\\", "/");
  const normalizedPath = posix.normalize(portablePath);
  const isWindowsAbsolute = /^[A-Za-z]:\//u.test(portablePath);

  if (
    posix.isAbsolute(portablePath) ||
    isWindowsAbsolute ||
    normalizedPath === ".." ||
    normalizedPath.startsWith("../") ||
    normalizedPath === "."
  ) {
    throw new EagleProjectError(
      "Invalid eagle.config.ts\nlogo: Expected a path inside the project",
    );
  }

  return normalizedPath;
}

export interface ResolvedWindowConfig {
  readonly manifest: WindowManifest;
  readonly logoPath: string;
}

export function resolveWindowConfig(input: unknown): ResolvedWindowConfig {
  if (!isRecord(input)) {
    throw new EagleProjectError(
      "Invalid eagle.config.ts\nExpected the default export to be an object",
    );
  }

  if (Object.hasOwn(input, "main") || Object.hasOwn(input, "preview")) {
    throw new EagleProjectError(
      "Invalid eagle.config.ts\nmain and preview are generated from entrypoints and cannot be configured",
    );
  }

  const { window, ...manifestBase } = input;

  if (window !== undefined && !isRecord(window)) {
    throw new EagleProjectError(
      "Invalid eagle.config.ts\nwindow: Expected an object",
    );
  }

  if (
    window !== undefined &&
    (Object.hasOwn(window, "url") || Object.hasOwn(window, "serviceMode"))
  ) {
    throw new EagleProjectError(
      "Invalid eagle.config.ts\nwindow.url and window.serviceMode are generated from the Window entrypoint",
    );
  }

  const logoPath = normalizeAssetPath(manifestBase.logo);

  try {
    const manifest = parseManifest({
      ...manifestBase,
      logo: logoPath,
      main: {
        ...window,
        url: "index.html",
      },
    });
    return { manifest: manifest as WindowManifest, logoPath };
  } catch (error) {
    if (!(error instanceof ManifestValidationError)) {
      throw error;
    }

    const details = error.issues
      .map(
        (issue) =>
          `${formatConfigPath(issue.path)}: ${issue.message} (${issue.code})`,
      )
      .join("\n");
    throw new EagleProjectError(`Invalid eagle.config.ts\n${details}`, {
      cause: error,
    });
  }
}
