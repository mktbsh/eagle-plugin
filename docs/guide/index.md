# Guide

This guide is for Plugin Authors who want to build an Eagle plugin with TypeScript and Vite.

The shortest path is:

1. Generate a Window project.
2. Start the development loop and import the development plugin into Eagle.
3. Build and run the release preflight.
4. Pack the plugin from Eagle and install the fresh artifact.

The current public release supports this path for Vanilla TypeScript Window plugins.

## Choose a guide

- [Getting started](./getting-started) — install the generator and create a project.
- [Development loop](./development) — work with `eagle dev` and Eagle HMR.
- [Release preparation](./release) — build, preflight, pack, and fresh-install a plugin.
