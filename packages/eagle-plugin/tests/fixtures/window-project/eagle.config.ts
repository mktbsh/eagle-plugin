import { defineConfig } from "eagle-plugin";

export default defineConfig({
  id: "vanilla-window-fixture",
  version: "1.0.0",
  name: "Vanilla Window Fixture",
  logo: "logo.png",
  keywords: ["fixture"],
  devTools: false,
  window: {
    width: 640,
    height: 480,
    resizable: true,
  },
});
