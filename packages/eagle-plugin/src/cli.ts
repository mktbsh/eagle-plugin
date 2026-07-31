#!/usr/bin/env node

import { join, relative } from "node:path";
import { parseArgs } from "node:util";
import { buildProject } from "./build.js";
import { inspectRelease, renderPreflightResult } from "./check.js";

const rootHelp = `Build and validate Eagle plugins.

Usage:
  eagle <command>

Commands:
  build    Create a production build
  check    Inspect the production release candidate

Examples:
  eagle build
  eagle check

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
    io.stdout.write(rootHelp);
    return args.length === 1 ? 0 : 1;
  }

  if (hasHelp(args) && args[0] !== "build" && args[0] !== "check") {
    io.stdout.write(rootHelp);
    return 0;
  }

  if (args[0] === "build") {
    return runBuild(args.slice(1), io);
  }

  if (args[0] === "check") {
    return runCheck(args.slice(1), io);
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
