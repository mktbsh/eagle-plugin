#!/usr/bin/env node

import { relative, resolve } from "node:path";
import { createInterface, type Interface } from "node:readline";
import { parseArgs } from "node:util";
import { CancellationError, UsageError } from "./errors.js";
import {
  type GenerationSelection,
  generateProject,
  inspectDestination,
} from "./generate.js";

const help = `Create a typed Eagle plugin project.

Usage:
  create-eagle-plugin [directory] [options]

Options:
  --directory <path>       Output directory instead of the positional argument
  --topology <topology>    Plugin topology: window
  --template <template>    UI template: vanilla-ts
  --force                  Replace the entire non-empty output directory
  --interactive            Prompt even when input is not a terminal
  -h, --help               Show this help

Non-interactive example:
  create-eagle-plugin my-plugin --topology window --template vanilla-ts
`;

interface CliIo {
  readonly stdin: NodeJS.ReadableStream & { readonly isTTY?: boolean };
  readonly stdout: NodeJS.WriteStream;
  readonly stderr: NodeJS.WriteStream;
}

interface PromptSession {
  readonly readline: Interface;
  readonly answers: AsyncIterator<string>;
}

interface CliInput {
  readonly directory?: string;
  readonly topology?: string;
  readonly template?: string;
  readonly force: boolean;
  readonly interactive: boolean;
}

const cliOptions = {
  directory: { type: "string" },
  topology: { type: "string" },
  template: { type: "string" },
  force: { type: "boolean", default: false },
  interactive: { type: "boolean", default: false },
  help: { type: "boolean", short: "h", default: false },
} as const;

function parseRawArgs(args: readonly string[]) {
  return parseArgs({
    args,
    strict: true,
    allowPositionals: true,
    options: cliOptions,
  });
}

function parseCliInput(
  args: readonly string[],
  io: CliIo,
): CliInput | undefined {
  let parsed: ReturnType<typeof parseRawArgs>;
  try {
    parsed = parseRawArgs(args);
  } catch (error) {
    throw new UsageError(
      error instanceof Error ? error.message : String(error),
    );
  }

  if (parsed.values.help) {
    io.stdout.write(help);
    return undefined;
  }
  if (parsed.positionals.length > 1) {
    throw new UsageError("Expected at most one output directory");
  }
  if (
    parsed.positionals[0] !== undefined &&
    parsed.values.directory !== undefined
  ) {
    throw new UsageError(
      "Pass the output directory either positionally or with --directory, not both",
    );
  }

  return {
    directory: parsed.values.directory ?? parsed.positionals[0],
    topology: parsed.values.topology,
    template: parsed.values.template,
    force: parsed.values.force ?? false,
    interactive:
      (parsed.values.interactive ?? false) ||
      (io.stdin.isTTY === true && io.stdout.isTTY === true),
  };
}

async function question(
  session: PromptSession,
  io: CliIo,
  prompt: string,
): Promise<string> {
  io.stdout.write(prompt);
  const answer = await session.answers.next();
  if (answer.done) {
    throw new CancellationError("Project creation cancelled");
  }
  return answer.value.trim();
}

async function requiredChoice<const Choice extends string>(
  session: PromptSession,
  io: CliIo,
  label: string,
  supplied: string | undefined,
  choices: readonly Choice[],
  defaultChoice: Choice,
): Promise<Choice> {
  if (supplied !== undefined) {
    if (choices.includes(supplied as Choice)) {
      return supplied as Choice;
    }
    throw new UsageError(
      `Invalid ${label}: ${supplied}. Expected one of: ${choices.join(", ")}`,
    );
  }

  while (true) {
    const answer = await question(
      session,
      io,
      `${label} (${choices.join("/")}) [${defaultChoice}]: `,
    );
    const value = answer.length === 0 ? defaultChoice : answer;
    if (choices.includes(value as Choice)) {
      return value as Choice;
    }
    io.stderr.write(
      `Invalid ${label}: ${value}. Expected one of: ${choices.join(", ")}\n`,
    );
  }
}

function suppliedChoice<const Choice extends string>(
  label: string,
  supplied: string,
  choices: readonly Choice[],
): Choice {
  if (choices.includes(supplied as Choice)) {
    return supplied as Choice;
  }
  throw new UsageError(
    `Invalid ${label}: ${supplied}. Expected one of: ${choices.join(", ")}`,
  );
}

function suppliedDirectory(value: string): string {
  const directory = value.trim();
  if (directory.length === 0 || directory.includes("\0")) {
    throw new UsageError("Output directory must be a non-empty path");
  }
  return directory;
}

async function resolveSelection(
  input: CliInput,
  io: CliIo,
  session: PromptSession | undefined,
): Promise<GenerationSelection> {
  if (!input.interactive) {
    const missing = [
      input.directory === undefined ? "directory" : undefined,
      input.topology === undefined ? "--topology" : undefined,
      input.template === undefined ? "--template" : undefined,
    ].filter((value): value is string => value !== undefined);
    if (missing.length > 0) {
      throw new UsageError(
        `Non-interactive mode requires: ${missing.join(", ")}`,
      );
    }
  }

  if (session === undefined) {
    if (
      input.directory === undefined ||
      input.topology === undefined ||
      input.template === undefined
    ) {
      throw new UsageError("Missing non-interactive project selection");
    }
    return {
      directory: suppliedDirectory(input.directory),
      topology: suppliedChoice("topology", input.topology, ["window"]),
      template: suppliedChoice("template", input.template, ["vanilla-ts"]),
    };
  }

  const directory =
    input.directory ??
    (await question(session, io, "Output directory [my-eagle-plugin]: "));
  return {
    directory:
      directory.length === 0 ? "my-eagle-plugin" : suppliedDirectory(directory),
    topology: await requiredChoice(
      session,
      io,
      "topology",
      input.topology,
      ["window"],
      "window",
    ),
    template: await requiredChoice(
      session,
      io,
      "template",
      input.template,
      ["vanilla-ts"],
      "vanilla-ts",
    ),
  };
}

async function confirmReplacement(
  selection: GenerationSelection,
  input: CliInput,
  session: PromptSession | undefined,
  io: CliIo,
): Promise<boolean> {
  const targetPath = resolve(process.cwd(), selection.directory);
  const state = await inspectDestination(targetPath);
  if (state !== "nonempty-directory" || input.force) {
    return input.force;
  }
  if (session === undefined) {
    return false;
  }
  const answer = await question(
    session,
    io,
    "Output directory is not empty. Replace the entire directory? [y/N]: ",
  );
  if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
    return true;
  }
  throw new CancellationError("Project creation cancelled");
}

async function runCli(args: readonly string[], io: CliIo): Promise<number> {
  let session: PromptSession | undefined;
  try {
    const input = parseCliInput(args, io);
    if (input === undefined) {
      return 0;
    }

    if (input.interactive) {
      const readline = createInterface({ input: io.stdin });
      readline.on("SIGINT", () => readline.close());
      session = {
        readline,
        answers: readline[Symbol.asyncIterator](),
      };
    }

    const selection = await resolveSelection(input, io, session);
    const replaceExisting = await confirmReplacement(
      selection,
      input,
      session,
      io,
    );
    const result = await generateProject(
      process.cwd(),
      selection,
      replaceExisting,
    );
    const output = relative(process.cwd(), result.outputPath) || ".";
    io.stdout.write(`Created ${result.packageName} in ${output}\n`);
    io.stdout.write(`Next: cd ${output} && pnpm install && pnpm build\n`);
    return 0;
  } catch (error) {
    if (error instanceof CancellationError) {
      io.stderr.write("Project creation cancelled. No project was created.\n");
      return 130;
    }
    const message = error instanceof Error ? error.message : String(error);
    io.stderr.write(`create-eagle-plugin: ${message}\n`);
    if (
      process.env.DEBUG !== undefined &&
      error instanceof Error &&
      error.stack !== undefined
    ) {
      io.stderr.write(`${error.stack}\n`);
    }
    return error instanceof UsageError ? 2 : 1;
  } finally {
    session?.readline.close();
  }
}

process.exitCode = await runCli(process.argv.slice(2), {
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
});
