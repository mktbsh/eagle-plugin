# Release preparation

The framework prepares a release candidate. Eagle remains responsible for creating the final `.eagleplugin` artifact and for the Plugin Center submission flow.

## Build

Run the production build from the project root:

```bash
pnpm build
```

The command recreates `dist` with a generated manifest, relative HTML references, compiled assets, and the required logo.

## Run the preflight

```bash
pnpm check
pnpm check -- --json
```

Mechanical errors produce a non-zero exit code. Warnings and manual checks remain visible because they require context or human verification; a passing preflight is not Eagle Plugin Center approval.

## Pack and fresh-install

After build and preflight:

1. Use Eagle's `Plugin > Pack Plugin` action.
2. Install the generated `.eagleplugin` into a clean Eagle environment.
3. Exercise the plugin's core behavior and verify the listing text and visual assets.

The fresh-install check is important because it exercises the artifact that users will receive, not only the source workspace.
