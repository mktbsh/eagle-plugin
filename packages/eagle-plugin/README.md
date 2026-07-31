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

The initial implementation supports Vanilla TypeScript Window plugins. Service, Formats, React, and development mode are added by later tickets.

## Preflight

Inspect the release candidate after a production build.

```bash
eagle check
eagle check --json
```

The default output separates mechanical errors, warnings that require context, and manual checks. Mechanical errors return a nonzero status. Warnings and incomplete manual checks do not.

`--json` writes this machine-readable shape to stdout:

```json
{
  "schemaVersion": 1,
  "mechanicalStatus": "pass",
  "errors": [],
  "warnings": [],
  "manualChecks": [
    {
      "code": "manual.functionality",
      "message": "Confirm that the plugin behavior and listing text are accurate."
    }
  ]
}
```

Every error and warning has a stable `code`, a `message`, and an optional release-relative `path`. The initial Window rules use the manifest validator's `manifest.*` codes and these release codes:

- `release.manifest.missing`
- `release.manifest.invalid_json`
- `release.reference.unsafe`
- `release.logo.missing`
- `release.html.missing`
- `release.entrypoint.missing`
- `release.dev_tools.enabled`
- `release.network_reference.detected` (warning)

The manual checklist uses `manual.functionality`, `manual.visual_assets`, `manual.cancellation_and_data_safety`, `manual.author_understanding`, and `manual.fresh_install`.

A passing result means only that no implemented mechanical blocker was detected. Manual checks and Eagle Plugin Center review remain required.

## Help

```bash
eagle --help
eagle build --help
eagle check --help
```

## Development

```bash
pnpm test
pnpm run pack:dry
```

## License

MIT
