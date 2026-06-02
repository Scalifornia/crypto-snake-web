(() => {
  "use strict";

  const el = {
    canvas: document.getElementById("game"),
    menu: document.getElementById("menu"),
    overlay: document.getElementById("overlay"),
    overlayTitle: document.getElementById("overlayTitle"),
    overlayText: document.getElementById("overlayText"),

    btnPlay: document.getElementById("btnPlay"),
    btnPause: document.getElementById("btnPause"),
    btnReset: document.getElementById("btnReset"),
    btnMenu: document.getElementById("btnMenu"),
    btnFull: document.getElementById("btnFull"),

    btnOverlayResume: document.getElementById("btnOverlayResume"),
    btnOverlayReset: document.getElementById("btnOverlayReset"),
    btnOverlayMenu: document.getElementById("btnOverlayMenu"),

    mode: document.getElementById("mode"),
    difficulty: document.getElementById("difficulty"),
    walls: document.getElementById("walls"),
    grid: document.getElementById("grid"),

    bgOpacity: document.getElementById("bgOpacity"),
    bgFile: document.getElementById("bgFile"),

    sound: document.getElementById("sound"),
    sfxVol: document.getElementById("sfxVol"),

    music: document.getElementById("music"),
    musicVol: document.getElementById("musicVol"),

    score: document.getElementById("score"),
    best: document.getElementById("best"),
  };

  if (!el.canvas) return;
  const ctx = el.canvas.getContext("2d", { alpha: false });

  const STORAGE_KEY = "cryptoSnakeBest_v58";
  const LS = {
    sfxVol: "cs_sfxVol",
    musicVol: "cs_musicVol",
    bgData: "cs_bgData",
    bgOpacity: "cs_bgOpacity",
    grid: "cs_grid",
    walls: "cs_walls",
    difficulty: "cs_difficulty",
    mode: "cs_mode",
  };

  const GRID = 22;

  const DIFFICULTY = {
    easy: { tickMs: 140 },
    normal: { tickMs: 110 },
    hard: { tickMs: 85 },
  };

  const State = { MENU:"MENU", RUNNING:"RUNNING", PAUSED:"PAUSED", OVER:"OVER" };
  let state = State.MENU;

  let rafId = null;
  let lastTs = 0;
  let accMs = 0;

  let tickMs = DIFFICULTY.normal.tickMs;
  let speedMult = 1.0;

  let timeLeft = 60;
  let lastSecondTs = 0;

  let wallsOn = false;

  let snake = [];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = { x: 10, y: 10 };

  let score = 0;
  let best = Number(localStorage.getItem(STORAGE_KEY) || 0);
  el.best && (el.best.textContent = String(best));

  // ---------- Canvas layout ----------
  let cssW = 800, cssH = 600, dpr = 1;
  let cell = 20, boardPx = 440, ox = 0, oy = 0;

  function resizeCanvas() {
    const rect = el.canvas.getBoundingClientRect();
    cssW = Math.max(1, rect.width);
    cssH = Math.max(1, rect.height);
    dpr = Math.max(1, window.devicePixelRatio || 1);

    el.canvas.width = Math.floor(cssW * dpr);
    el.canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    boardPx = Math.floor(Math.min(cssW, cssH));
    cell = Math.max(10, Math.floor(boardPx / GRID));
    boardPx = cell * GRID;

    ox = Math.floor((cssW - boardPx) / 2);
    oy = Math.floor((cssH - boardPx) / 2);
  }
  window.addEventListener("resize", resizeCanvas, { passive: true });
  resizeCanvas();

  // ---------- AUDIO (menu + game + explosion + retro game over) ----------
  const sfx = {
    eat: new Audio("assets/audio/som_comer.wav"),
    level: new Audio("assets/audio/level_up.wav"),
    boom: new Audio("assets/audio/explosion.mp3"),
    over: new Audio("assets/audio/Game_over_retro.mp3"),
  };

  const menuMusic = new Audio("assets/audio/som_menu.wav");
  menuMusic.loop = true;

  const gameMusic = new Audio("assets/audio/trilha_sonora.wav");
  gameMusic.loop = true;

  let audioUnlocked = false;

  function sfxVolume() {
    const v = Number(el.sfxVol?.value ?? 80);
    return Math.max(0, Math.min(1, v / 100));
  }
  function musicVolume() {
    const v = Number(el.musicVol?.value ?? 60);
    return Math.max(0, Math.min(1, v / 100));
  }
  function shouldSfx() { return el.sound?.value === "on"; }
  function shouldMusic() { return el.music?.value === "on"; }

  function playSfx(aud) {
    if (!shouldSfx()) return;
    try {
      aud.volume = sfxVolume();
      aud.currentTime = 0;
      aud.play().catch(() => {});
    } catch {}
  }

  function stopAllMusic() {
    try { menuMusic.pause(); } catch {}
    try { gameMusic.pause(); } catch {}
  }

  function startMenuMusic() {
    if (!shouldMusic()) { try { menuMusic.pause(); } catch {} ; return; }
    stopAllMusic();
    try {
      menuMusic.volume = musicVolume();
      menuMusic.play().catch(() => {});
    } catch {}
  }

  function startGameMusic() {
    if (!shouldMusic()) { try { gameMusic.pause(); } catch {} ; return; }
    stopAllMusic();
    try {
      gameMusic.volume = musicVolume();
      gameMusic.play().catch(() => {});
    } catch {}
  }

  function unlockAudioOnce() {
    if (audioUnlocked) return;
    audioUnlocked = true;

    // PC/Mac toca logo; iPhone só após gesto do utilizador (Play/touch)
    startMenuMusic();
  }

  async function playDeathSequence() {
    if (shouldSfx()) {
      try {
        sfx.boom.volume = sfxVolume();
        sfx.boom.currentTime = 0;
        await sfx.boom.play().catch(() => {});
      } catch {}
      try {
        sfx.over.volume = sfxVolume();
        sfx.over.currentTime = 0;
        await sfx.over.play().catch(() => {});
      } catch {}
    }
  }

  el.musicVol?.addEventListener("input", () => {
    menuMusic.volume = musicVolume();
    gameMusic.volume = musicVolume();
  });

  el.music?.addEventListener("change", () => {
    if (!audioUnlocked) return;
    if (state === State.MENU) startMenuMusic();
    else if (state === State.RUNNING) startGameMusic();
    else stopAllMusic();
  });

  // ---------- Background custom (opção A) ----------
  let bgImg = null;

  function loadBgFromStorage() {
    const data = localStorage.getItem(LS.bgData);
    if (!data) { bgImg = null; return; }
    const img = new Image();
    img.onload = () => { bgImg = img; };
    img.src = data;
  }

  function bgOpacity() {
    const v = Number(el.bgOpacity?.value ?? localStorage.getItem(LS.bgOpacity) ?? 40);
    return Math.max(0, Math.min(1, v / 100));
  }

  function gridAlpha() {
    const mode = el.grid?.value || "off";
    if (mode === "off") return 0;
    if (mode === "mid") return 0.10;
    return 0.05;
  }

  // ---------- UI ----------
  function showMenu(show) { el.menu?.classList.toggle("hidden", !show); }
  function showOverlay(show, title="", text="") {
    if (!el.overlay) return;
    el.overlay.classList.toggle("hidden", !show);
    if (show) {
      el.overlayTitle.textContent = title;
      el.overlayText.textContent = text;
    }
  }

  function syncHud() {
    el.score && (el.score.textContent = String(score));
    el.best && (el.best.textContent = String(best));
  }

  // ---------- Game ----------
  function spawnFood() {
    for (let tries = 0; tries < 5000; tries++) {
      const x = Math.floor(Math.random() * GRID);
      const y = Math.floor(Math.random() * GRID);
      const blocked = snake.some(p => p.x === x && p.y === y);
      if (!blocked) { food = { x, y }; return; }
    }
    food = { x: 1, y: 1 };
  }

  function initGameFromMenu() {
    const diff = DIFFICULTY[el.difficulty?.value] || DIFFICULTY.normal;
    tickMs = diff.tickMs;

    score = 0;
    speedMult = 1.0;
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };

    wallsOn = (el.walls?.value === "on");
    if (el.mode?.value === "classic" && el.walls?.value === "off") wallsOn = false;

    const mid = Math.floor(GRID / 2);
    snake = [
      { x: mid, y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
      { x: mid - 3, y: mid },
      { x: mid - 4, y: mid },
      { x: mid - 5, y: mid },
    ];

    if (el.mode?.value === "timed") {
      timeLeft = 60;
      lastSecondTs = 0;
    }

    spawnFood();
    lastTs = 0;
    accMs = 0;
    syncHud();
  }

  function setNextDir(x, y) {
    if (x === -dir.x && y === -dir.y) return;
    nextDir = { x, y };
  }

  // Swipe: 1 viragem por tick
  let activeTouchId = null;
  let swipeX = null;
  let swipeY = null;
  let turnLocked = false;
  const SWIPE_TH = 14;
  const SWIPE_RESET = 10;

  function isUiTarget(e) {
    const t = e.target;
    if (!t) return false;
    if (t.closest && (t.closest(".topbar") || t.closest(".panel") || t.closest(".overlay"))) return true;
    const tag = (t.tagName || "").toLowerCase();
    return ["button","select","input","label","a"].includes(tag);
  }

  function findActiveTouch(touches) {
    if (activeTouchId === null) return null;
    for (let i = 0; i < touches.length; i++) {
      if (touches[i].identifier === activeTouchId) return touches[i];
    }
    return null;
  }

  function onTouchStart(e) {
    unlockAudioOnce();
    if (isUiTarget(e)) return;
    if (state !== State.RUNNING) return;
    if (!e.touches || e.touches.length === 0) return;
    const t = e.touches[0];
    activeTouchId = t.identifier;
    swipeX = t.clientX;
    swipeY = t.clientY;
    e.preventDefault();
  }

  function onTouchMove(e) {
    if (isUiTarget(e)) return;
    if (state !== State.RUNNING) return;

    const t = findActiveTouch(e.touches) || (e.touches && e.touches.length ? e.touches[0] : null);
    if (!t) return;

    const x = t.clientX;
    const y = t.clientY;

    if (swipeX === null || swipeY === null) { swipeX = x; swipeY = y; }

    const dx = x - swipeX;
    const dy = y - swipeY;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);

    if (ax < SWIPE_TH && ay < SWIPE_TH) { e.preventDefault(); return; }

    if (!turnLocked) {
      if (ax >= ay) setNextDir(dx > 0 ? 1 : -1, 0);
      else setNextDir(0, dy > 0 ? 1 : -1);
      turnLocked = true;
    }

    if (ax > SWIPE_RESET || ay > SWIPE_RESET) { swipeX = x; swipeY = y; }
    e.preventDefault();
  }

  function onTouchEnd(e) {
    if (state !== State.RUNNING) return;
    const still = findActiveTouch(e.touches);
    if (!still) {
      activeTouchId = null;
      swipeX = null;
      swipeY = null;
    }
    e.preventDefault();
  }

  document.addEventListener("touchstart", onTouchStart, { passive:false });
  document.addEventListener("touchmove", onTouchMove, { passive:false });
  document.addEventListener("touchend", onTouchEnd, { passive:false });
  document.addEventListener("touchcancel", onTouchEnd, { passive:false });

  function step() {
    turnLocked = false;
    dir = nextDir;

    const head = snake[0];
    const newHead = { x: head.x + dir.x, y: head.y + dir.y };

    if (wallsOn) {
      if (newHead.x < 0 || newHead.y < 0 || newHead.x >= GRID || newHead.y >= GRID) {
        gameOver("Bateu na parede.");
        return;
      }
    } else {
      newHead.x = (newHead.x + GRID) % GRID;
      newHead.y = (newHead.y + GRID) % GRID;
    }

    if (snake.some(p => p.x === newHead.x && p.y === newHead.y)) {
      gameOver("Colisão com o corpo.");
      return;
    }

    snake.unshift(newHead);

    if (newHead.x === food.x && newHead.y === food.y) {
      score += 10;
      playSfx(sfx.eat);
      spawnFood();

      if (el.mode?.value === "survival") {
        const before = speedMult;
        speedMult = Math.min(2.5, speedMult + 0.05);
        if (speedMult > before + 1e-9) playSfx(sfx.level);
      }

      syncHud();
    } else {
      snake.pop();
    }
  }

  // ---------- Loop ----------
  function startLoop() {
    stopLoop();
    rafId = requestAnimationFrame(loop);
  }
  function stopLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function loop(ts) {
    if (state !== State.RUNNING) return;

    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs;
    lastTs = ts;
    accMs += dt;

    if (el.mode?.value === "timed") {
      if (!lastSecondTs) lastSecondTs = ts;
      if (ts - lastSecondTs >= 1000) {
        lastSecondTs += 1000;
        timeLeft -= 1;
        if (timeLeft <= 0) { gameOver("Tempo esgotado."); return; }
      }
    }

    const effectiveTick = tickMs / speedMult;
    while (accMs >= effectiveTick) {
      accMs -= effectiveTick;
      step();
      if (state !== State.RUNNING) return;
    }

    draw();
    rafId = requestAnimationFrame(loop);
  }

  // ---------- Render ----------
  function drawBackground() {
    ctx.fillStyle = "#050812";
    ctx.fillRect(0, 0, cssW, cssH);

    ctx.fillStyle = "#070a12";
    ctx.fillRect(ox, oy, boardPx, boardPx);

    if (bgImg) {
      const a = bgOpacity();
      if (a > 0) {
        ctx.save();
        ctx.globalAlpha = a;
        ctx.drawImage(bgImg, ox, oy, boardPx, boardPx);
        ctx.restore();
      }
    }

    const ga = gridAlpha();
    if (ga > 0) {
      ctx.strokeStyle = `rgba(255,255,255,${ga})`;
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID; i++) {
        const x = ox + i * cell;
        const y = oy + i * cell;
        ctx.beginPath(); ctx.moveTo(x, oy); ctx.lineTo(x, oy + boardPx); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + boardPx, y); ctx.stroke();
      }
    }

    if (wallsOn) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(57,255,221,0.85)";
      ctx.strokeRect(ox + 2, oy + 2, boardPx - 4, boardPx - 4);
      ctx.lineWidth = 1;
    }
  }

  function drawFood() {
    const x = ox + food.x * cell;
    const y = oy + food.y * cell;
    ctx.fillStyle = "rgba(34,197,94,0.95)";
    ctx.fillRect(x + 3, y + 3, cell - 6, cell - 6);
  }

  function drawSnake() {
    for (let i = snake.length - 1; i >= 0; i--) {
      const p = snake[i];
      const x = ox + p.x * cell;
      const y = oy + p.y * cell;

      if (i === 0) {
        ctx.fillStyle = "rgba(57,255,221,0.92)";
        ctx.fillRect(x, y, cell, cell);
      } else {
        ctx.fillStyle = "rgba(168,85,247,0.45)";
        ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      }
    }
  }

  function draw() {
    drawBackground();
    drawFood();
    drawSnake();
  }

  async function gameOver(msg) {
    state = State.OVER;
    stopLoop();
    stopAllMusic();

    activeTouchId = null;
    swipeX = null;
    swipeY = null;

    await playDeathSequence();

    if (score > best) {
      best = score;
      localStorage.setItem(STORAGE_KEY, String(best));
    }
    syncHud();
    showOverlay(true, "Game Over", msg || "Reset ou Menu.");
    draw();
  }

  function startGame() {
    unlockAudioOnce();
    resizeCanvas();
    initGameFromMenu();
    state = State.RUNNING;

    showMenu(false);
    showOverlay(false);

    startGameMusic();
    startLoop();
  }

  function pauseToggle(force) {
    if (state !== State.RUNNING && state !== State.PAUSED) return;
    const toPause = typeof force === "boolean" ? force : (state === State.RUNNING);

    if (toPause) {
      state = State.PAUSED;
      stopLoop();
      stopAllMusic();
      showOverlay(true, "Pausa", "Espaço para continuar · R para reset");
      el.btnPause && (el.btnPause.textContent = "Resume");
    } else {
      state = State.RUNNING;
      showOverlay(false);
      el.btnPause && (el.btnPause.textContent = "Pause");
      startGameMusic();
      startLoop();
    }
  }

  function reset() {
    if (state === State.MENU) return;
    startGame();
  }

  function backToMenu() {
    stopLoop();
    state = State.MENU;
    showOverlay(false);
    showMenu(true);
    el.btnPause && (el.btnPause.textContent = "Pause");
    resizeCanvas();
    drawBackground();
    startMenuMusic();
  }

  function toggleFullscreen() {
    // iPhone Safari não suporta fullscreen de canvas
    if (!el.canvas || !el.canvas.requestFullscreen) return;
    if (!document.fullscreenElement) el.canvas.requestFullscreen().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
    setTimeout(resizeCanvas, 150);
  }

  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (k === " " || k === "spacebar") { e.preventDefault(); pauseToggle(); return; }
    if (k === "r") { reset(); return; }
    if (k === "f") { toggleFullscreen(); return; }
    if (state !== State.RUNNING) return;

    if (k === "arrowup" || k === "w") setNextDir(0, -1);
    else if (k === "arrowdown" || k === "s") setNextDir(0, 1);
    else if (k === "arrowleft" || k === "a") setNextDir(-1, 0);
    else if (k === "arrowright" || k === "d") setNextDir(1, 0);
  });

  el.btnPlay?.addEventListener("click", startGame);
  el.btnPause?.addEventListener("click", () => pauseToggle());
  el.btnReset?.addEventListener("click", reset);
  el.btnMenu?.addEventListener("click", backToMenu);
  el.btnFull?.addEventListener("click", toggleFullscreen);

  el.btnOverlayResume?.addEventListener("click", () => pauseToggle(false));
  el.btnOverlayReset?.addEventListener("click", reset);
  el.btnOverlayMenu?.addEventListener("click", backToMenu);

  function applySavedSettingsToUI() {
    const setIf = (node, key) => {
      const v = localStorage.getItem(key);
      if (node && v !== null) node.value = v;
    };
    setIf(el.sfxVol, LS.sfxVol);
    setIf(el.musicVol, LS.musicVol);
    setIf(el.bgOpacity, LS.bgOpacity);
    setIf(el.grid, LS.grid);
    setIf(el.walls, LS.walls);
    setIf(el.difficulty, LS.difficulty);
    setIf(el.mode, LS.mode);
  }

  function wireSettingsSave() {
    const saveVal = (node, key) => node?.addEventListener("change", () => localStorage.setItem(key, String(node.value)));
    const saveInput = (node, key) => node?.addEventListener("input", () => localStorage.setItem(key, String(node.value)));

    saveInput(el.sfxVol, LS.sfxVol);
    saveInput(el.musicVol, LS.musicVol);
    saveInput(el.bgOpacity, LS.bgOpacity);
    saveVal(el.grid, LS.grid);
    saveVal(el.walls, LS.walls);
    saveVal(el.difficulty, LS.difficulty);
    saveVal(el.mode, LS.mode);

    el.bgFile?.addEventListener("change", () => {
      const f = el.bgFile.files && el.bgFile.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        const data = String(reader.result || "");
        localStorage.setItem(LS.bgData, data);
        loadBgFromStorage();
      };
      reader.readAsDataURL(f);
    });
  }

  // BOOT
  applySavedSettingsToUI();
  loadBgFromStorage();
  wireSettingsSave();

  showOverlay(false);
  showMenu(true);
  resizeCanvas();
  syncHud();
  drawBackground();

  // PC/Mac: tenta tocar menu logo
  unlockAudioOnce();
})();
