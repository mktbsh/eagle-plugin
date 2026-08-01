# eagle-plugin

`eagle-plugin` provides the `eagle` command used inside a generated project.

## Commands

```bash
eagle dev
eagle build
eagle check
```

- `eagle dev` starts the local development bridge and Vite watcher.
- `eagle build` creates a clean production release directory.
- `eagle check` runs release preflight and can emit JSON for automation.

The current `0.1.0` release provides the end-to-end Vanilla TypeScript Window workflow. The command surface is intentionally shared so additional Eagle plugin forms can be added without changing the author workflow.
