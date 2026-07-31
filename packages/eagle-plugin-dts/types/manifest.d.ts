declare namespace Eagle {
  type ManifestBase = import("eagle-plugin-manifest").ManifestBase;
  type WindowMainConfig = import("eagle-plugin-manifest").WindowMainConfig;
  type WindowManifest = import("eagle-plugin-manifest").WindowManifest;
  type ServiceManifest = import("eagle-plugin-manifest").ServiceManifest;
  type ThumbnailExtensionConfig =
    import("eagle-plugin-manifest").ThumbnailExtensionConfig;
  type ViewerExtensionConfig =
    import("eagle-plugin-manifest").ViewerExtensionConfig;
  type InspectorExtensionConfig =
    import("eagle-plugin-manifest").InspectorExtensionConfig;
  type PreviewExtensionDefinition =
    import("eagle-plugin-manifest").PreviewExtensionDefinition;
  type InspectorExtensionDefinition =
    import("eagle-plugin-manifest").InspectorExtensionDefinition;
  type PreviewManifest = import("eagle-plugin-manifest").PreviewManifest;
  type InspectorManifest = import("eagle-plugin-manifest").InspectorManifest;

  /**
   * A manifest for a window, background service, format preview, or inspector plugin.
   *
   * @see https://developer.eagle.cool/plugin-api/tutorial/manifest
   */
  type ManifestJSON = import("eagle-plugin-manifest").ManifestJSON;
}
