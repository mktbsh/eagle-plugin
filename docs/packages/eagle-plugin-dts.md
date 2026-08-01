# eagle-plugin-dts

`eagle-plugin-dts` is a type-only package for the Eagle Plugin API.

## Usage

Reference the declarations from TypeScript rather than importing the package at runtime:

```ts
/// <reference types="eagle-plugin-dts" />

console.log(eagle.app.isDarkColors());
```

The package includes API declarations and `Eagle.ManifestJSON` types for Window, Background Service, Format Preview, and Inspector manifests. Runtime availability can still depend on the Eagle version and the loaded plugin context.
