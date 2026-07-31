# eagle-plugin

Framework and command-line tools for Eagle plugin development.

## Installation

```bash
pnpm add -D eagle-plugin
```

## Configuration

Create `eagle.config.ts` in the project root. It is the only authored manifest source.

```ts
import { defineConfig } from "eagle-plugin";

export default defineConfig({
  id: "example-window",
  version: "1.0.0",
  name: "Example Window",
  logo: "logo.png",
  keywords: [],
  window: {
    width: 640,
    height: 480,
  },
});
```

Place a Vanilla TypeScript Window entrypoint at `entrypoints/window.ts`.

```ts
const app = document.querySelector<HTMLDivElement>("#app");

if (app !== null) {
  app.textContent = "Hello from Eagle";
}
```

## Production build

```bash
eagle build
```

The command writes a clean release candidate to `dist` containing the generated manifest, HTML, compiled entrypoint, imported assets, and configured logo. Output targets Eagle 4.0's Electron 22 and Chromium 108 runtime and uses relative asset URLs.

The initial tracer bullet supports Vanilla TypeScript Window plugins. Service, Formats, React, development mode, and Preflight are added by later tickets.

## Help

```bash
eagle --help
eagle build --help
```

## Development

```bash
pnpm test
pnpm run pack:dry
```

## License

MIT
