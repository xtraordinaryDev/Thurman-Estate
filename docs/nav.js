/* Mobile menu */
(function () {
  const bar = document.querySelector(".nav");
  const btn = document.getElementById("nav-toggle");
  const menu = document.getElementById("chapters");
  if (!bar || !btn || !menu) return;
  const set = open => {
    bar.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  btn.addEventListener("click", () => set(!bar.classList.contains("is-open")));
  menu.addEventListener("click", e => { if (e.target.closest("a")) set(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && bar.classList.contains("is-open")) { set(false); btn.focus(); } });
  document.addEventListener("click", e => { if (bar.classList.contains("is-open") && !bar.contains(e.target)) set(false); });
  window.matchMedia("(min-width: 701px)").addEventListener("change", e => { if (e.matches) set(false); });
})();
