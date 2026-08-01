# eagle-plugin-dts

TypeScript declaration files for the Eagle Plugin API.

`eagle-plugin-dts` provides ambient TypeScript types for the `eagle` global object available inside Eagle plugins.

> This is an unofficial, community-maintained type definition package. It does not include runtime JavaScript code.

## Installation

```bash
pnpm add -D eagle-plugin-dts
```

## Setup

Create `env.d.ts` or `global.d.ts` in your Eagle plugin project.

```ts
/// <reference types="eagle-plugin-dts" />
```

Make sure the file is included by your `tsconfig.json`.

```json
{
  "include": [
    "src",
    "env.d.ts"
  ]
}
```

You can also configure it from `tsconfig.json`.

```json
{
  "compilerOptions": {
    "types": [
      "eagle-plugin-dts"
    ]
  }
}
```

The `env.d.ts` approach is recommended because it is less likely to affect other global type packages such as Node.js, test frameworks, or browser-specific types.

## Usage

After setup, the global `eagle` object can be used with TypeScript type checking.

```ts
console.log(eagle.app.version);
console.log(eagle.app.build);
console.log(eagle.app.locale);

const appDataPath = await eagle.app.getPath("appData");

await eagle.app.show();
```

Lifecycle events are available directly on the global object.

```ts
eagle.onPluginCreate((plugin) => {
  console.log(plugin.manifest.name);
  console.log(plugin.path);
});
```

## Manifest types

`Eagle.ManifestJSON` covers window, background service, format preview, and inspector plugins. Use `satisfies` to validate a manifest object without widening its values.

```ts
const manifest = {
  id: "example-plugin",
  version: "1.0.0",
  name: "Example Plugin",
  logo: "/logo.png",
  keywords: ["example"],
  main: {
    url: "index.html",
    width: 640,
    height: 480,
  },
} satisfies Eagle.ManifestJSON;
```

## Do not import this package at runtime

This package is type-only.

Do not write this in runtime code:

```ts
import "eagle-plugin-dts";
```

Use a type reference instead:

```ts
/// <reference types="eagle-plugin-dts" />
```

## Recommended tsconfig

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": false
  },
  "include": [
    "src",
    "env.d.ts"
  ]
}
```

If your plugin uses Node.js APIs, install Node.js types separately.

```bash
pnpm add -D @types/node
```

Then include them explicitly if needed.

```json
{
  "compilerOptions": {
    "types": [
      "node",
      "eagle-plugin-dts"
    ]
  }
}
```

## Type coverage

The package covers all modules in the official core Eagle Plugin API reference:

- `eagle.app`
- `eagle.item`
- `eagle.folder`
- `eagle.smartFolder` (optional; check runtime availability)
- `eagle.tag`
- `eagle.tagGroup`
- `eagle.library`
- `eagle.window`
- `eagle.os`
- `eagle.screen`
- `eagle.notification`
- `eagle.contextMenu`
- `eagle.dialog`
- `eagle.clipboard`
- `eagle.drag`
- `eagle.shell`
- `eagle.log`

It also includes the lifecycle methods exposed directly on `eagle`, instance types such as `Item`, `Folder`, and `SmartFolder`, and manifest types for all four official plugin forms.

FFmpeg, AI SDK, and AI Search are optional extra modules and are not currently included.

Features introduced in newer Eagle builds are included in the main type and annotated with their minimum build in JSDoc.

## Electron-compatible structures

Some Eagle methods accept or return objects modeled after Electron, including `Display`, `NativeImage`, dialog options, rectangles, and context-menu items.

This package declares only the structures and methods guaranteed by the Eagle documentation. It verifies those declarations against Electron during package development, but does not require plugin projects to install Electron.

The deprecated names `Eagle.Bounds`, `Eagle.DisplayLike`, `Eagle.NativeImageLike`, and `Eagle.MenuItemLike` remain as aliases for migration.

## Corrections from 0.0.1

- Lifecycle methods are declared directly on `eagle`; the undocumented `eagle.event` property was removed.
- The recent-folders method is `eagle.folder.getRecents()`.
- Open and save dialogs return separate result types.
- `eagle.window.getBounds()` returns one rectangle and `setReferer()` is synchronous.
- `NativeImage` conversion methods return `Buffer` or `string` synchronously.

## Contributing

Run `pnpm test`, `pnpm lint`, and `pnpm --filter eagle-plugin-dts pack:dry` before submitting changes.

## References

- Eagle Plugin API: https://developer.eagle.cool/plugin-api
- Eagle Plugin API Japanese documentation: https://developer.eagle.cool/plugin-api/ja-jp
- Eagle Plugin API reference: https://developer.eagle.cool/plugin-api/api
- Eagle manifest reference: https://developer.eagle.cool/plugin-api/tutorial/manifest

## License

MIT
