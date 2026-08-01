# create-eagle-plugin

`create-eagle-plugin` generates a typed Eagle plugin project with the framework packages already configured.

## Usage

```bash
npx create-eagle-plugin my-plugin --topology window --template vanilla-ts
```

The generator supports interactive and non-interactive selection. The current public template is a Vanilla TypeScript Window project. The template catalog will grow as Service, Format Preview, and Inspector workflows become complete and verified.

## Generated project

The generated project includes:

- `eagle.config.ts` for authored plugin metadata.
- A convention-based Window entrypoint.
- TypeScript configuration with Eagle API declarations.
- `dev`, `build`, and `check` scripts.

See the [getting started guide](/guide/getting-started) for the complete flow.
