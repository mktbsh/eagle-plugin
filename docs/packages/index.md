# Packages

The public packages are released together when a change crosses package boundaries, while Changesets also supports partial releases.

| Package | Purpose | Current end-to-end scope |
| --- | --- | --- |
| [`create-eagle-plugin`](./create-eagle-plugin) | Generate a new plugin project. | Vanilla TypeScript Window |
| [`eagle-plugin`](./eagle-plugin) | `eagle` build, development, and preflight commands. | Vanilla TypeScript Window |
| [`eagle-plugin-dts`](./eagle-plugin-dts) | TypeScript declarations for the Eagle Plugin API. | API and manifest types |
| [`eagle-plugin-manifest`](./eagle-plugin-manifest) | Runtime manifest validation and JSON Schema. | Window, Service, Preview, Inspector shapes |

All four packages were first published at `0.1.0`.
