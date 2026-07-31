#!/usr/bin/env node

import { join, relative } from "node:path";
import { parseArgs } from "node:util";
import { buildProject } from "./build.js";
import { inspectRelease, renderPreflightResult } from "./check.js";
import { type DevelopmentNotice, startDevelopment } from "./dev.js";

const rootHelp = `Build and validate Eagle plugins.

Usage:
  eagle <command>

Commands:
  build    Create a production build
  check    Inspect the production release candidate
  dev      Start the Eagle development loop

Examples:
  eagle build
  eagle check
  eagle dev

Run "eagle <command> --help" for command-specific help.
Report issues: https://github.com/mktbsh/eagle-plugin/issues
`;

const buildHelp = `Create a production build for an Eagle plugin.

Usage:
  eagle build

The command reads eagle.config.ts and entrypoints from the current directory,
then writes a clean release candidate to dist.
`;

const checkHelp = `Inspect the production release candidate in dist.

Usage:
  eagle check [--json]

Options:
  --json    Write the documented machine-readable result
`;

const devHelp = `Start the Eagle development loop.

Usage:
  eagle dev [--port <port>]

Options:
  --port <port>    Require a specific local Vite port
`;

interface CliIo {
  readonly stdout: Pick<NodeJS.WriteStream, "write">;
  readonly stderr: Pick<NodeJS.WriteStream, "write">;
}

function hasHelp(args: readonly string[]): boolean {
  return args.includes("--help") || args.includes("-h");
}

async function runBuild(args: readonly string[], io: CliIo): Promise<number> {
  if (hasHelp(args)) {
    io.stdout.write(buildHelp);
    return 0;
  }

  try {
    const parsed = parseArgs({ args, strict: true, allowPositionals: true });
    if (parsed.positionals.length > 0) {
      throw new TypeError(`Unexpected argument: ${parsed.positionals[0]}`);
    }

    const result = await buildProject(process.cwd());
    const output = relative(process.cwd(), result.outputPath) || ".";
    io.stdout.write(`Built Eagle plugin in ${output}\n`);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    io.stderr.write(`eagle build: ${message}\n`);
    if (
      process.env.DEBUG !== undefined &&
      error instanceof Error &&
      error.stack !== undefined
    ) {
      io.stderr.write(`${error.stack}\n`);
    }
    return 1;
  }
}

async function runCheck(args: readonly string[], io: CliIo): Promise<number> {
  if (hasHelp(args)) {
    io.stdout.write(checkHelp);
    return 0;
  }

  let json = false;
  try {
    const parsed = parseArgs({
      args,
      strict: true,
      allowPositionals: false,
      options: { json: { type: "boolean", default: false } },
    });
    json = parsed.values.json ?? false;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    io.stderr.write(`eagle check: ${message}\n`);
    return 2;
  }

  try {
    const result = await inspectRelease(join(process.cwd(), "dist"));
    io.stdout.write(
      json
        ? `${JSON.stringify(result, null, 2)}\n`
        : renderPreflightResult(result),
    );
    return result.mechanicalStatus === "pass" ? 0 : 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    io.stderr.write(`eagle check: ${message}\n`);
    if (
      process.env.DEBUG !== undefined &&
      error instanceof Error &&
      error.stack !== undefined
    ) {
      io.stderr.write(`${error.stack}\n`);
    }
    return 1;
  }
}

function parseDevelopmentPort(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!/^\d+$/u.test(value)) {
    throw new TypeError(`Invalid port: ${value}`);
  }
  const port = Number(value);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
    throw new TypeError(`Port must be an integer from 1 to 65535: ${value}`);
  }
  return port;
}

function reportDevelopmentNotice(notice: DevelopmentNotice, io: CliIo): void {
  const reasons = notice.reasons.join(" and ");
  if (notice.type === "reload-required") {
    io.stdout.write(
      `Development plugin rebuilt after ${reasons} changed. Reload this plugin in Eagle: ${notice.pluginPath}\n`,
    );
    return;
  }
  io.stderr.write(
    `Development rebuild failed after ${reasons} changed: ${notice.error.message}\nEagle continues to use the previous valid plugin directory: ${notice.pluginPath}\n`,
  );
}

async function runDev(args: readonly string[], io: CliIo): Promise<number> {
  if (hasHelp(args)) {
    io.stdout.write(devHelp);
    return 0;
  }

  let port: number | undefined;
  try {
    const parsed = parseArgs({
      args,
      strict: true,
      allowPositionals: false,
      options: { port: { type: "string" } },
    });
    port = parseDevelopmentPort(parsed.values.port);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    io.stderr.write(`eagle dev: ${message}\n`);
    return 2;
  }

  try {
    const session = await startDevelopment(
      process.cwd(),
      port === undefined ? {} : { port },
      (notice) => reportDevelopmentNotice(notice, io),
    );
    io.stdout.write("Eagle development server ready.\n");
    io.stdout.write(`Import this directory in Eagle: ${session.pluginPath}\n`);
    io.stdout.write(`Vite server: ${session.serverUrl}\n`);
    io.stdout.write(
      "Window updates: Vite applies CSS updates and reloads the local bridge for module changes.\n",
    );
    io.stdout.write(
      "Reload in Eagle after eagle.config.ts or entrypoint topology changes.\n",
    );
    io.stdout.write("Press Ctrl+C to stop.\n");

    const signal = await new Promise<"SIGINT" | "SIGTERM">((resolveSignal) => {
      process.once("SIGINT", () => resolveSignal("SIGINT"));
      process.once("SIGTERM", () => resolveSignal("SIGTERM"));
    });
    await session.close();
    return signal === "SIGINT" ? 130 : 143;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    io.stderr.write(`eagle dev: ${message}\n`);
    if (
      process.env.DEBUG !== undefined &&
      error instanceof Error &&
      error.stack !== undefined
    ) {
      io.stderr.write(`${error.stack}\n`);
    }
    return 1;
  }
}

async function runCli(args: readonly string[], io: CliIo): Promise<number> {
  if (args.length === 0) {
    io.stdout.write(rootHelp);
    return 1;
  }

  if (args[0] === "help") {
    if (args[1] === "build") {
      io.stdout.write(buildHelp);
      return 0;
    }
    if (args[1] === "check") {
      io.stdout.write(checkHelp);
      return 0;
    }
    if (args[1] === "dev") {
      io.stdout.write(devHelp);
      return 0;
    }
    io.stdout.write(rootHelp);
    return args.length === 1 ? 0 : 1;
  }

  if (
    hasHelp(args) &&
    args[0] !== "build" &&
    args[0] !== "check" &&
    args[0] !== "dev"
  ) {
    io.stdout.write(rootHelp);
    return 0;
  }

  if (args[0] === "build") {
    return runBuild(args.slice(1), io);
  }

  if (args[0] === "check") {
    return runCheck(args.slice(1), io);
  }

  if (args[0] === "dev") {
    return runDev(args.slice(1), io);
  }

  io.stderr.write(
    `Unknown command: ${args[0]}\nRun "eagle --help" to see available commands.\n`,
  );
  return 2;
}

process.exitCode = await runCli(process.argv.slice(2), {
  stdout: process.stdout,
  stderr: process.stderr,
});
