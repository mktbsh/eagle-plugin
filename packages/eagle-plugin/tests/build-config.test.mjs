import assert from "node:assert/strict";
import { test } from "node:test";
import { createViteBuildConfig, EAGLE_CHROMIUM_TARGET } from "../dist/build.js";

test("pins embedded deployment and Eagle 4 compatibility", () => {
  const config = createViteBuildConfig({
    root: "/project",
    entrypointPath: "/project/entrypoints/window.ts",
    outputPath: "/project/.eagle-plugin-build",
  });

  assert.equal(config.base, "./");
  assert.equal(config.configFile, false);
  assert.equal(config.build.target, EAGLE_CHROMIUM_TARGET);
  assert.equal(EAGLE_CHROMIUM_TARGET, "chrome108");
  assert.equal(config.build.emptyOutDir, false);
});
