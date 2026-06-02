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

This package aims to cover the Eagle Plugin API.

Initial coverage may be partial. APIs are added based on the official Eagle Plugin API documentation and verified examples.

Planned areas include:

- `eagle.app`
- `eagle.item`
- `eagle.folder`
- `eagle.smartFolder`
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
- Additional modules such as FFmpeg, AI SDK, and AI Search when applicable

## Contributing

Developer documentation will be provided in `CONTRIBUTOR.md`.

## References

- Eagle Plugin API: https://developer.eagle.cool/plugin-api
- Eagle Plugin API Japanese documentation: https://developer.eagle.cool/plugin-api/ja-jp
- Eagle Plugin API app reference: https://developer.eagle.cool/plugin-api/api/app

## License

MIT
