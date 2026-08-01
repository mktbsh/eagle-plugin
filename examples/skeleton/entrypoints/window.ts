import "./window.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (app !== null) {
  app.innerHTML = `<main>
    <h1>Eagle Plugin Skeleton</h1>
    <p>Ticket 05 manual verification sample.</p>
    <p>Running in Eagle ${eagle.app.version}</p>
    <button type="button" data-action="increment">Click me</button>
    <p data-role="status">Clicks: 0</p>
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
}
