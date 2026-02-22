(() => {
  const GRID = 18;
  const TICK_MS = 95;
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

  function resizeCanvas() {
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const sizeCss = Math.min(window.innerWidth * 0.92, 520);
    canvas.style.width = `${sizeCss}px`;
    canvas.style.height = `${sizeCss}px`;
    canvas.width = Math.floor(sizeCss * dpr);
    canvas.height = Math.floor(sizeCss * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resizeCanvas, { passive: true });
  resizeCanvas();

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
  };

  bestEl.textContent = String(state.best);

  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const cellEquals = (a, b) => a.x === b.x && a.y === b.y;

  function rr(ctx2, x, y, w, h, r) {
    if (typeof ctx2.roundRect === "function") {
      ctx2.roundRect(x, y, w, h, r);
      return;
    }
    r = Math.min(r, w / 2, h / 2);
    ctx2.moveTo(x + r, y);
    ctx2.arcTo(x + w, y, x + w, y + h, r);
    ctx2.arcTo(x + w, y + h, x, y + h, r);
    ctx2.arcTo(x, y + h, x, y, r);
    ctx2.arcTo(x, y, x + w, y, r);
    ctx2.closePath();
  }

  function spawnFood() {
    for (let i = 0; i < 200; i++) {
      const p = { x: randInt(0, GRID - 1), y: randInt(0, GRID - 1) };
      if (!state.snake.some(s => cellEquals(s, p))) {
        state.food = p;
        return;
      }
    }
    state.food = { x: 0, y: 0 };
  }

  function showOverlay(gameOverMode) {
    overlay.classList.remove("hidden");
    btnResume.style.display = gameOverMode ? "none" : "inline-block";
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  function setBestIfNeeded() {
    if (state.score > state.best) {
      state.best = state.score;
      localStorage.setItem(STORAGE_KEY, String(state.best));
      bestEl.textContent = String(state.best);
    }
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

    // importante: evita dt gigante no restart
    state.lastTick = performance.now();
    state.acc = 0;

    btnPause.textContent = "Pause";
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

    btnPause.textContent = state.paused ? "Resume" : "Pause";

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

    if (newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID) {
      gameOver(); return;
    }

    if (state.snake.some((seg, idx) => idx !== 0 && cellEquals(seg, newHead))) {
      gameOver(); return;
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

  function draw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const cell = Math.floor(Math.min(w, h) / GRID);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#050812";
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 0.25;
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

    ctx.fillStyle = "#22c55e";
    const fx = state.food.x * cell;
    const fy = state.food.y * cell;
    ctx.beginPath();
    rr(ctx, fx + 3, fy + 3, cell - 6, cell - 6, 8);
    ctx.fill();

    for (let i = state.snake.length - 1; i >= 0; i--) {
      const s = state.snake[i];
      const x = s.x * cell;
      const y = s.y * cell;

      if (i === 0) {
        ctx.fillStyle = "#3b82f6";
        ctx.beginPath();
        rr(ctx, x + 2, y + 2, cell - 4, cell - 4, 10);
        ctx.fill();

        ctx.fillStyle = "rgba(0,0,0,0.35)";
        const ox = x + cell / 2 + state.dir.x * 4;
        const oy = y + cell / 2 + state.dir.y * 4;
        ctx.beginPath();
        ctx.arc(ox, oy, 2.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "rgba(59,130,246,0.65)";
        ctx.beginPath();
        rr(ctx, x + 3, y + 3, cell - 6, cell - 6, 8);
        ctx.fill();
      }
    }
  }

  function loop(ts) {
    requestAnimationFrame(loop);
    draw();

    if (!state.running || state.paused || state.over) return;

    if (!state.lastTick) state.lastTick = ts;
    const dt = ts - state.lastTick;
    state.lastTick = ts;

    state.acc += dt;
    while (state.acc >= TICK_MS) {
      state.acc -= TICK_MS;
      step();
      if (state.over) break;
    }
  }
  requestAnimationFrame(loop);

  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (k === "arrowup" || k === "w") setDirection({ x: 0, y: -1 });
    else if (k === "arrowdown" || k === "s") setDirection({ x: 0, y: 1 });
    else if (k === "arrowleft" || k === "a") setDirection({ x: -1, y: 0 });
    else if (k === "arrowright" || k === "d") setDirection({ x: 1, y: 0 });
    else if (k === "p" || k === " ") pauseToggle();
    else if (k === "enter" && state.over) resetGame();
  }, { passive: true });

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

    if (Math.abs(dx) > Math.abs(dy)) setDirection(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
    else setDirection(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });

    touchStart = null;
  }, { passive: true });

  canvas.addEventListener("touchend", () => { touchStart = null; }, { passive: true });

  btnNew.addEventListener("click", resetGame);
  btnRestart.addEventListener("click", resetGame);
  btnResume.addEventListener("click", () => pauseToggle(false));
  btnPause.addEventListener("click", () => pauseToggle());

  overlay.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (state.over) resetGame();
  });

  resetGame();
})();
