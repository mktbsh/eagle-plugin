/// <reference types="../eagle-plugin" />

// @ts-expect-error Lifecycle methods are exposed directly on eagle.
eagle.event.onPluginCreate(() => {});

// @ts-expect-error The official method name is getRecents().
eagle.folder.getRecent();

// @ts-expect-error Ratings are limited to integers from 0 through 5.
eagle.item.get({ rating: 6 });

// @ts-expect-error Only paths documented by Eagle are accepted.
eagle.app.getPath("logs");

// @ts-expect-error Open dialog results do not expose a singular filePath.
eagle.dialog.showOpenDialog({}).then((result) => result.filePath);

// @ts-expect-error Save dialog results do not expose filePaths.
eagle.dialog.showSaveDialog({}).then((result) => result.filePaths);

// @ts-expect-error The obsolete shared dialog result type is not exported.
type _ObsoleteDialogResult = Eagle.DialogResult;

// @ts-expect-error A manifest cannot define both main and preview entrypoints.
const _invalidManifest: Eagle.ManifestJSON = {
  id: "plugin-id",
  version: "1.0.0",
  name: "Invalid",
  logo: "/logo.png",
  keywords: [],
  main: { url: "index.html" },
  preview: {},
};
