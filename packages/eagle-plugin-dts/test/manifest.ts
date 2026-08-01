/// <reference types="../eagle-plugin" />

const commonManifest = {
  id: "plugin-id",
  version: "1.0.0",
  platform: "all",
  arch: "all",
  name: "Plugin",
  logo: "/logo.png",
  keywords: ["example"],
  devTools: false,
} as const;

const _windowManifest = {
  ...commonManifest,
  main: {
    url: "index.html",
    width: 640,
    height: 480,
    followCursor: true,
  },
} satisfies Eagle.WindowManifest;

const _serviceManifest = {
  ...commonManifest,
  dependencies: ["ffmpeg"],
  main: {
    serviceMode: true,
    url: "index.html",
  },
} satisfies Eagle.ServiceManifest;

const _previewManifest = {
  ...commonManifest,
  preview: {
    icns: {
      thumbnail: {
        path: "thumbnail/icns.js",
        size: 400,
        allowZoom: false,
      },
      viewer: { path: "viewer/icns.html" },
    },
  },
} satisfies Eagle.PreviewManifest;

const _inspectorManifest = {
  ...commonManifest,
  preview: {
    "jpg,png": {
      inspector: {
        path: "index.html",
        height: 100,
        multiSelect: false,
      },
    },
  },
} satisfies Eagle.InspectorManifest;

const _manifestUnion: Eagle.ManifestJSON = _windowManifest;
