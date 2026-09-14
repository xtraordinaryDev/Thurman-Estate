/* The Thurman Place — interactions
   1. Property map hotspots
   2. Pond ripples (tap the water)
   3. Then / now compare slider
   4. Memory wall (saved on this device)
   5. Nav current-chapter highlight */

(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Map ---------- */
  const SPOTS = {
    pond: {
      title: "The Pond",
      img: "images/pond-red-clay-bank.jpg",
      text: "Dug into red clay at the tree line, and the first thing Eldridge finished. It filled with rain, then with catfish, and it's where the family still gathers first when they come out."
    },
    house: {
      title: "The First House",
      img: "images/house-wrapped-front.jpg",
      text: "A long single-story home with a carport on the end, set in the middle of the open field. Foundation staked in October 2022. Walls up by spring, roofed and wrapped by that fall."
    },
    oak: {
      title: "The Big Oak",
      img: "images/oak-tree-mixer.jpg",
      text: "The shade tree where the trucks park and the mixer runs. Every work day starts and ends under it."
    },
    field: {
      title: "The Field",
      img: "images/field-hay-bales.jpg",
      text: "Most of the thirty-three acres is open ground between the pond and the house. Nothing is planted on it and nothing is fenced off yet. It's the room for everything still to come."
    },
    lots: {
      title: "The Homes to Come",
      img: "images/fence-posts-clouds.jpg",
      text: "Eldridge's plan was never one house. The fence line went in along the south side during the summer of 2025. The next homesites sit north and west of the first house, and the plan is the same for each: the family builds it, then sells it."
    }
  };

  const panelImg = document.getElementById("map-img");
  const panelTitle = document.getElementById("map-title");
  const panelText = document.getElementById("map-text");
  const hotButtons = document.querySelectorAll("[data-spot]");

  function selectSpot(key) {
    const s = SPOTS[key];
    if (!s) return;
    panelImg.src = s.img;
    panelImg.alt = s.title;
    panelTitle.textContent = s.title;
    panelText.textContent = s.text;
    hotButtons.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.spot === key)));
  }
  hotButtons.forEach(b => {
    b.addEventListener("click", () => selectSpot(b.dataset.spot));
    b.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectSpot(b.dataset.spot); } });
  });

  /* ---------- 2. Pond ripples ---------- */
  const canvas = document.getElementById("pond");
  const fallback = document.getElementById("pond-fallback");
  const countEl = document.getElementById("pond-count");
  let handfuls = 0;

  if (canvas && canvas.getContext && !reduceMotion) {
    const W = 360, H = Math.round(W / 2.7);
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const src = new Image();
    src.src = "images/pond-wide-clouds.jpg";
    let base = null, out = null;
    let buf1 = new Int16Array(W * H), buf2 = new Int16Array(W * H);
    let running = false, raf = 0, lastDrip = 0;

    src.onload = () => {
      const off = document.createElement("canvas");
      off.width = W; off.height = H;
      const octx = off.getContext("2d");
      // cover-fit the image
      const s = Math.max(W / src.naturalWidth, H / src.naturalHeight);
      const dw = src.naturalWidth * s, dh = src.naturalHeight * s;
      octx.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh);
      base = octx.getImageData(0, 0, W, H);
      out = ctx.createImageData(W, H);
      ctx.putImageData(base, 0, 0);
      if (fallback) fallback.hidden = true;
      canvas.hidden = false;
      // a first ripple so the water is visibly alive
      drop(W * 0.55, H * 0.62, 260);
      start();
    };
    src.onerror = () => { canvas.hidden = true; if (fallback) fallback.hidden = false; };

    function drop(x, y, strength) {
      const r = 3;
      for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
        const px = Math.round(x + i), py = Math.round(y + j);
        if (px > 1 && px < W - 2 && py > 1 && py < H - 2) buf1[py * W + px] += strength;
      }
    }

    function step(now) {
      // classic 2D height-field ripple
      for (let y = 1; y < H - 1; y++) {
        const row = y * W;
        for (let x = 1; x < W - 1; x++) {
          const i = row + x;
          let v = ((buf1[i - 1] + buf1[i + 1] + buf1[i - W] + buf1[i + W]) >> 1) - buf2[i];
          v -= v >> 5; // damping
          buf2[i] = v;
        }
      }
      // render displaced pixels
      const bd = base.data, od = out.data;
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const i = y * W + x;
          const dx = (buf2[i - 1] - buf2[i + 1]) >> 3;
          const dy = (buf2[i - W] - buf2[i + W]) >> 3;
          let sx = x + dx, sy = y + dy;
          if (sx < 0) sx = 0; else if (sx >= W) sx = W - 1;
          if (sy < 0) sy = 0; else if (sy >= H) sy = H - 1;
          const si = (sy * W + sx) * 4, oi = i * 4;
          const shade = (buf2[i - 1] - buf2[i + 1]) >> 2; // light on the crest
          od[oi] = bd[si] + shade; od[oi + 1] = bd[si + 1] + shade; od[oi + 2] = bd[si + 2] + shade; od[oi + 3] = 255;
        }
      }
      ctx.putImageData(out, 0, 0);
      const t = buf1; buf1 = buf2; buf2 = t;
      // a fish comes up now and then
      if (now - lastDrip > 2600 + Math.random() * 2400) {
        lastDrip = now;
        drop(W * (0.15 + Math.random() * 0.7), H * (0.55 + Math.random() * 0.4), 90 + Math.random() * 90);
      }
      if (running) raf = requestAnimationFrame(step);
    }
    function start() { if (!running && base) { running = true; lastDrip = performance.now(); raf = requestAnimationFrame(step); } }
    function stop() { running = false; cancelAnimationFrame(raf); }

    const io = new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting ? start() : stop()), { threshold: 0.05 });
    io.observe(canvas);

    function toss(clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      const x = (clientX - r.left) / r.width * W, y = (clientY - r.top) / r.height * H;
      drop(x, y, 420);
      // a few pellets scatter around the hand
      for (let k = 0; k < 4; k++) drop(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 14, 120);
      handfuls += 1;
      if (countEl) countEl.textContent = handfuls === 1 ? "1 handful tossed" : handfuls + " handfuls tossed";
      start();
    }
    canvas.addEventListener("pointerdown", e => { e.preventDefault(); toss(e.clientX, e.clientY); });
    canvas.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); const r = canvas.getBoundingClientRect(); toss(r.left + r.width * (0.2 + Math.random() * 0.6), r.top + r.height * 0.7); }
    });
  } else if (canvas) {
    canvas.hidden = true;
    if (fallback) fallback.hidden = false;
  }

  /* ---------- 3. Compare slider ---------- */
  const cmp = document.getElementById("compare");
  if (cmp) {
    const range = cmp.querySelector("input[type=range]");
    const set = v => cmp.style.setProperty("--pos", v + "%");
    set(range.value);
    range.addEventListener("input", () => set(range.value));
  }

  /* ---------- 4. Memory wall ---------- */
  const KEY = "thurman-place-memories-v1";
  const wall = document.getElementById("wall");
  const form = document.getElementById("mem-form");
  const status = document.getElementById("mem-status");
  const copyBtn = document.getElementById("mem-copy");

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* private window or blocked storage */ } }

  function card(m) {
    const el = document.createElement("article");
    el.className = "card";
    const q = document.createElement("blockquote"); q.textContent = m.text;
    const who = document.createElement("div"); who.className = "who";
    const a = document.createElement("span"); a.textContent = m.name || "A family member";
    const b = document.createElement("span"); b.textContent = m.date || "";
    who.append(a, b);
    const del = document.createElement("button"); del.type = "button"; del.className = "del"; del.textContent = "Remove";
    del.setAttribute("aria-label", "Remove this memory from this device");
    del.addEventListener("click", () => { const list = load().filter(x => x.id !== m.id); save(list); render(); });
    el.append(del, q, who);
    return el;
  }
  function render() {
    if (!wall) return;
    wall.querySelectorAll(".card:not(.card--prompt)").forEach(n => n.remove());
    const list = load().sort((x, y) => (y.ts || 0) - (x.ts || 0));
    list.forEach(m => wall.prepend(card(m)));
  }
  render();

  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const name = form.elements["mem-name"].value.trim();
      const text = form.elements["mem-text"].value.trim();
      if (!text) { status.textContent = "Write the memory first, then add it."; form.elements["mem-text"].focus(); return; }
      const now = new Date();
      const m = { id: String(now.getTime()) + Math.random().toString(16).slice(2, 6), name, text, ts: now.getTime(),
        date: now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) };
      const list = load(); list.push(m); save(list); render();
      form.reset();
      status.textContent = "Added to the wall on this device. Use “Copy to share” to send it to whoever keeps the site.";
    });
  }
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const name = form.elements["mem-name"].value.trim() || "A family member";
      const text = form.elements["mem-text"].value.trim();
      if (!text) { status.textContent = "Write the memory first, then copy it."; return; }
      const out = `Memory of Eldridge, from ${name}:\n\n${text}`;
      try { await navigator.clipboard.writeText(out); status.textContent = "Copied. Paste it into a text or email to the family."; }
      catch { status.textContent = "Couldn’t reach the clipboard. Select the text and copy it by hand."; }
    });
  }

  /* ---------- 5. Nav highlight ---------- */
  const links = Array.from(document.querySelectorAll(".nav a[href^='#']"));
  const targets = links.map(l => document.querySelector(l.getAttribute("href"))).filter(Boolean);
  if (targets.length && "IntersectionObserver" in window) {
    const nio = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) links.forEach(l => l.setAttribute("aria-current", String(l.getAttribute("href") === "#" + en.target.id)));
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    targets.forEach(t => nio.observe(t));
  }
  /* ---------- Hero montage: respect reduced motion ---------- */
  const heroVideo = document.getElementById("hero-video");
  if (heroVideo && reduceMotion) { heroVideo.removeAttribute("autoplay"); heroVideo.pause(); }

  /* ---------- 6. Video: play when in view, tap to pause, one sound at a time ---------- */
  const vids = Array.from(document.querySelectorAll(".vid__frame video"));
  if (vids.length) {
    const tryPlay = v => { const r = v.play(); if (r && r.catch) r.catch(() => {}); };
    const frameOf = v => v.closest(".vid__frame");
    const vio = new IntersectionObserver(entries => entries.forEach(en => {
      const v = en.target;
      if (en.isIntersecting && en.intersectionRatio >= 0.35) {
        if (!v.dataset.userPaused && !reduceMotion) { tryPlay(v); frameOf(v).classList.remove("is-paused"); }
      } else {
        v.pause();
        if (!v.muted) { v.muted = true; const b = frameOf(v).querySelector(".vid__sound"); if (b) { b.setAttribute("aria-pressed", "false"); b.setAttribute("aria-label", "Turn sound on"); } }
      }
    }), { threshold: [0, 0.35, 0.6] });
    vids.forEach(v => {
      vio.observe(v);
      if (reduceMotion) frameOf(v).classList.add("is-paused");
      v.addEventListener("click", () => {
        if (v.paused) { delete v.dataset.userPaused; tryPlay(v); frameOf(v).classList.remove("is-paused"); }
        else { v.dataset.userPaused = "1"; v.pause(); frameOf(v).classList.add("is-paused"); }
      });
      const btn = frameOf(v).querySelector(".vid__sound");
      if (btn) btn.addEventListener("click", () => {
        const on = v.muted; // turning sound on?
        vids.forEach(o => { if (o !== v && !o.muted) { o.muted = true; const ob = frameOf(o).querySelector(".vid__sound"); if (ob) { ob.setAttribute("aria-pressed", "false"); ob.setAttribute("aria-label", "Turn sound on"); } } });
        v.muted = !on;
        btn.setAttribute("aria-pressed", String(on));
        btn.setAttribute("aria-label", on ? "Turn sound off" : "Turn sound on");
        if (on && v.paused) { delete v.dataset.userPaused; tryPlay(v); frameOf(v).classList.remove("is-paused"); }
      });
    });
  }
})();
