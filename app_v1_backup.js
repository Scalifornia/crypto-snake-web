(() => {
  "use strict";

  const GRID = 18;
  const BASE_TICK_MS = 95;
  const SWIPE_MIN = 18;
  const STORAGE_KEY = "cryptoSnakeBest_v1";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");

  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayText = document.getElementById("overlayText");

  const btnPause = document.getElementById("btnPause");
  const btnNew = document.getElementById("btnNew");
  const btnResume = document.getElementById("btnResume");
  const btnRestart = document.getElementById("btnRestart");

  const tapLayer = document.getElementById("tapLayer"); // existe no teu HTML
  const tapTarget = tapLayer || document;

  const state = {
    running: false,
    paused: false,
    over: false,
    score: 0,
    best: Number(localStorage.getItem(STORAGE_KEY) || 0),
    snake: [],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 10, y: 10 },
    lastTick: 0,
    acc: 0,
    tickMs: BASE_TICK_MS,
  };

  bestEl.textContent = String(state.best);

  // ---------- CANVAS RESIZE ----------
  function resizeCanvas() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const reserved = 240;
    const maxSize = 780;

    const sizeCss = Math.max(
      220,
      Math.min(window.innerWidth * 0.98, window.innerHeight - reserved, maxSize)
    );

    canvas.style.width = `${sizeCss}px`;
    canvas.style.height = `${sizeCss}px`;
    canvas.width = Math.floor(sizeCss * dpr);
    canvas.height = Math.floor(sizeCss * dpr);

    // desenhar em "CSS pixels"
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resizeCanvas, { passive: true });
  resizeCanvas();

  // ---------- HELPERS ----------
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const cellEquals = (a, b) => a.x === b.x && a.y === b.y;

  function rr(ctx2, x, y, w, h, r) {
    if (typeof ctx2.roundRect === "function") {
      ctx2.beginPath();
      ctx2.roundRect(x, y, w, h, r);
      ctx2.closePath();
      return;
    }
    r = Math.min(r, w / 2, h / 2);
    ctx2.beginPath();
    ctx2.moveTo(x + r, y);
    ctx2.arcTo(x + w, y, x + w, y + h, r);
    ctx2.arcTo(x + w, y + h, x, y + h, r);
    ctx2.arcTo(x, y + h, x, y, r);
    ctx2.arcTo(x, y, x + w, y, r);
    ctx2.closePath();
  }

  // ---------- GAME ----------
  function spawnFood() {
    for (let i = 0; i < 500; i++) {
      const p = { x: randInt(0, GRID - 1), y: randInt(0, GRID - 1) };
      if (!state.snake.some(s => cellEquals(s, p))) {
        state.food = p;
        return;
      }
    }
    state.food = { x: 0, y: 0 };
  }

  function setBestIfNeeded() {
    if (state.score > state.best) {
      state.best = state.score;
      localStorage.setItem(STORAGE_KEY, String(state.best));
      bestEl.textContent = String(state.best);
    }
  }

  function showOverlay(isGameOver) {
    overlay.classList.remove("hidden");
    // quando é pausa, mostra Resume; quando é game over, esconde Resume
    if (btnResume) btnResume.style.display = isGameOver ? "none" : "inline-block";
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  function resetGame() {
    state.score = 0;
    scoreEl.textContent = "0";

    state.dir = { x: 1, y: 0 };
    state.nextDir = { x: 1, y: 0 };

    const mid = Math.floor(GRID / 2);
    state.snake = [
      { x: mid, y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
    ];

    spawnFood();

    state.paused = false;
    state.over = false;
    state.running = true;

    state.tickMs = BASE_TICK_MS;
    state.lastTick = performance.now();
    state.acc = 0;

    if (btnPause) btnPause.textContent = "Pause";
    hideOverlay();
  }

  function gameOver() {
    state.over = true;
    state.running = false;
    setBestIfNeeded();

    overlayTitle.textContent = "Game Over";
    overlayText.textContent = `Score: ${state.score}`;
    showOverlay(true);
  }

  function pauseToggle(force) {
    if (state.over) return;

    if (typeof force === "boolean") state.paused = force;
    else state.paused = !state.paused;

    if (btnPause) btnPause.textContent = state.paused ? "Resume" : "Pause";

    if (state.paused) {
      overlayTitle.textContent = "Paused";
      overlayText.textContent = `Score: ${state.score}`;
      showOverlay(false);
    } else {
      hideOverlay();
    }
  }

  function isOpposite(a, b) {
    return a.x === -b.x && a.y === -b.y;
  }

  function setDirection(newDir) {
    if (!isOpposite(newDir, state.dir)) state.nextDir = newDir;
  }

  function step() {
    state.dir = state.nextDir;

    const head = state.snake[0];
    const newHead = { x: head.x + state.dir.x, y: head.y + state.dir.y };

    // wrap walls
    newHead.x = (newHead.x + GRID) % GRID;
    newHead.y = (newHead.y + GRID) % GRID;

    if (state.snake.some((seg, idx) => idx !== 0 && cellEquals(seg, newHead))) {
      gameOver();
      return;
    }

    state.snake.unshift(newHead);

    if (cellEquals(newHead, state.food)) {
      state.score += 1;
      scoreEl.textContent = String(state.score);
      spawnFood();
    } else {
      state.snake.pop();
    }
  }

  // “one-hand”: tap esquerda vira left, direita vira right (relativo à direção atual)
  function turnLeft() {
    const d = state.dir;
    // (x,y) -> (-y, x)
    setDirection({ x: -d.y, y: d.x });
  }
  function turnRight() {
    const d = state.dir;
    // (x,y) -> (y, -x)
    setDirection({ x: d.y, y: -d.x });
  }

  // ---------- DRAW ----------
  function draw() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = canvas.width / dpr;
    const cell = Math.floor(w / GRID);

    ctx.clearRect(0, 0, w, w);

    // fundo
    ctx.fillStyle = "#050812";
    ctx.fillRect(0, 0, w, w);

    // grid suave
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cell, 0);
      ctx.lineTo(i * cell, GRID * cell);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cell);
      ctx.lineTo(GRID * cell, i * cell);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // food
    const fx = state.food.x * cell;
    const fy = state.food.y * cell;
    ctx.fillStyle = "#22c55e";
    rr(ctx, fx + 3, fy + 3, cell - 6, cell - 6, 8);
    ctx.fill();

    // snake
    for (let i = state.snake.length - 1; i >= 0; i--) {
      const s = state.snake[i];
      const x = s.x * cell;
      const y = s.y * cell;

      if (i === 0) {
        ctx.fillStyle = "#3b82f6";
        rr(ctx, x + 2, y + 2, cell - 4, cell - 4, 10);
        ctx.fill();

        // “olho” simples
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        const ox = x + cell / 2 + state.dir.x * 4;
        const oy = y + cell / 2 + state.dir.y * 4;
        ctx.beginPath();
        ctx.arc(ox, oy, 2.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "rgba(59,130,246,0.65)";
        rr(ctx, x + 3, y + 3, cell - 6, cell - 6, 8);
        ctx.fill();
      }
    }
  }

  // ---------- LOOP ----------
  function loop(ts) {
    requestAnimationFrame(loop);

    draw();

    if (!state.running || state.paused || state.over) return;

    const dt = ts - state.lastTick;
    state.lastTick = ts;
    state.acc += dt;

    while (state.acc >= state.tickMs) {
      state.acc -= state.tickMs;
      step();
      if (state.over) break;
    }
  }

  requestAnimationFrame(loop);

  // ---------- INPUTS ----------
  // Teclado
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (k === "arrowup" || k === "w") setDirection({ x: 0, y: -1 });
    else if (k === "arrowdown" || k === "s") setDirection({ x: 0, y: 1 });
    else if (k === "arrowleft" || k === "a") setDirection({ x: -1, y: 0 });
    else if (k === "arrowright" || k === "d") setDirection({ x: 1, y: 0 });
    else if (k === "p" || k === " ") pauseToggle();
    else if (k === "enter" && state.over) resetGame();
  }, { passive: true });

  // Swipe + 2 dedos = pausa
  let touchStart = null;

  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length >= 2) { pauseToggle(); return; }
    const t = e.touches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  }, { passive: true });

  canvas.addEventListener("touchmove", (e) => {
    if (!touchStart) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;

    if (Math.abs(dx) < SWIPE_MIN && Math.abs(dy) < SWIPE_MIN) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      setDirection(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
    } else {
      setDirection(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
    }
    touchStart = null;
  }, { passive: true });

  canvas.addEventListener("touchend", () => { touchStart = null; }, { passive: true });

  // One-hand taps (não interfere com botões/overlay)
  tapTarget.addEventListener("click", (e) => {
    if (e.target && e.target.closest && (e.target.closest("button") || e.target.closest("#overlay"))) return;
    if (!state.running || state.paused || state.over) return;
    if (e.clientX < window.innerWidth / 2) turnLeft();
    else turnRight();
  }, true);

  // Botões UI
  btnNew?.addEventListener("click", resetGame);
  btnRestart?.addEventListener("click", resetGame);
  btnResume?.addEventListener("click", () => pauseToggle(false));
  btnPause?.addEventListener("click", () => pauseToggle());

  // Tap no overlay: se for game over, reinicia
  overlay?.addEventListener("click", (e) => {
    if (!state.over) return;
    e.preventDefault();
    e.stopPropagation();
    resetGame();
  });

  // Start
  resetGame();
})();
