import "./window.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (app !== null) {
  app.innerHTML = `<main>
    <h1>Eagle Plugin Skeleton</h1>
    <p>Ticket 05 manual verification sample.</p>
    <button type="button" data-action="increment">Click me</button>
    <p data-role="status">Clicks: 0</p>
    <section class="panel">
      <h2>Eagle API probe</h2>
      <p>Read-only API calls from this Window:</p>
      <pre class="api-output"><code data-role="api-probes">Loading…</code></pre>
    </section>
  </main>`;

  const button = app.querySelector<HTMLButtonElement>(
    '[data-action="increment"]',
  );
  const status = app.querySelector<HTMLParagraphElement>(
    '[data-role="status"]',
  );
  let clickCount = 0;

  button?.addEventListener("click", () => {
    clickCount += 1;
    if (status !== null) {
      status.textContent = `Clicks: ${clickCount}`;
    }
  });

  type ProbeReader = () => unknown | Promise<unknown>;

  const probes: ReadonlyArray<readonly [string, ProbeReader]> = [
    ["eagle.app.version", () => eagle.app.version],
    ["eagle.app.build", () => eagle.app.build],
    ["eagle.app.locale", () => eagle.app.locale],
    ["eagle.app.theme", () => eagle.app.theme],
    ["eagle.app.isDarkColors()", () => eagle.app.isDarkColors()],
    [
      "eagle.window.getSize()",
      async () => {
        const [width, height] = await eagle.window.getSize();
        return `${width} × ${height}`;
      },
    ],
  ];

  const probeOutput = app.querySelector<HTMLElement>(
    '[data-role="api-probes"]',
  );

  const formatProbeValue = (value: unknown): string => {
    if (value === undefined) {
      return "(undefined)";
    }
    if (value === null) {
      return "(null)";
    }
    if (typeof value === "string") {
      return value.length === 0 ? "(empty string)" : value;
    }
    return String(value);
  };

  const runApiProbe = async (): Promise<void> => {
    if (probeOutput === null) {
      return;
    }

    const lines: string[] = [];
    for (const [label, read] of probes) {
      try {
        lines.push(`${label} = ${formatProbeValue(await read())}`);
      } catch (error) {
        lines.push(
          `${label} = Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
      probeOutput.textContent = lines.join("\n");
    }
  };

  void runApiProbe();
}
