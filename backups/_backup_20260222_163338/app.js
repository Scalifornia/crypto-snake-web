(() => {
  const GRID = 25;
  const SWIPE_MIN = 10;
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

  let state = {
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
    speed: 95
  };

  bestEl.textContent = state.best;

  function resizeCanvas() {
    const size = Math.min(window.innerWidth - 20, window.innerHeight - 100);
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const cellEquals = (a, b) => a.x === b.x && a.y === b.y;

  function spawnFood() {
    while (true) {
      const p = { x: randInt(0, GRID - 1), y: randInt(0, GRID - 1) };
      if (!state.snake.some(s => cellEquals(s, p))) {
        state.food = p;
        break;
      }
    }
  }

  function setBestIfNeeded() {
    if (state.score > state.best) {
      state.best = state.score;
      localStorage.setItem(STORAGE_KEY, state.best);
      bestEl.textContent = state.best;
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
      { x: mid - 2, y: mid }
    ];
    spawnFood();
    state.paused = false;
    state.over = false;
    state.running = true;
    state.lastTick = performance.now();
    state.acc = 0;
    showOverlay(false);
  }

  function gameOver() {
    state.over = true;
    state.running = false;
    setBestIfNeeded();
    overlayTitle.textContent = "Game Over";
    overlayText.textContent = `Score: ${state.score}`;
    showOverlay(true);
  }

  function showOverlay(gameOverMode) {
    overlay.classList.remove("hidden");
  }
  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  function wrapHead(head) {
    head.x = (head.x + GRID) % GRID;
    head.y = (head.y + GRID) % GRID;
  }

  function step() {
    state.dir = state.nextDir;
    const head = state.snake[0];
    const newHead = { x: head.x + state.dir.x, y: head.y + state.dir.y };
    wrapHead(newHead);
    if (state.snake.some((seg, i) => i !== 0 && cellEquals(seg, newHead))) {
      gameOver();
      return;
    }
    state.snake.unshift(newHead);
    if (cellEquals(newHead, state.food)) {
      state.score++;
      scoreEl.textContent = state.score;
      spawnFood();
    } else {
      state.snake.pop();
    }
  }

  function draw() {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const cell = Math.floor(w / GRID);
    ctx.fillStyle = "#050812";
    ctx.fillRect(0, 0, w, w);

    ctx.fillStyle = "#22c55e";
    ctx.fillRect(state.food.x * cell, state.food.y * cell, cell, cell);

    ctx.fillStyle = "#3b82f6";
    state.snake.forEach(seg => {
      ctx.fillRect(seg.x * cell, seg.y * cell, cell, cell);
    });
  }

  function loop(ts) {
    requestAnimationFrame(loop);
    if (!state.running || state.paused || state.over) {
      draw();
      return;
    }
    const dt = ts - state.lastTick;
    state.lastTick = ts;
    state.acc += dt;
    while (state.acc >= state.speed) {
      state.acc -= state.speed;
      step();
    }
    draw();
  }
  requestAnimationFrame(loop);

  // One-hand touch tracking
  let activeTouch = null;

  canvas.addEventListener("touchstart", e => {
    if (e.touches.length !== 1) return;
    activeTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  canvas.addEventListener("touchmove", e => {
    if (!activeTouch) return;
    const t = e.touches[0];
    const dx = t.clientX - activeTouch.x;
    const dy = t.clientY - activeTouch.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      state.nextDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    } else {
      state.nextDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    }
    activeTouch = { x: t.clientX, y: t.clientY };
  }, { passive: true });

  canvas.addEventListener("touchend", e => { activeTouch = null; }, { passive: true });

  canvas.addEventListener("mousedown", e => {
    activeTouch = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener("mousemove", e => {
    if (!activeTouch) return;
    const dx = e.clientX - activeTouch.x;
    const dy = e.clientY - activeTouch.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      state.nextDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    } else {
      state.nextDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    }
    activeTouch = { x: e.clientX, y: e.clientY };
  });

  document.addEventListener("mouseup", () => { activeTouch = null; });

  btnPause.addEventListener("click", () => { state.paused = !state.paused; });
  btnNew.addEventListener("click", resetGame);
  btnRestart.addEventListener("click", resetGame);
  btnResume.addEventListener("click", resetGame);

  resetGame();
})();
