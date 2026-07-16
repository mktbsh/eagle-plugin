/// <reference types="../eagle-plugin" />

eagle.onPluginCreate((plugin) => {
  const _manifest: Eagle.ManifestJSON = plugin.manifest;
  const _pluginPath: string = plugin.path;
});

eagle.onPluginRun(() => {});
eagle.onPluginBeforeExit(() => {});
eagle.onPluginShow(() => {});
eagle.onPluginHide(() => {});
eagle.onLibraryChanged((libraryPath) => {
  const _libraryPath: string = libraryPath;
});
eagle.onThemeChanged((theme) => {
  const _theme: Eagle.ThemeName = theme;
});

const _version: string = eagle.app.version;
