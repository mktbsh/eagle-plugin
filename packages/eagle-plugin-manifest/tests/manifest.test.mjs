import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  defineManifest,
  ManifestValidationError,
  manifestJsonSchema,
  parseManifest,
  validateManifest,
} from "../dist/index.js";

const fixtureNames = ["window", "service", "preview", "inspector"];

async function readFixture(name) {
  const url = new URL(`./fixtures/${name}.json`, import.meta.url);
  return JSON.parse(await readFile(url, "utf8"));
}

test("accepts all four official plugin forms", async () => {
  for (const fixtureName of fixtureNames) {
    const input = await readFixture(fixtureName);
    const result = validateManifest(input);
    assert.equal(result.success, true, fixtureName);
  }
});

test("accepts localization and vibrancy fields used by an official example", async () => {
  const input = await readFixture("localized-window");
  assert.equal(validateManifest(input).success, true);
});

test("preserves literal inference through defineManifest at runtime", () => {
  const manifest = {
    id: "window-plugin",
    version: "1.0.0",
    name: "Window Plugin",
    logo: "/logo.png",
    keywords: [],
    main: { url: "index.html" },
  };

  assert.equal(defineManifest(manifest), manifest);
});

test("rejects conflicting plugin topologies", async () => {
  const input = await readFixture("window");
  input.preview = {};

  assert.deepEqual(validateManifest(input), {
    success: false,
    issues: [
      {
        path: [],
        code: "manifest.topology.conflict",
        message: "A manifest cannot contain both main and preview",
      },
    ],
  });
});

test("rejects a manifest without an entry topology", () => {
  const result = validateManifest({
    id: "missing-topology",
    version: "1.0.0",
    name: "Missing Topology",
    logo: "/logo.png",
    keywords: [],
  });

  assert.equal(result.success, false);
  assert.equal(result.issues[0].code, "manifest.topology.missing");
});

test("reports unknown fields with their location", async () => {
  const input = await readFixture("window");
  input.main.devtools = false;

  const result = validateManifest(input);

  assert.equal(result.success, false);
  assert.deepEqual(result.issues[0], {
    path: ["main", "devtools"],
    code: "manifest.unknown_key",
    message: "Unknown manifest field: devtools",
  });
});

test("requires a usable preview role", async () => {
  const input = await readFixture("preview");
  input.preview.icns = {};

  const result = validateManifest(input);

  assert.equal(result.success, false);
  assert.equal(result.issues[0].code, "manifest.invalid_union");
  assert.deepEqual(result.issues[0].path, ["preview", "icns"]);
});

test("parseManifest throws a structured validation error", () => {
  assert.throws(
    () => parseManifest({}),
    (error) =>
      error instanceof ManifestValidationError &&
      error.issues[0].code === "manifest.topology.missing",
  );
});

test("exports a serializable JSON Schema", () => {
  assert.equal(
    manifestJsonSchema.$schema,
    "https://json-schema.org/draft/2020-12/schema",
  );
  assert.equal(manifestJsonSchema.title, "Eagle Plugin Manifest");
  assert.doesNotThrow(() => JSON.stringify(manifestJsonSchema));
});
