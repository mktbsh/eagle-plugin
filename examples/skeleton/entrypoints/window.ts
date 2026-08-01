import "./window.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (app !== null) {
  app.innerHTML = `<main>
    <h1>Eagle Plugin Skeleton</h1>
    <p data-role="status">Ready for Ticket 05 manual verification.</p>
    <p>Running in Eagle ${eagle.app.version}</p>
  </main>`;
}
