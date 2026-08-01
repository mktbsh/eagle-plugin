---
layout: home

hero:
  name: Eagle Plugin
  text: TypeScript tooling for Eagle plugin development
  tagline: Generate, develop, build, and preflight Eagle plugins with one command surface.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Explore packages
      link: /packages/

features:
  - icon: 🧰
    title: Typed configuration
    details: Keep plugin identity and release metadata in a validated eagle.config.ts.
  - icon: ⚡
    title: Eagle development loop
    details: Use a stable local bridge and Vite development server for the Window workflow.
  - icon: ✅
    title: Release preflight
    details: Find mechanical packaging blockers before Eagle's manual packaging and review steps.
---

## Current support

The published `0.1.0` tooling provides an end-to-end Vanilla TypeScript Window workflow.
The manifest and type packages describe additional Eagle plugin forms, while their generator and build workflows are being added incrementally.

## What belongs here

- [Getting started](/guide/getting-started) — create and run your first plugin.
- [Development loop](/guide/development) — use `eagle dev`, HMR, and reload guidance.
- [Packages](/packages/) — choose the package that matches your task.
- [Architecture](/architecture/) — understand the boundaries and decisions behind the tooling.
