# create-eagle-plugin

Create a typed Eagle plugin project.

## Usage

```bash
pnpm create eagle-plugin
```

The interactive flow asks for an output directory, plugin topology, and UI template. The first supported combination is a Vanilla TypeScript Window plugin.

For CI or another non-interactive environment, pass every selection explicitly.

```bash
pnpm create eagle-plugin my-plugin --topology window --template vanilla-ts
```

The generator refuses to modify a non-empty output directory by default. `--force` means replacing the entire directory, including files not created by the generator.

## Generated project

The project contains:

- a typed `eagle.config.ts`;
- a Vanilla TypeScript Window entrypoint;
- an `eagle-plugin-dts` type reference;
- TypeScript and build scripts;
- a starter logo and styles.

After generation:

```bash
cd my-plugin
pnpm install
pnpm typecheck
pnpm dev
pnpm build
pnpm check
```

## License

MIT
