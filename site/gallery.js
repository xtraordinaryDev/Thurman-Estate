/* The Thurman Place — gallery
   Every photo and clip, grouped and filterable, with a full-screen viewer. */
(function () {
  "use strict";

  // type: photo | video. group: pond | house | people | land. Newest work is listed last.
  const ITEMS = [
    // ---- 2022
    { type: "video", src: "video/remodel.mp4", poster: "video/remodel.jpg", date: "Jul 2022", group: "people", cap: "Two generations at one wall.", portrait: true },
    { type: "video", src: "video/backhoe.mp4", poster: "video/backhoe.jpg", date: "Jul 2022", group: "house", cap: "The backhoe from the tractor seat.", portrait: true },
    { type: "photo", src: "images/remodel-two-generations.jpg", date: "Summer 2022", group: "people", cap: "Watching the cut.", portrait: true },
    { type: "photo", src: "images/backhoe-from-tractor.jpg", date: "Summer 2022", group: "house", cap: "Backhoe at work.", portrait: true },
    { type: "photo", src: "images/foundation-forms.jpg", date: "Oct 2022", group: "house", cap: "Forms staked out in the field." },
    { type: "video", src: "video/groundbreaking.mp4", poster: "video/groundbreaking.jpg", date: "Oct 2022", group: "house", cap: "Walking the staked foundation." },
    { type: "photo", src: "images/forms-and-backhoe.jpg", date: "Oct 2022", group: "house", cap: "Forms and the backhoe." },
    { type: "photo", src: "images/panorama-backhoe-forms.jpg", date: "2022", group: "house", cap: "Panorama: backhoe standing by the foundation." },
    { type: "photo", src: "images/overhead-site-start.jpg", date: "2022", group: "land", cap: "The site from above, first weeks." },
    { type: "video", src: "video/site-overhead.mp4", poster: "video/site-overhead.jpg", date: "2022", group: "land", cap: "Camera on the pole: the site over the first weeks. Low resolution." },
    { type: "photo", src: "images/pond-wide-clouds.jpg", date: "2022", group: "pond", cap: "The new pond under a heavy sky." },
    // ---- 2023
    { type: "photo", src: "images/family-in-frame-1.jpg", date: "Apr 2023", group: "people", cap: "Walls-up day. Everybody in the frame." },
    { type: "photo", src: "images/family-in-frame-2.jpg", date: "Apr 2023", group: "people", cap: "Walls-up day, take two." },
    { type: "photo", src: "images/family-in-frame-3.jpg", date: "Apr 2023", group: "people", cap: "Walls-up day, waving." },
    { type: "photo", src: "images/family-in-frame-tilt.jpg", date: "Apr 2023", group: "people", cap: "Walls-up day, phone held sideways.", portrait: true },
    { type: "photo", src: "images/raising-walls.jpg", date: "Apr 2023", group: "people", cap: "Standing a wall by hand.", portrait: true },
    { type: "photo", src: "images/framed-house-sunset.jpg", date: "Spring 2023", group: "house", cap: "Framed and sheathed at sunset." },
    { type: "photo", src: "images/field-hay-bales.jpg", date: "Jul 2023", group: "land", cap: "The open field, tree line beyond." },
    { type: "photo", src: "images/field-hay-truck.jpg", date: "Jul 2023", group: "land", cap: "From the roof: the truck and the field." },
    { type: "video", src: "video/roofdeck.mp4", poster: "video/roofdeck.jpg", date: "Jul 2023", group: "land", cap: "Pan from the roof deck." },
    { type: "photo", src: "images/house-wrapped-front.jpg", date: "Nov 2023", group: "house", cap: "Wrapped, windows in, carport on the end." },
    { type: "photo", src: "images/interior-trusses-fan.jpg", date: "Nov 2023", group: "house", cap: "Trusses, a box fan, a school chair." },
    // ---- 2024
    { type: "video", src: "video/pond-winter.mp4", poster: "video/pond-winter.jpg", date: "Jan 2024", group: "pond", cap: "The pond, full, in January." },
    { type: "photo", src: "images/pond-four-on-bank.jpg", date: "Mar 2024", group: "pond", cap: "Four on the far bank." },
    { type: "photo", src: "images/pond-five-on-bank.jpg", date: "Mar 2024", group: "pond", cap: "Five on the far bank, reflected." },
    { type: "photo", src: "images/pond-red-clay-bank.jpg", date: "Mar 2024", group: "pond", cap: "The red clay bank.", portrait: true },
    { type: "video", src: "video/bank-family.mp4", poster: "video/bank-family.jpg", date: "Mar 2024", group: "pond", cap: "Everybody on the bank.", portrait: true },
    { type: "photo", src: "images/house-wrap-eave-sky.jpg", date: "May 2024", group: "house", cap: "Eave and wrap against the sky." },
    { type: "photo", src: "images/porch-rafters.jpg", date: "May 2024", group: "house", cap: "The porch rafters." },
    { type: "photo", src: "images/house-wrap-gable.jpg", date: "May 2024", group: "house", cap: "The gable end." },
    { type: "photo", src: "images/house-wrap-corner.jpg", date: "May 2024", group: "house", cap: "Corner detail, wrap and rafters." },
    { type: "photo", src: "images/house-wrapped-side.jpg", date: "May 2024", group: "house", cap: "The long side, wrapped.", portrait: true },
    { type: "photo", src: "images/house-wrapped-long.jpg", date: "May 2024", group: "house", cap: "The whole run of the house.", portrait: true },
    { type: "photo", src: "images/interior-trusses.jpg", date: "May 2024", group: "house", cap: "Trusses over the framed rooms." },
    { type: "photo", src: "images/interior-corridor.jpg", date: "May 2024", group: "house", cap: "Framed corridor." },
    { type: "photo", src: "images/interior-hall-long.jpg", date: "May 2024", group: "house", cap: "Down the hall." },
    { type: "photo", src: "images/interior-studs-hall.jpg", date: "May 2024", group: "house", cap: "Studs and the hall.", portrait: true },
    { type: "photo", src: "images/interior-studs.jpg", date: "May 2024", group: "house", cap: "Stud wall, window light.", portrait: true },
    { type: "photo", src: "images/interior-window.jpg", date: "May 2024", group: "house", cap: "One window, one truck, one field.", portrait: true },
    { type: "video", src: "video/framing-walk.mp4", poster: "video/framing-walk.jpg", date: "May 2024", group: "house", cap: "Walking the rooms.", portrait: true },
    { type: "video", src: "video/framing-2.mp4", poster: "video/framing-2.jpg", date: "May 2024", group: "house", cap: "Framing walkthrough, two.", portrait: true },
    { type: "video", src: "video/framing-3.mp4", poster: "video/framing-3.jpg", date: "May 2024", group: "house", cap: "Framing walkthrough, three.", portrait: true },
    { type: "video", src: "video/framing-4.mp4", poster: "video/framing-4.jpg", date: "May 2024", group: "house", cap: "Framing walkthrough, four.", portrait: true },
    { type: "video", src: "video/feeding.mp4", poster: "video/feeding.jpg", date: "Jun 2024", group: "pond", cap: "Feeding time. The water boils.", portrait: true },
    { type: "photo", src: "images/pond-catfish-ripple.jpg", date: "2024", group: "pond", cap: "One came up.", portrait: true },
    { type: "photo", src: "images/roof-shingle-bundles.jpg", date: "Oct 2024", group: "house", cap: "Bundles staged on the deck." },
    { type: "photo", src: "images/roofing-two-men.jpg", date: "Oct 2024", group: "people", cap: "Two men on the roof." },
    { type: "photo", src: "images/fishing-solo-golden.jpg", date: "Oct 2024", group: "pond", cap: "One line in the water.", portrait: true },
    { type: "photo", src: "images/fishing-three-golden.jpg", date: "Oct 2024", group: "pond", cap: "Three rods, last light.", portrait: true },
    { type: "video", src: "video/casting.mp4", poster: "video/casting.jpg", date: "Oct 2024", group: "pond", cap: "Casting at golden hour.", portrait: true },
    { type: "video", src: "video/three-rods.mp4", poster: "video/three-rods.jpg", date: "Oct 2024", group: "pond", cap: "Three rods. One second.", portrait: true },
    // ---- 2025
    { type: "photo", src: "images/oak-tree-work-crew.jpg", date: "Jul 2025", group: "people", cap: "Mixing under the big oak." },
    { type: "photo", src: "images/oak-tree-mixer.jpg", date: "Jul 2025", group: "people", cap: "The mixer, the tractor, the oak." },
    { type: "photo", src: "images/fence-posts-clouds.jpg", date: "Jul 2025", group: "land", cap: "The new fence line." },
    { type: "photo", src: "images/eldridge.jpg", date: "", group: "people", cap: "Eldridge Lee Thurman.", portrait: true },
    // ---- 2026
    { type: "video", src: "video/drywall.mp4", poster: "video/drywall.jpg", date: "Aug 2026", group: "house", cap: "Drywall going up.", portrait: true },
    { type: "video", src: "video/hero.mp4", poster: "video/hero.jpg", date: "2022 to 2024", group: "land", cap: "The montage from the front page." }
  ];

  const grid = document.getElementById("grid");
  const chips = Array.from(document.querySelectorAll("[data-filter]"));
  const count = document.getElementById("count");
  let filter = "all";
  let visible = [];

  function matches(it) {
    if (filter === "all") return true;
    if (filter === "photo" || filter === "video") return it.type === filter;
    return it.group === filter;
  }

  function render() {
    grid.innerHTML = "";
    visible = ITEMS.filter(matches);
    visible.forEach((it, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tile" + (it.portrait ? " tile--tall" : "") + (it.type === "video" ? " tile--video" : "");
      b.setAttribute("aria-label", (it.type === "video" ? "Play video: " : "Open photo: ") + it.cap);
      const img = document.createElement("img");
      img.src = it.type === "video" ? it.poster : it.src;
      img.alt = ""; img.loading = "lazy"; img.decoding = "async";
      const meta = document.createElement("span"); meta.className = "tile__meta";
      meta.textContent = (it.date ? it.date + " · " : "") + it.cap;
      b.append(img, meta);
      b.addEventListener("click", () => open(i));
      grid.append(b);
    });
    const p = visible.filter(x => x.type === "photo").length, v = visible.length - p;
    count.textContent = `${p} photo${p === 1 ? "" : "s"}, ${v} video${v === 1 ? "" : "s"}`;
    chips.forEach(c => c.setAttribute("aria-pressed", String(c.dataset.filter === filter)));
  }
  chips.forEach(c => c.addEventListener("click", () => { filter = c.dataset.filter; render(); }));

  /* ---------- viewer ---------- */
  const box = document.getElementById("viewer");
  const stage = document.getElementById("viewer-stage");
  const capEl = document.getElementById("viewer-cap");
  const posEl = document.getElementById("viewer-pos");
  let cur = -1, lastFocus = null;

  function show(i) {
    cur = i;
    const it = visible[i];
    stage.innerHTML = "";
    let el;
    if (it.type === "video") {
      el = document.createElement("video");
      el.src = it.src; el.poster = it.poster; el.controls = true; el.playsInline = true; el.autoplay = true; el.preload = "metadata";
      el.setAttribute("aria-label", it.cap);
    } else {
      el = document.createElement("img"); el.src = it.src; el.alt = it.cap;
    }
    stage.append(el);
    capEl.textContent = (it.date ? it.date + " · " : "") + it.cap;
    posEl.textContent = (i + 1) + " / " + visible.length;
  }
  function open(i) {
    lastFocus = document.activeElement;
    box.hidden = false; document.body.classList.add("viewing");
    show(i);
    box.querySelector(".viewer__close").focus();
  }
  function close() {
    stage.innerHTML = ""; box.hidden = true; document.body.classList.remove("viewing");
    if (lastFocus) lastFocus.focus();
  }
  const step = d => show((cur + d + visible.length) % visible.length);
  box.querySelector(".viewer__close").addEventListener("click", close);
  box.querySelector(".viewer__prev").addEventListener("click", () => step(-1));
  box.querySelector(".viewer__next").addEventListener("click", () => step(1));
  box.addEventListener("click", e => { if (e.target === box) close(); });
  document.addEventListener("keydown", e => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
  });
  // swipe on touch
  let sx = null;
  stage.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", e => {
    if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  render();
})();
