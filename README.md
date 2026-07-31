# eagle-plugin

Monorepo for Eagle plugin utilities.

## Packages

| Package | Version | Description |
|---------|---------|-------------|
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

## Contributing

Pull requests are welcome.

## License

MIT
