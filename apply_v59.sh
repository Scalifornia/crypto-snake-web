#!/bin/bash
set -e

cp app.js app.js.bak_$(date +%Y%m%d_%H%M%S)
cp index.html index.html.bak_$(date +%Y%m%d_%H%M%S)
cp style.css style.css.bak_$(date +%Y%m%d_%H%M%S)

cat > app.js <<'APPJS'
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

    btnOverlayResume: document.getElementById("btnOverlayResume"),
    btnOverlayReset: document.getElementById("btnOverlayReset"),
    btnOverlayMenu: document.getElementById("btnOverlayMenu"),

    mode: document.getElementById("mode"),
    difficulty: document.getElementById("difficulty"),
    walls: document.getElementById("walls"),
    grid: document.getElementById("grid"),
    boardSize: document.getElementById("boardSize"),
    timedDuration: document.getElementById("timedDuration"),
    hint: document.getElementById("hint"),

    bgOpacity: document.getElementById("bgOpacity"),
    bgFile: document.getElementById("bgFile"),

    sound: document.getElementById("sound"),
    sfxVol: document.getElementById("sfxVol"),

    music: document.getElementById("music"),
    musicVol: document.getElementById("musicVol"),

    score: document.getElementById("score"),
    best: document.getElementById("best"),
    time: document.getElementById("time"),
    combo: document.getElementById("combo"),
  };

  if (!el.canvas) return;
  const ctx = el.canvas.getContext("2d", { alpha: false });

  const STORAGE_KEY = "cryptoSnakeBest_v59";
  const LS = {
    sfxVol: "cs_sfxVol",
    musicVol: "cs_musicVol",
    bgData: "cs_bgData",
    bgOpacity: "cs_bgOpacity",
    grid: "cs_grid",
    walls: "cs_walls",
    difficulty: "cs_difficulty",
    mode: "cs_mode",
    boardSize: "cs_boardSize",
    timedDuration: "cs_timedDuration",
    hint: "cs_hint",
  };

  const GRID = 22;
  const COMBO_WINDOW_MS = 2500;
  const COMBO_MAX_MULT = 3.0;

  const DIFFICULTY = {
    easy: { tickMs: 140 },
    normal: { tickMs: 110 },
    hard: { tickMs: 85 },
  };

  const BOARD_SIZE_PRESETS = {
    small: 0.78,
    medium: 0.88,
    large: 0.98,
  };

  const State = { MENU: "MENU", RUNNING: "RUNNING", PAUSED: "PAUSED", OVER: "OVER" };
  let state = State.MENU;

  let rafId = null;
  let lastTs = 0;
  let accMs = 0;

  let tickMs = DIFFICULTY.normal.tickMs;
  let speedMult = 1.0;

  let timeAttackDuration = 20;
  let timeLeft = 20;
  let lastSecondTs = 0;

  let wallsOn = false;

  let snake = [];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = { x: 10, y: 10 };

  let score = 0;
  let best = Number(localStorage.getItem(STORAGE_KEY) || 0);

  let combo = 0;
  let comboMult = 1.0;
  let lastEatAt = 0;
  let lastGain = 0;

  el.best && (el.best.textContent = String(best));

  let cssW = 800, cssH = 600, dpr = 1;
  let cell = 20, boardPx = 440, ox = 0, oy = 0;

  let bgImg = null;
  let audioUnlocked = false;

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

  function currentBoardScale() {
    const key = el.boardSize?.value || "small";
    return BOARD_SIZE_PRESETS[key] ?? BOARD_SIZE_PRESETS.small;
  }

  function resizeCanvas() {
    const rect = el.canvas.getBoundingClientRect();
    cssW = Math.max(1, rect.width);
    cssH = Math.max(1, rect.height);
    dpr = Math.max(1, window.devicePixelRatio || 1);

    el.canvas.width = Math.floor(cssW * dpr);
    el.canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const scale = currentBoardScale();
    boardPx = Math.floor(Math.min(cssW, cssH) * scale);
    cell = Math.max(10, Math.floor(boardPx / GRID));
    boardPx = cell * GRID;

    ox = Math.floor((cssW - boardPx) / 2);
    oy = Math.floor((cssH - boardPx) / 2);
  }

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
  function hintOn() { return (el.hint?.value || "on") === "on"; }

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
    if (!shouldMusic()) {
      try { menuMusic.pause(); } catch {}
      return;
    }
    stopAllMusic();
    try {
      menuMusic.volume = musicVolume();
      menuMusic.play().catch(() => {});
    } catch {}
  }

  function startGameMusic() {
    if (!shouldMusic()) {
      try { gameMusic.pause(); } catch {}
      return;
    }
    stopAllMusic();
    try {
      gameMusic.volume = musicVolume();
      gameMusic.play().catch(() => {});
    } catch {}
  }

  function unlockAudioOnce() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    startMenuMusic();
  }

  async function playDeathSequence() {
    if (!shouldSfx()) return;
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

  function loadBgFromStorage() {
    const data = localStorage.getItem(LS.bgData);
    if (!data) {
      bgImg = null;
      return;
    }
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

  function showMenu(show) {
    el.menu?.classList.toggle("hidden", !show);
  }

  function showOverlay(show, title = "", text = "") {
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

    if (el.time) {
      if (el.mode?.value === "timed") el.time.textContent = String(Math.max(0, timeLeft));
      else el.time.textContent = "--";
    }

    if (el.combo) {
      if (combo > 1) el.combo.textContent = `x${combo} · +${lastGain}`;
      else el.combo.textContent = "--";
    }
  }

  function resetCombo() {
    combo = 0;
    comboMult = 1.0;
    lastEatAt = 0;
    lastGain = 0;
    syncHud();
  }

  function registerEat(basePoints = 10) {
    const now = performance.now();

    if (lastEatAt && (now - lastEatAt) <= COMBO_WINDOW_MS) combo += 1;
    else combo = 1;

    lastEatAt = now;
    comboMult = Math.min(COMBO_MAX_MULT, 1 + (combo - 1) * 0.2);
    lastGain = Math.round(basePoints * comboMult);
    score += lastGain;
    syncHud();
  }

  function spawnFood() {
    for (let tries = 0; tries < 5000; tries++) {
      const x = Math.floor(Math.random() * GRID);
      const y = Math.floor(Math.random() * GRID);
      const blocked = snake.some(p => p.x === x && p.y === y);
      if (!blocked) {
        food = { x, y };
        return;
      }
    }
    food = { x: 1, y: 1 };
  }

  function initGameFromMenu() {
    const diff = DIFFICULTY[el.difficulty?.value] || DIFFICULTY.normal;
    tickMs = diff.tickMs;

    score = 0;
    speedMult = 1.0;
    resetCombo();

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
      timeAttackDuration = Number(el.timedDuration?.value || 20);
      timeLeft = timeAttackDuration;
      lastSecondTs = 0;
    } else {
      timeLeft = 0;
      lastSecondTs = 0;
    }

    resizeCanvas();
    spawnFood();
    lastTs = 0;
    accMs = 0;
    syncHud();
  }

  function setNextDir(x, y) {
    if (x === -dir.x && y === -dir.y) return;
    nextDir = { x, y };
  }

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
    return ["button", "select", "input", "label", "a"].includes(tag);
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

    if (swipeX === null || swipeY === null) {
      swipeX = x;
      swipeY = y;
    }

    const dx = x - swipeX;
    const dy = y - swipeY;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);

    if (ax < SWIPE_TH && ay < SWIPE_TH) {
      e.preventDefault();
      return;
    }

    if (!turnLocked) {
      if (ax >= ay) setNextDir(dx > 0 ? 1 : -1, 0);
      else setNextDir(0, dy > 0 ? 1 : -1);
      turnLocked = true;
    }

    if (ax > SWIPE_RESET || ay > SWIPE_RESET) {
      swipeX = x;
      swipeY = y;
    }
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

  document.addEventListener("touchstart", onTouchStart, { passive: false });
  document.addEventListener("touchmove", onTouchMove, { passive: false });
  document.addEventListener("touchend", onTouchEnd, { passive: false });
  document.addEventListener("touchcancel", onTouchEnd, { passive: false });

  function drawHint() {
    if (!hintOn()) return;

    const head = snake[0];
    ctx.save();
    ctx.lineWidth = Math.max(2, Math.floor(cell * 0.12));

    if (head.x === food.x || head.y === food.y) {
      ctx.strokeStyle = "rgba(34,197,94,0.95)";
    } else {
      ctx.strokeStyle = "rgba(239,68,68,0.88)";
    }

    ctx.beginPath();
    ctx.moveTo(ox + head.x * cell + cell / 2, oy + head.y * cell + cell / 2);
    ctx.lineTo(ox + food.x * cell + cell / 2, oy + food.y * cell + cell / 2);
    ctx.stroke();
    ctx.restore();
  }

  function step() {
    turnLocked = false;
    dir = nextDir;

    if (combo > 0 && lastEatAt) {
      const nowCombo = performance.now();
      if ((nowCombo - lastEatAt) > COMBO_WINDOW_MS) resetCombo();
    }

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
      registerEat(10);
      playSfx(sfx.eat);
      spawnFood();

      if (el.mode?.value === "survival") {
        const before = speedMult;
        speedMult = Math.min(2.5, speedMult + 0.05);
        if (speedMult > before + 1e-9) playSfx(sfx.level);
      }

      if (el.mode?.value === "classic" && score > 0 && score % 50 === 0) {
        speedMult = Math.min(2.6, speedMult + 0.08);
        playSfx(sfx.level);
      }

      syncHud();
    } else {
      snake.pop();
    }
  }

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
        syncHud();
        if (timeLeft <= 0) {
          gameOver("Tempo esgotado.");
          return;
        }
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
        ctx.beginPath();
        ctx.moveTo(x, oy);
        ctx.lineTo(x, oy + boardPx);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(ox, y);
        ctx.lineTo(ox + boardPx, y);
        ctx.stroke();
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
    ctx.beginPath();
    ctx.arc(x + cell / 2, y + cell / 2, Math.max(4, cell * 0.28), 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSnake() {
    for (let i = snake.length - 1; i >= 0; i--) {
      const p = snake[i];
      const x = ox + p.x * cell;
      const y = oy + p.y * cell;
      const r = Math.max(4, Math.floor(cell * 0.36));

      if (i === 0) {
        ctx.fillStyle = "rgba(57,255,221,0.96)";
        ctx.beginPath();
        ctx.ellipse(x + cell / 2, y + cell / 2, r * 1.15, r, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#04141b";
        ctx.beginPath();
        ctx.arc(x + cell * 0.38, y + cell * 0.38, Math.max(2, cell * 0.06), 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + cell * 0.62, y + cell * 0.38, Math.max(2, cell * 0.06), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(168,85,247,${Math.max(0.18, 0.68 - i * 0.03)})`;
        ctx.beginPath();
        ctx.ellipse(x + cell / 2, y + cell / 2, r, r * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function draw() {
    drawBackground();
    drawHint();
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
    resetCombo();

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
    syncHud();
    drawBackground();
    startMenuMusic();
  }

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
    setIf(el.boardSize, LS.boardSize);
    setIf(el.timedDuration, LS.timedDuration);
    setIf(el.hint, LS.hint);
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
    saveVal(el.boardSize, LS.boardSize);
    saveVal(el.timedDuration, LS.timedDuration);
    saveVal(el.hint, LS.hint);

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

  window.addEventListener("resize", resizeCanvas, { passive: true });

  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();

    if (k === " " || k === "spacebar") {
      e.preventDefault();
      pauseToggle();
      return;
    }

    if (k === "r") {
      reset();
      return;
    }

    if (k === "h") {
      if (el.hint) {
        el.hint.value = el.hint.value === "on" ? "off" : "on";
        localStorage.setItem(LS.hint, String(el.hint.value));
      }
      return;
    }

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

  el.btnOverlayResume?.addEventListener("click", () => pauseToggle(false));
  el.btnOverlayReset?.addEventListener("click", reset);
  el.btnOverlayMenu?.addEventListener("click", backToMenu);

  el.boardSize?.addEventListener("change", () => {
    resizeCanvas();
    draw();
  });

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

  applySavedSettingsToUI();
  loadBgFromStorage();
  wireSettingsSave();

  showOverlay(false);
  showMenu(true);
  resizeCanvas();
  syncHud();
  drawBackground();
  unlockAudioOnce();
})();
APPJS

cat > index.html <<'INDEXHTML'
<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>Crypto Snake Web</title>
  <link rel="stylesheet" href="style.css?v=59" />
</head>
<body>
  <div id="app">
    <header class="topbar">
      <div class="brand">Crypto Snake</div>

      <div class="stats">
        <div class="pill">Score: <span id="score">0</span></div>
        <div class="pill">Best: <span id="best">0</span></div>
        <div class="pill">Tempo: <span id="time">--</span></div>
        <div class="pill">Combo: <span id="combo">--</span></div>
      </div>

      <div class="actions">
        <button id="btnPause" class="btn">Pause</button>
        <button id="btnReset" class="btn btn-primary">Reset</button>
        <button id="btnMenu" class="btn">Menu</button>
      </div>
    </header>

    <div id="menu" class="panel">
      <div class="menu-shell">
        <div class="menu-card">
          <h1>CRYPTO SNAKE</h1>

          <div class="row">
            <label for="mode">Modo</label>
            <select id="mode">
              <option value="classic" selected>Infinito (Classic)</option>
              <option value="timed">Time Attack</option>
              <option value="survival">Survival</option>
            </select>
          </div>

          <div class="row">
            <label for="timedDuration">Tempo Time Attack</label>
            <select id="timedDuration">
              <option value="10">10 segundos</option>
              <option value="20" selected>20 segundos</option>
              <option value="30">30 segundos</option>
            </select>
          </div>

          <div class="row">
            <label for="difficulty">Dificuldade</label>
            <select id="difficulty">
              <option value="easy">Easy</option>
              <option value="normal" selected>Normal</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div class="row">
            <label for="boardSize">Tamanho do quadro</label>
            <select id="boardSize">
              <option value="small" selected>Pequeno</option>
              <option value="medium">Médio</option>
              <option value="large">Grande</option>
            </select>
          </div>

          <div class="row">
            <label for="walls">Paredes</label>
            <select id="walls">
              <option value="off" selected>OFF (wrap)</option>
              <option value="on">ON (colisão)</option>
            </select>
          </div>

          <div class="row">
            <label for="grid">Grelha</label>
            <select id="grid">
              <option value="off" selected>OFF</option>
              <option value="mid">Médio</option>
              <option value="low">Fraco</option>
            </select>
          </div>

          <div class="row">
            <label for="hint">Hint iniciante</label>
            <select id="hint">
              <option value="on" selected>ON</option>
              <option value="off">OFF</option>
            </select>
          </div>

          <div class="row">
            <label for="bgOpacity">Opacidade fundo</label>
            <input id="bgOpacity" type="range" min="0" max="100" value="40" />
          </div>

          <div class="row">
            <label for="bgFile">Fundo (upload)</label>
            <input id="bgFile" type="file" accept="image/*" />
          </div>

          <div class="row">
            <label for="sound">Efeitos</label>
            <select id="sound">
              <option value="on" selected>On</option>
              <option value="off">Off</option>
            </select>
          </div>

          <div class="row">
            <label for="sfxVol">Volume efeitos</label>
            <input id="sfxVol" type="range" min="0" max="100" value="80" />
          </div>

          <div class="row">
            <label for="music">Música</label>
            <select id="music">
              <option value="on" selected>On</option>
              <option value="off">Off</option>
            </select>
          </div>

          <div class="row">
            <label for="musicVol">Volume música</label>
            <input id="musicVol" type="range" min="0" max="100" value="60" />
          </div>

          <div class="buttons">
            <button id="btnPlay" class="btn btn-primary">Play</button>
          </div>

          <p class="hint-text">PC: setas / WASD · Espaço = Pause · R = Reset · H = Hint</p>
          <p class="hint-text">Mobile: swipe em qualquer parte do ecrã</p>
        </div>
      </div>
    </div>

    <main class="stage">
      <canvas id="game" width="900" height="700" aria-label="Crypto Snake"></canvas>
    </main>

    <div id="overlay" class="overlay hidden">
      <div class="overlay-card">
        <h2 id="overlayTitle">Pausa</h2>
        <p id="overlayText">Espaço para continuar</p>
        <div class="buttons">
          <button id="btnOverlayResume" class="btn btn-primary">Resume</button>
          <button id="btnOverlayReset" class="btn">Reset</button>
          <button id="btnOverlayMenu" class="btn">Menu</button>
        </div>
      </div>
    </div>
  </div>

  <script defer src="app.js?v=59"></script>
</body>
</html>
INDEXHTML

cat > style.css <<'STYLECSS'
:root{
  --bg:#070812;
  --panel:#0c1022;
  --text:#eaf0ff;
  --muted:#93a4ff;
  --neon:#39ffdd;
  --neon2:#a855f7;
  --radius:14px;
  --pad:14px;
}

*{ box-sizing:border-box; }

html,body{
  height:100%;
  margin:0;
  background: radial-gradient(1200px 600px at 50% 20%, #141b3d 0%, var(--bg) 65%);
  color: var(--text);
  font-family:-apple-system, system-ui, Segoe UI, Roboto, Arial;
  overflow:hidden;
}

#app{
  height:100%;
  display:flex;
  flex-direction:column;
}

.topbar{
  z-index:40;
  position:sticky;
  top:0;
  display:grid;
  grid-template-columns: 1fr auto auto;
  gap:10px;
  align-items:center;
  padding: var(--pad);
  background: rgba(8,10,20,0.85);
  border-bottom: 1px solid rgba(57,255,221,0.18);
  backdrop-filter: blur(10px);
}

.brand{
  font-weight:900;
  letter-spacing:.6px;
  text-transform:uppercase;
  color: var(--text);
  text-shadow: 0 0 18px rgba(57,255,221,0.25);
}

.stats{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
}

.pill{
  background: rgba(12,16,34,0.78);
  border: 1px solid rgba(168,85,247,0.22);
  padding: 8px 10px;
  border-radius:999px;
  font-size:14px;
  box-shadow: 0 0 18px rgba(168,85,247,0.10);
}

.actions{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  justify-content:flex-end;
}

.btn{
  appearance:none;
  border:1px solid rgba(57,255,221,0.22);
  background: rgba(12,16,34,0.75);
  color: var(--text);
  padding: 10px 12px;
  border-radius: 12px;
  font-weight: 800;
  cursor:pointer;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.btn:active{ transform: translateY(1px); }

.btn-primary{
  border-color: rgba(57,255,221,0.35);
  background: linear-gradient(90deg, rgba(57,255,221,0.18), rgba(168,85,247,0.16));
  box-shadow: 0 0 24px rgba(57,255,221,0.10);
}

.stage{
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:12px;
}

#game{
  touch-action:none;
  width:min(98vw, 900px);
  height:min(calc(100vh - 140px), 820px);
  background:#050812;
  border-radius: var(--radius);
  border:1px solid rgba(57,255,221,0.22);
  box-shadow: 0 0 32px rgba(57,255,221,0.08);
  display:block;
}

@media (max-width:768px){
  .stage{ padding:0; }
  #game{
    width:100vw;
    height: calc(100dvh - 70px);
    border-radius:0;
    border-left:0;
    border-right:0;
  }
}

.panel{
  position:fixed;
  inset:0;
  display:flex;
  align-items:stretch;
  justify-content:flex-start;
  background:
    linear-gradient(180deg, rgba(5,8,14,.78), rgba(5,8,14,.55)),
    url("assets/img/fundo.png");
  background-size:cover;
  background-position:center;
  z-index:60;
}

.menu-shell{
  width: min(520px, 92vw);
  height: 100%;
  background: rgba(7,8,18,0.88);
  border-right: 1px solid rgba(57,255,221,0.22);
  backdrop-filter: blur(10px);
  padding: 18px;
  overflow:auto;
}

.menu-card{ width: 100%; }

.menu-card h1{
  margin:0 0 14px;
  font-size:32px;
  letter-spacing:1px;
  background: linear-gradient(90deg, var(--neon), var(--neon2));
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
  text-transform:uppercase;
}

.row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:14px;
  margin: 12px 0;
}

label{
  color: var(--muted);
  font-size: 13px;
  text-transform:uppercase;
  letter-spacing:.06em;
}

select, input[type="range"], input[type="file"]{
  width: 240px;
  max-width: 60vw;
}

select{
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(57,255,221,0.20);
  background: rgba(0,0,0,0.25);
  color: var(--text);
  outline:none;
}

input[type="range"]{ accent-color: var(--neon); }

.buttons{
  display:flex;
  gap:10px;
  margin-top: 14px;
}

.hint-text{
  color: rgba(147,164,255,0.9);
  font-size: 13px;
  margin:10px 0 0;
}

@media (max-width:768px){
  .panel{ align-items:flex-end; }
  .menu-shell{
    width: 100%;
    height: auto;
    max-height: 78vh;
    border-right: 0;
    border-top: 1px solid rgba(57,255,221,0.22);
    border-radius: 16px 16px 0 0;
  }
}

.overlay{
  position:fixed;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  background: rgba(0,0,0,.55);
  padding:22px;
  z-index:70;
}

.overlay-card{
  width:min(520px, 92vw);
  border-radius: 16px;
  background: rgba(7,8,18,0.92);
  border:1px solid rgba(168,85,247,0.25);
  box-shadow: 0 0 40px rgba(168,85,247,0.10);
  padding:18px;
}

.hidden{ display:none !important; }
STYLECSS

echo "Aplicado v59 com sucesso."
