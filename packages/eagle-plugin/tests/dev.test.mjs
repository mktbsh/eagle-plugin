import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { cliPath, prepareFixture, runCli } from "./project-fixture.mjs";

function startDev(projectRoot, args = []) {
  const child = spawn(process.execPath, [cliPath, "dev", ...args], {
    cwd: projectRoot,
    env: { ...process.env, NO_COLOR: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });
  return {
    child,
    stdout: () => stdout,
    stderr: () => stderr,
  };
}

function waitForOutput(stream, currentOutput, pattern, timeout = 10_000) {
  if (pattern.test(currentOutput())) {
    return Promise.resolve();
  }
  return new Promise((resolveWait, rejectWait) => {
    const timer = setTimeout(() => {
      cleanup();
      rejectWait(
        new Error(`Timed out waiting for ${pattern}:\n${currentOutput()}`),
      );
    }, timeout);
    const onData = () => {
      if (pattern.test(currentOutput())) {
        cleanup();
        resolveWait();
      }
    };
    const cleanup = () => {
      clearTimeout(timer);
      stream.off("data", onData);
    };
    stream.on("data", onData);
  });
}

async function stopDev(devProcess) {
  if (devProcess.child.exitCode !== null) {
    return;
  }
  const closed = new Promise((resolveClose) => {
    devProcess.child.once("close", resolveClose);
  });
  devProcess.child.kill("SIGTERM");
  await closed;
}

async function fetchUntil(url, expectedText) {
  let response;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    response = await fetch(url, { headers: { Origin: "null" } });
    const contents = await response.text();
    if (contents.includes(expectedText)) {
      return { response, contents };
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error(`Vite did not serve updated text: ${expectedText}`);
}

test("serves a stable local bridge and rebuilds reload-required changes", async (t) => {
  const projectRoot = await prepareFixture("window-project", "eagle-dev-");
  const devProcess = startDev(projectRoot);
  t.after(async () => {
    await stopDev(devProcess);
    await rm(projectRoot, { recursive: true, force: true });
  });

  await waitForOutput(
    devProcess.child.stdout,
    devProcess.stdout,
    /Press Ctrl\+C to stop/u,
  );
  assert.match(devProcess.stdout(), /Eagle development server ready/u);
  assert.equal(devProcess.stderr(), "");
  assert.match(devProcess.stdout(), /Import this directory in Eagle:/u);
  assert.match(devProcess.stdout(), /Window updates: Vite/u);
  assert.match(devProcess.stdout(), /Reload in Eagle after eagle\.config\.ts/u);

  const serverUrl = /Vite server: (http:\/\/127\.0\.0\.1:\d+)/u.exec(
    devProcess.stdout(),
  )?.[1];
  assert.ok(serverUrl);

  const developmentPath = join(projectRoot, ".eagle-plugin-dev");
  const manifest = JSON.parse(
    await readFile(join(developmentPath, "manifest.json"), "utf8"),
  );
  assert.equal(manifest.main.url, "index.html");
  assert.doesNotMatch(manifest.main.url, /^https?:/u);

  const bridge = await readFile(join(developmentPath, "index.html"), "utf8");
  assert.match(bridge, new RegExp(`${serverUrl}/@vite/client`, "u"));
  assert.match(bridge, new RegExp(`${serverUrl}/entrypoints/window\\.ts`, "u"));
  assert.doesNotMatch(bridge, /ipc|webContents|executeJavaScript/iu);

  const entrypointUrl = `${serverUrl}/entrypoints/window.ts`;
  const initialResponse = await fetch(entrypointUrl, {
    headers: { Origin: "null" },
  });
  assert.equal(initialResponse.status, 200);
  assert.equal(
    initialResponse.headers.get("access-control-allow-origin"),
    "null",
  );

  await writeFile(
    join(projectRoot, "entrypoints", "window.ts"),
    `import "./window.css";

document.querySelector("#app")?.replaceChildren("watched-update");
`,
    "utf8",
  );
  const updated = await fetchUntil(entrypointUrl, "watched-update");
  assert.equal(updated.response.status, 200);
  assert.doesNotMatch(devProcess.stdout(), /Reload this plugin in Eagle/u);

  const configPath = join(projectRoot, "eagle.config.ts");
  const config = await readFile(configPath, "utf8");
  await writeFile(configPath, config.replace("width: 640", "width: 700"));
  await waitForOutput(
    devProcess.child.stdout,
    devProcess.stdout,
    /Development plugin rebuilt after configuration changed/u,
  );
  const updatedManifest = JSON.parse(
    await readFile(join(developmentPath, "manifest.json"), "utf8"),
  );
  assert.equal(updatedManifest.main.width, 700);
  assert.match(devProcess.stdout(), /Reload this plugin in Eagle:/u);

  const conflictingEntrypoint = join(projectRoot, "entrypoints", "service.ts");
  await writeFile(conflictingEntrypoint, "export {};\n", "utf8");
  await waitForOutput(
    devProcess.child.stderr,
    devProcess.stderr,
    /Development rebuild failed after entrypoint topology changed/u,
  );
  assert.match(devProcess.stderr(), /previous valid plugin directory/u);

  await rm(conflictingEntrypoint);
  await waitForOutput(
    devProcess.child.stdout,
    devProcess.stdout,
    /Development plugin rebuilt after entrypoint topology changed/u,
  );
});

test("reports occupied ports and invalid projects without staying alive", async () => {
  const socket = createServer();
  await new Promise((resolveListen, rejectListen) => {
    socket.once("error", rejectListen);
    socket.listen(0, "127.0.0.1", resolveListen);
  });
  const address = socket.address();
  assert.ok(address !== null && typeof address !== "string");
  const projectRoot = await prepareFixture("window-project", "eagle-dev-");

  try {
    const occupied = await runCli(
      ["dev", "--port", String(address.port)],
      projectRoot,
    );
    assert.equal(occupied.code, 1);
    assert.equal(occupied.stdout, "");
    assert.match(occupied.stderr, /Unable to start.*development server/u);
    assert.match(occupied.stderr, /already in use|Port .* is in use/iu);

    const invalidRoot = await prepareFixture(
      "conflicting-project",
      "eagle-dev-invalid-",
    );
    try {
      const invalid = await runCli(["dev"], invalidRoot);
      assert.equal(invalid.code, 1);
      assert.equal(invalid.stdout, "");
      assert.match(invalid.stderr, /Conflicting plugin topology/u);
    } finally {
      await rm(invalidRoot, { recursive: true, force: true });
    }
  } finally {
    socket.close();
    await rm(projectRoot, { recursive: true, force: true });
  }
});

test("shows dev help and validates an explicit port", async () => {
  const help = await runCli(["dev", "--help"], tmpdir());
  assert.equal(help.code, 0);
  assert.match(help.stdout, /eagle dev \[--port <port>\]/u);
  assert.equal(help.stderr, "");

  const invalid = await runCli(["dev", "--port", "70000"], tmpdir());
  assert.equal(invalid.code, 2);
  assert.equal(invalid.stdout, "");
  assert.match(invalid.stderr, /Port must be an integer from 1 to 65535/u);
});
