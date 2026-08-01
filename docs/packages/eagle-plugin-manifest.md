# eagle-plugin-manifest

`eagle-plugin-manifest` validates Eagle manifest data at the trust boundary and exports the corresponding JSON Schema and TypeScript types.

## Public API

```ts
import {
  defineManifest,
  parseManifest,
  validateManifest,
} from "eagle-plugin-manifest";
```

- `defineManifest` preserves a typed manifest literal.
- `validateManifest` returns structured issues without throwing.
- `parseManifest` returns validated data or throws `ManifestValidationError`.

The validator understands Window, Background Service, Format Preview, and Inspector manifest shapes. This package's broader manifest support should not be confused with the current Window-only generator and build workflow.
