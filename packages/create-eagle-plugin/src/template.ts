import { Buffer } from "node:buffer";

export interface GeneratedFile {
  readonly path: string;
  readonly contents: string | Uint8Array;
}

export interface GeneratedProject {
  readonly packageName: string;
  readonly files: readonly GeneratedFile[];
}

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function createVanillaWindowProject(
  packageName: string,
): GeneratedProject {
  return {
    packageName,
    files: [
      {
        path: "package.json",
        contents: json({
          name: packageName,
          version: "0.0.0",
          private: true,
          type: "module",
          scripts: {
            typecheck: "tsc --noEmit",
            build: "eagle build",
            check: "eagle check",
          },
          devDependencies: {
            "@types/node": "26.1.1",
            "eagle-plugin": "0.0.1",
            "eagle-plugin-dts": "0.0.1",
            typescript: "7.0.2",
          },
          engines: {
            node: "^20.19.0 || >=22.12.0",
          },
        }),
      },
      {
        path: "tsconfig.json",
        contents: json({
          compilerOptions: {
            target: "ES2022",
            module: "ESNext",
            moduleResolution: "Bundler",
            lib: ["ES2022", "DOM"],
            strict: true,
            noEmit: true,
            skipLibCheck: false,
            types: ["node"],
          },
          include: ["eagle.config.ts", "env.d.ts", "entrypoints/**/*.ts"],
        }),
      },
      {
        path: "eagle.config.ts",
        contents: `import { defineConfig } from "eagle-plugin";

export default defineConfig({
  id: "${packageName}",
  version: "0.0.0",
  name: "${packageName}",
  logo: "logo.png",
  keywords: [],
  window: {
    width: 640,
    height: 480,
  },
});
`,
      },
      {
        path: "env.d.ts",
        contents: `/// <reference types="eagle-plugin-dts" />

declare module "*.css";
`,
      },
      {
        path: "entrypoints/window.ts",
        contents: `import "./window.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (app !== null) {
  app.innerHTML = \`<main>
    <h1>${packageName}</h1>
    <p>Running in Eagle \${eagle.app.version}</p>
  </main>\`;
}
`,
      },
      {
        path: "entrypoints/window.css",
        contents: `:root {
  color: #1f2937;
  font-family: system-ui, sans-serif;
}

body {
  margin: 0;
  padding: 2rem;
}
`,
      },
      {
        path: "logo.png",
        contents: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZlDkAAAAASUVORK5CYII=",
          "base64",
        ),
      },
      {
        path: ".gitignore",
        contents: `node_modules/
dist/
.eagle-plugin-build/
*.eagleplugin
`,
      },
      {
        path: "README.md",
        contents: `# ${packageName}

Vanilla TypeScript Window plugin for Eagle.

## Commands

\`pnpm typecheck\` checks the project without emitting files.

\`pnpm build\` writes the Eagle release candidate to \`dist/\`.

\`pnpm check\` runs the release Preflight after a successful build.

Replace \`logo.png\` with your plugin's artwork before distribution.
`,
      },
    ],
  };
}
