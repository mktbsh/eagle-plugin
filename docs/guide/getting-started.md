# Getting started

## Prerequisites

- Node.js 20.19 or newer.
- Eagle 4.0 or newer for the verified Window development loop.
- A terminal with npm or pnpm.

## Create a Window plugin

The published generator creates a Vanilla TypeScript Window project:

```bash
npx create-eagle-plugin my-plugin --topology window --template vanilla-ts
cd my-plugin
pnpm install
```

The generated project contains an `eagle.config.ts`, a Window entrypoint, and the scripts used by the framework:

```bash
pnpm dev
pnpm build
pnpm check
```

## What the generator owns

The generator creates the initial project structure and package references. Your project owns the source entrypoint and typed configuration; the framework generates the release `manifest.json`, HTML, compiled assets, and development bridge.

## Next step

Continue with the [development loop](./development) to import the generated project into Eagle.
