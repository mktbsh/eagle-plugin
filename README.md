# eagle-plugin

Monorepo for Eagle plugin utilities.

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [create-eagle-plugin](./packages/create-eagle-plugin) | 0.0.1 | Interactive and non-interactive Eagle plugin project generator |
| [eagle-plugin](./packages/eagle-plugin) | 0.0.1 | Framework and `eagle` command for Eagle plugin development |
| [eagle-plugin-dts](./packages/eagle-plugin-dts) | ![npm](https://img.shields.io/npm/v/eagle-plugin-dts) | TypeScript type definitions for the Eagle Plugin API |
| [eagle-plugin-manifest](./packages/eagle-plugin-manifest) | 0.0.1 | Runtime validation and JSON Schema for Eagle plugin manifests |

## Development

This repository uses [pnpm](https://pnpm.io/) and workspaces.

```bash
# Install dependencies
pnpm install

# Run all tests
pnpm test

# Lint
pnpm lint

# Fix lint errors
pnpm lint:fix

# Format
pnpm format
```

## Manual example

[`examples/skeleton`](./examples/skeleton) is a tracked Vanilla TypeScript
Window project for manually verifying the Eagle 4 development loop. It uses
the workspace packages directly, so it does not depend on a published package
version.

## Contributing

Pull requests are welcome.

## License

MIT
