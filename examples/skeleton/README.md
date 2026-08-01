# Eagle Plugin Skeleton

This is the tracked Vanilla TypeScript Window project for manually verifying
the Eagle 4 development loop. It is intentionally small and is separate from
the generator's temporary test projects and the official Eagle examples.

## Run

From the repository root:

```sh
pnpm install
pnpm --filter eagle-plugin-example-skeleton typecheck
pnpm --filter eagle-plugin-example-skeleton dev
```

The command prints the stable `.eagle-plugin-dev` directory. In Eagle 4.0,
choose `Plugin > Import Local Project` and import that directory.

Confirm that the Window appears, then edit the text in
`entrypoints/window.ts` and save it. The change should appear in Eagle through
the local bridge without importing a different directory. Keep the dev command
running while testing.

The other command-surface checks are:

```sh
pnpm --filter eagle-plugin-example-skeleton build
pnpm --filter eagle-plugin-example-skeleton check
```
