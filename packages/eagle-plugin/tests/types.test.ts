import { defineConfig, type EagleConfig } from "../src/index.js";

const config = defineConfig({
  id: "typed-window",
  version: "1.0.0",
  name: "Typed Window",
  logo: "logo.png",
  keywords: [],
  window: {
    width: 640,
  },
});

const literalWidth: 640 = config.window.width;
const eagleConfig: EagleConfig = config;

void literalWidth;
void eagleConfig;

defineConfig({
  id: "unknown-field",
  version: "1.0.0",
  name: "Unknown Field",
  logo: "logo.png",
  keywords: [],
  // @ts-expect-error Derived manifest fields are not configurable.
  main: { url: "index.html" },
});

defineConfig({
  id: "unknown-window-field",
  version: "1.0.0",
  name: "Unknown Window Field",
  logo: "logo.png",
  keywords: [],
  window: {
    // @ts-expect-error The entrypoint determines the URL.
    url: "index.html",
  },
});
