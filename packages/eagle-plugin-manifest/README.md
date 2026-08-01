# eagle-plugin-manifest

Runtime validation, TypeScript types, and JSON Schema for Eagle plugin manifests.

## Installation

```bash
pnpm add eagle-plugin-manifest
```

## Validate unknown input

Use `parseManifest` at trust boundaries. It returns validated manifest data or throws `ManifestValidationError` with structured issues.

```ts
import {
  ManifestValidationError,
  parseManifest,
} from "eagle-plugin-manifest";

try {
  const manifest = parseManifest(JSON.parse(source));
  console.log(manifest.name);
} catch (error) {
  if (error instanceof ManifestValidationError) {
    console.error(error.issues);
  }
}
```

Use `validateManifest` when the caller needs a result value instead of an exception.

```ts
import { validateManifest } from "eagle-plugin-manifest";

const result = validateManifest(input);

if (!result.success) {
  console.error(result.issues);
}
```

Every issue contains a `path`, stable `code`, and human-readable `message`.

## Define a typed manifest

`defineManifest` preserves literal inference while checking the manifest shape at compile time.

```ts
import { defineManifest } from "eagle-plugin-manifest";

export default defineManifest({
  id: "example-plugin",
  version: "1.0.0",
  name: "Example Plugin",
  logo: "/logo.png",
  keywords: [],
  main: {
    url: "index.html",
  },
});
```

## JSON Schema

`manifestJsonSchema` is generated from the same schema as the runtime validator and TypeScript types.

```ts
import { manifestJsonSchema } from "eagle-plugin-manifest";
```

## Supported plugin forms

- Window
- Background Service
- Format Preview
- Inspector

Objects are strict. Unknown fields are reported instead of being removed silently.

## Development

```bash
pnpm test
pnpm run pack:dry
```

## References

- [Eagle manifest documentation](https://developer.eagle.cool/plugin-api/tutorial/manifest)
- [Official Eagle plugin examples](https://github.com/eagle-app/eagle-plugin-examples)

## License

MIT
