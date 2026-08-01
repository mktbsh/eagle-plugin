# Development loop

## Start the development server

From the generated project:

```bash
pnpm dev
```

The command creates a stable development-plugin directory and starts a Vite server. Import the reported development-plugin directory into Eagle once.

## Window updates

For the verified Eagle 4.0 Window workflow:

- CSS changes are applied through Vite HMR.
- Module changes reload the local bridge.
- Eagle configuration and entrypoint topology changes require an explicit reload in Eagle.

The development command prints the import path, server URL, and reload guidance. It does not use Eagle's private reload IPC.

## When a build fails

The development loop uses the same configuration and entrypoint discovery rules as production build. Fix the reported configuration or entrypoint error, then let the watcher rebuild. Eagle continues to use the previous valid development plugin when a rebuild fails.

## Runtime scope

The current end-to-end development evidence covers Vanilla TypeScript Window plugins. Other plugin forms and UI strategies should be treated as unsupported until their own Eagle runtime behavior is verified.
