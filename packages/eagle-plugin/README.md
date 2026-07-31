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

## Development loop

```bash
eagle dev
```

The command writes a stable development plugin to `.eagle-plugin-dev`, starts Vite on `127.0.0.1`, and prints the absolute directory to import into Eagle. Import that directory once. Its local `index.html` bridge connects to the printed Vite address; the development manifest never contains an HTTP URL.

Vite applies CSS updates and reloads the bridge for Window module changes. Changes to `eagle.config.ts` or the entrypoint topology rebuild the stable development plugin and print an explicit instruction to reload it in Eagle. The framework does not call private Eagle reload APIs.

By default Vite selects port 5173 or the next available port. Require a particular port when another tool needs a fixed address:

```bash
eagle dev --port 5173
```

## Production build

```bash
eagle build
```

The command writes a clean release candidate to `dist` containing the generated manifest, HTML, compiled entrypoint, imported assets, and configured logo. Output targets Eagle 4.0's Electron 22 and Chromium 108 runtime and uses relative asset URLs.

The initial implementation supports Vanilla TypeScript Window plugins. Service, Formats, and React are added by later tickets.

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
  "schemaVersion": 2,
  "mechanicalStatus": "pass",
  "errors": [],
  "warnings": [
    {
      "code": "release.network_reference.detected",
      "severity": "warning",
      "message": "A network reference was detected. Confirm its destination, transmitted data, purpose, and required disclosure.",
      "path": "assets/window.js",
      "evidence": [
        {
          "path": "assets/window.js",
          "line": 1,
          "excerpt": "https://api.example.com"
        }
      ],
      "rule": {
        "sourceUrl": "https://developer.eagle.cool/plugin-api/plugin-review/criteria/security-and-privacy",
        "checkedAt": "2026-08-01"
      }
    }
  ],
  "manualChecks": [
    {
      "code": "manual.functionality",
      "severity": "manual",
      "message": "Confirm that the plugin behavior and listing text are accurate.",
      "rule": {
        "sourceUrl": "https://developer.eagle.cool/plugin-api/plugin-review/criteria/functionality-and-policy",
        "checkedAt": "2026-08-01"
      }
    }
  ]
}
```

Every error and warning has a stable `code`, `severity`, `message`, `evidence`, and `rule`. `path` is present when the finding belongs to one release-relative path. `rule` records the official source URL and the date on which the rule was last checked. Human output renders the same records.

Errors use the manifest validator's `manifest.*` codes and these release codes:

- `release.manifest.missing`
- `release.manifest.invalid_json`
- `release.reference.unsafe`
- `release.logo.missing`
- `release.html.missing`
- `release.entrypoint.missing`
- `release.dev_tools.enabled`
- `release.name.too_long`
- `release.name.too_many_words`
- `release.keywords.too_many`
- `release.symlink.detected`
- `release.development_artifact.detected`
- `release.sensitive_file.detected`
- `release.nested_archive.detected`

Name and keyword limits are checked because those values exist in `manifest.json`. Description limits are not guessed: the current framework configuration has no store-description input to validate.

Warnings use these codes:

- `release.network_reference.detected`
- `release.local_network_reference.detected`
- `release.unencrypted_http.detected`
- `release.binary.detected`
- `release.dependency_directory.detected`
- `release.system_command.detected`
- `release.destructive_operation.detected`
- `release.remote_code.detected`
- `release.elevated_permission.detected`
- `release.disclosure_candidate.detected`

Behavior warnings are evidence-bearing static signals, not a safety verdict. Network evidence reports only the protocol, host, and port; it does not print credentials, query parameters, or fragments.

The framework's initial release-directory contract deliberately rejects symbolic links and nested archives even though Eagle's review criteria can allow them with sufficient context. Supported templates do not need either form, so their presence is treated as unintended release content. Native binaries and context-dependent behavior remain warnings.

The manual checklist uses `manual.functionality`, `manual.visual_assets`, `manual.cancellation_and_data_safety`, `manual.author_understanding`, and `manual.fresh_install`.

A passing result means only that no implemented mechanical blocker was detected. Manual checks and Eagle Plugin Center review remain required.

## Help

```bash
eagle --help
eagle dev --help
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
