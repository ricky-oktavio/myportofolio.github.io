/**
 * Public portfolio UI: pixel sprites, halftone hero, clock, scroll reveal, project filter, lightbox.
 * dynamic-portfolio.js calls window.site.refresh() after it re-renders content.
 */
(() => {
  "use strict";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Sprite rows: '#' ink, 'a' accent, '.' empty.
  const SPRITES = {
    phone: [
      ".#######.", "#.......#", "#.aaaaa.#", "#.......#", "#.##.##.#", "#.##.##.#", "#.......#",
      "#.##.##.#", "#.##.##.#", "#.......#", "#.......#", "#...#...#", "#.......#", ".#######."
    ],
    chat: [
      ".#########.", "#.........#", "#..a.a.a..#", "#.........#", ".###..####.", "...#.#.....", "...##......"
    ],
    signal: ["......##", "......##", "...##.##", "...##.##", "##.##.##", "##.##.##"],
    wifi: ["..#####..", ".#.....#.", "#..###..#", "..#...#..", "....#....", "...#a#...", "....#...."],
    battery: ["##########..", "#.aaaaaa..#.", "#.aaaaaa..##", "#.aaaaaa..##", "#.aaaaaa..#.", "##########.."],
    cursor: ["#......", "##.....", "#a#....", "#aa#...", "#aaa#..", "#aaaa#.", "#aa###.", "#.#a#..", "...#a#.", "....##."],
    spark: ["...#...", "...#...", "..#a#..", "###a###", "..#a#..", "...#...", "...#..."],
    arrow: ["#########", ".#######.", "..#####..", "...###...", "....#...."]
  };

  const spriteSVG = (rows) => {
    const r = rows.length, c = Math.max(...rows.map((row) => row.length));
    let rects = "";
    rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === "#") rects += `<rect class="k" x="${x}" y="${y}" width="1" height="1"/>`;
      else if (ch === "a") rects += `<rect class="a" x="${x}" y="${y}" width="1" height="1"/>`;
    }));
    return `<svg viewBox="0 0 ${c} ${r}" style="--c:${c};--r:${r}" focusable="false">${rects}</svg>`;
  };

  const drawSprites = () => $$(".px[data-sprite]").forEach((el) => {
    if (!el.firstChild && SPRITES[el.dataset.sprite]) el.innerHTML = spriteSVG(SPRITES[el.dataset.sprite]);
  });

  // Malang is on WIB, which is the Asia/Jakarta zone.
  const clockFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" });
  const tick = () => $$(".js-clock").forEach((el) => { el.textContent = clockFmt.format(new Date()); });

  const stampUpdated = () => {
    const d = new Date(document.lastModified);
    if (isNaN(d)) return;
    const txt = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    $$(".js-updated").forEach((el) => { el.textContent = txt; });
  };

  // Hero photo as a dot matrix. Redraws only on load, resize and pointer movement, never on an idle loop.
  const halftone = () => {
    const cv = $(".hero-dots");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const img = new Image();
    let W, H, dpr, step, cols, rows, lum, mx = -1e4, my = -1e4, queued = false;

    const sample = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      step = W < 640 ? 8 : 11;
      cols = Math.ceil(W / step); rows = Math.ceil(H / step);
      const off = document.createElement("canvas");
      off.width = cols; off.height = rows;
      const o = off.getContext("2d", { willReadFrequently: true });
      const s = Math.max(cols / img.width, rows / img.height); // object-fit: cover
      o.drawImage(img, (cols - img.width * s) / 2, (rows - img.height * s) / 2, img.width * s, img.height * s);
      const d = o.getImageData(0, 0, cols, rows).data;
      lum = new Float32Array(cols * rows);
      for (let i = 0; i < lum.length; i++) lum[i] = (d[i * 4] * .299 + d[i * 4 + 1] * .587 + d[i * 4 + 2] * .114) / 255;
    };

    const draw = () => {
      queued = false;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const base = new Path2D(), hot = new Path2D();
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cx = x * step + step / 2, cy = y * step + step / 2;
          const near = Math.max(0, 1 - Math.hypot(cx - mx, cy - my) / 170);
          const v = Math.min(1, Math.max(0, (lum[y * cols + x] - .18) / .7)); // contrast stretch so the photo reads
          const r = v * v * .95 * step * .46 + near * step * .22;
          if (r < .5) continue;
          const p = near > .08 ? hot : base;
          p.moveTo(cx + r, cy);
          p.arc(cx, cy, r, 0, Math.PI * 2);
        }
      }
      ctx.fillStyle = "rgba(236,234,228,.5)"; ctx.fill(base);
      ctx.fillStyle = "#8C9BFF"; ctx.fill(hot);
    };
    const redraw = () => { if (!queued) { queued = true; requestAnimationFrame(draw); } };

    img.onload = () => {
      sample();
      draw();
      let rt;
      addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { sample(); draw(); }, 150); });
      if (reduceMotion) return;
      cv.parentElement.addEventListener("pointermove", (e) => {
        const b = cv.getBoundingClientRect();
        mx = e.clientX - b.left; my = e.clientY - b.top;
        redraw();
      });
      cv.parentElement.addEventListener("pointerleave", () => { mx = my = -1e4; redraw(); });
    };
    img.src = cv.dataset.src;
  };

  // Statement words light up in reading order as the paragraph scrolls through the viewport.
  const splitWords = () => $$(".js-reveal").forEach((el) => {
    if (el.querySelector(".w")) return; // already split; the renderer replaces textContent when the copy changes
    const text = el.textContent.trim();
    el.innerHTML = text.split(/\s+/).map((w) => `<span class="w">${w.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))}</span>`).join(" ");
  });

  const revealOnScroll = () => $$(".js-reveal").forEach((el) => {
    const b = el.getBoundingClientRect();
    const vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh * .85 - b.top) / (b.height + vh * .35)));
    const words = $$(".w", el);
    const lit = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle("on", i < lit));
  });

  // Stack list: --d is 0 in the middle of the list and 1 at either end; CSS scales size and tone from it.
  const scaleStack = () => {
    const items = $$("#skills-container .stack-item");
    const mid = (items.length - 1) / 2 || 1;
    items.forEach((li, i) => li.style.setProperty("--d", (Math.abs(i - (items.length - 1) / 2) / mid).toFixed(2)));
  };

  let currentFilter = "*";
  const applyFilter = () => {
    $$("#portfolio-grid-container .work-card").forEach((card) => {
      card.hidden = currentFilter !== "*" && !card.classList.contains(currentFilter);
    });
    $$(".chip[data-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === currentFilter)));
  };
  document.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip[data-filter]");
    if (!chip) return;
    currentFilter = chip.dataset.filter;
    applyFilter();
  });

  const navSpy = () => {
    const links = $$(".topbar-nav a");
    const y = scrollY + innerHeight * .35;
    let current = null;
    links.forEach((a) => { const s = $(a.hash); if (s && s.getBoundingClientRect().top + scrollY <= y) current = a; }); // offsetTop is relative to .sheet
    links.forEach((a) => a.classList.toggle("is-active", a === current));
  };

  let lightbox = null;
  const initLightbox = () => {
    if (!window.GLightbox) return;
    if (lightbox) lightbox.reload();
    else lightbox = GLightbox({ selector: ".portfolio-lightbox" });
  };

  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { revealOnScroll(); navSpy(); ticking = false; });
  }, { passive: true });

  const refresh = () => {
    drawSprites();
    splitWords();
    revealOnScroll();
    scaleStack();
    applyFilter();
    initLightbox();
  };
  window.site = { refresh };

  document.addEventListener("DOMContentLoaded", () => {
    refresh();
    tick();
    setInterval(tick, 15000);
    stampUpdated();
    halftone();
    navSpy();
  });
})();
