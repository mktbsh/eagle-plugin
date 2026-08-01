import { defineManifest, type ManifestJSON } from "../src/index.js";

const windowManifest = defineManifest({
  id: "window-plugin",
  version: "1.0.0",
  name: "Window Plugin",
  logo: "/logo.png",
  keywords: [],
  main: {
    url: "index.html",
  },
});

const literalUrl: "index.html" = windowManifest.main.url;
const manifest: ManifestJSON = windowManifest;

void literalUrl;
void manifest;

// @ts-expect-error A manifest without main or preview is not a valid state.
defineManifest({
  id: "missing-topology",
  version: "1.0.0",
  name: "Missing Topology",
  logo: "/logo.png",
  keywords: [],
});

// @ts-expect-error Window and format topologies cannot coexist.
defineManifest({
  id: "conflicting-topology",
  version: "1.0.0",
  name: "Conflicting Topology",
  logo: "/logo.png",
  keywords: [],
  main: { url: "index.html" },
  preview: {
    png: {
      viewer: { path: "viewer.html" },
    },
  },
});
