declare namespace Eagle {
  interface ManifestBase {
    readonly id: string;
    readonly version: string;
    readonly name: string;
    readonly logo: string;
    readonly keywords: readonly string[];
    readonly platform?: "all" | "mac" | "win";
    readonly arch?: "all" | "arm" | "arm64" | "x64";
    readonly devTools?: boolean;
    readonly dependencies?: readonly string[];
  }

  interface WindowMainConfig {
    readonly url: string;
    readonly width?: number;
    readonly height?: number;
    readonly minWidth?: number;
    readonly minHeight?: number;
    readonly maxWidth?: number;
    readonly maxHeight?: number;
    readonly alwaysOnTop?: boolean;
    readonly frame?: boolean;
    readonly fullscreenable?: boolean;
    readonly maximizable?: boolean;
    readonly minimizable?: boolean;
    readonly resizable?: boolean;
    readonly backgroundColor?: string;
    readonly childWindow?: boolean;
    /** @since Eagle 4.0 build22 */
    readonly followCursor?: boolean;
    readonly multiple?: boolean;
    readonly runAfterInstall?: boolean;
  }

  type WindowManifest = ManifestBase & {
    readonly main: WindowMainConfig & { readonly serviceMode?: false };
    readonly preview?: never;
  };

  type ServiceManifest = ManifestBase & {
    readonly main: WindowMainConfig & { readonly serviceMode: true };
    readonly preview?: never;
  };

  interface ThumbnailExtensionConfig {
    readonly path: string;
    readonly size?: number;
    readonly allowZoom?: boolean;
  }

  interface ViewerExtensionConfig {
    readonly path: string;
  }

  interface InspectorExtensionConfig {
    readonly path: string;
    readonly height: number;
    readonly multiSelect: boolean;
  }

  interface PreviewExtensionDefinition {
    readonly thumbnail?: ThumbnailExtensionConfig;
    readonly viewer?: ViewerExtensionConfig;
    readonly inspector?: never;
  }

  interface InspectorExtensionDefinition {
    readonly thumbnail?: ThumbnailExtensionConfig;
    readonly viewer?: ViewerExtensionConfig;
    readonly inspector: InspectorExtensionConfig;
  }

  type PreviewManifest = ManifestBase & {
    readonly main?: never;
    readonly preview: Readonly<Record<string, PreviewExtensionDefinition>>;
  };

  type InspectorManifest = ManifestBase & {
    readonly main?: never;
    readonly preview: Readonly<Record<string, InspectorExtensionDefinition>>;
  };

  /**
   * A manifest for a window, background service, format preview, or inspector plugin.
   *
   * @see https://developer.eagle.cool/plugin-api/tutorial/manifest
   */
  type ManifestJSON =
    | WindowManifest
    | ServiceManifest
    | PreviewManifest
    | InspectorManifest;
}
