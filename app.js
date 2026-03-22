(() => {
  "use strict";

  const el = {
    canvas: document.getElementById("game"),
    menu: document.getElementById("menu"),
    overlay: document.getElementById("overlay"),
    overlayTitle: document.getElementById("overlayTitle"),
    overlayText: document.getElementById("overlayText"),
    worldToast: document.getElementById("worldToast"),

    btnPlay: document.getElementById("btnPlay"),
    btnReset: document.getElementById("btnReset"),
    btnMenu: document.getElementById("btnMenu"),
    btnFull: document.getElementById("btnFull"),

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
    stats: document.getElementById("stats"),
    stats: document.getElementById("stats"),
    level: document.getElementById("level"),
    time: document.getElementById("time"),
    combo: document.getElementById("combo"),
    hint: document.getElementById("hint"),
    boardSize: document.getElementById("boardSize"),
    worldSelect: document.getElementById("worldSelect"),
    timedDuration: document.getElementById("timedDuration"),
    combo: document.getElementById("combo"),
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
    hint: "cs_hint",
    timedDuration: "cs_timedDuration",
  };

  const GRID_PRESETS = {
    small:  { cols: 18, rows: 12, mCols: 24, mRows: 6, pCols: 14, pRows: 18 },
    medium: { cols: 24, rows: 16, mCols: 30, mRows: 7, pCols: 16, pRows: 20 },
    large:  { cols: 30, rows: 20, mCols: 34, mRows: 8, pCols: 18, pRows: 24 },
  };
  let gridSize = GRID_PRESETS.medium;
  const BOARD_SIZE_PRESETS = {
    small: 0.985,
    medium: 1.0,
    large: 1.02,
  };
  const COMBO_WINDOW_MS = 2200;
  const COMBO_MAX_MULT = 3.0;

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
  let timeAttackDuration = 20;
  let lastSecondTs = 0;

  let combo = 0;
  let comboMult = 1.0;
  let lastEatAt = 0;
  let lastGain = 0;

  let particles = [];
  let lastFrameTs = 0;

  let wallsOn = false;

  let snake = [];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = { x: 10, y: 10 };

  let score = 0;
  let level = 1;
  let lastLevelForSound = 1;
  let best = Number(localStorage.getItem(STORAGE_KEY) || 0);
  el.best && (el.best.textContent = String(best));

  // ---------- Canvas layout ----------
  let cssW = 800, cssH = 600, dpr = 1;
  let cell = 20, boardW = 440, boardH = 440, ox = 0, oy = 0;
  let gridCols = 24, gridRows = 24;

  function currentBoardScale() {
    const key = el.boardSize?.value || "medium";
    return BOARD_SIZE_PRESETS[key] ?? BOARD_SIZE_PRESETS.medium;
  }

  function isMobileLandscape() {
    return window.matchMedia("(max-width: 950px) and (orientation: landscape)").matches;
  }

  function currentGridPreset() {
    const key = el.boardSize?.value || "medium";
    const preset = GRID_PRESETS[key] ?? GRID_PRESETS.medium;

    const mobileLandscape = window.matchMedia("(max-width: 950px) and (orientation: landscape)").matches;
    const mobilePortrait = window.matchMedia("(max-width: 950px) and (orientation: portrait)").matches;

    if (mobileLandscape) return { cols: preset.mCols, rows: preset.mRows };
    if (mobilePortrait) return { cols: preset.pCols, rows: preset.pRows };
    return { cols: preset.cols, rows: preset.rows };
  }

  function currentGridSize() {
    return currentGridPreset().cols;
  }

  function currentGridRows() {
    return currentGridPreset().rows;
  }

  function currentSpriteScale() {
    const key = el.boardSize?.value || "medium";
    if (key === "small") return 1.18;
    if (key === "large") return 0.78;
    return 1.0;
  }

  function currentWorldKey() {
    if (gridCols <= 18) return "small";
    if (gridCols >= 28) return "large";
    return "medium";
  }

  function worldToLabel(world) {
    return world === "small" ? "Mundo 1" : world === "large" ? "Mundo 3" : "Mundo 2";
  }

  function applyWorld(world) {
    const next = world === "small" ? "small" : world === "large" ? "large" : "medium";
    if (el.boardSize) el.boardSize.value = next;
    localStorage.setItem(LS.boardSize, next);
    if (el.worldSelect) el.worldSelect.value = next;
    resizeCanvas();

    if (state === State.RUNNING || state === State.PAUSED || state === State.OVER) {
      draw();
      requestAnimationFrame(() => {
        resizeCanvas();
        draw();
      });
    } else {
      drawBackground();
      requestAnimationFrame(() => {
        resizeCanvas();
        drawBackground();
      });
    }

    return next;
  }

  let worldToastTimer = null;

  function announceWorld(world) {
    if (!el.worldToast) return;

    const title = world === "small" ? "MUNDO 1" : world === "medium" ? "MUNDO 2" : "MUNDO 3";
    const subtitle = world === "small" ? "NEON AMBER" : world === "medium" ? "NEON BLUE" : "NEON VIOLET";
    const cls = world === "small" ? "amber" : world === "medium" ? "blue" : "violet";

    el.worldToast.className = `world-toast ${cls}`;
    el.worldToast.innerHTML = `<strong>${title}</strong><span>${subtitle}</span>`;

    clearTimeout(worldToastTimer);
    requestAnimationFrame(() => {
      el.worldToast.classList.remove("hidden");
      el.worldToast.classList.add("show");
    });

    worldToastTimer = setTimeout(() => {
      el.worldToast.classList.remove("show");
      el.worldToast.classList.add("hidden");
    }, 1200);
  }

  function cycleWorld() {
    if (state !== State.MENU) return;
    const current = currentWorldKey();
    const next = current === "small" ? "medium" : current === "medium" ? "large" : "small";
    const applied = applyWorld(next);
    if (typeof announceWorld === "function") announceWorld(applied);
  }

  function resizeCanvas() {
    const rect = el.canvas.getBoundingClientRect();
    cssW = Math.max(1, rect.width);
    cssH = Math.max(1, rect.height);
    dpr = Math.max(1, window.devicePixelRatio || 1);

    el.canvas.width = Math.floor(cssW * dpr);
    el.canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const preset = currentGridPreset();

    const mobileLandscape = window.matchMedia("(max-width: 950px) and (orientation: landscape)").matches;
    const mobilePortrait = window.matchMedia("(max-width: 950px) and (orientation: portrait)").matches;
    const desktopMode = !mobileLandscape && !mobilePortrait;

    const padX = desktopMode ? 0 : 4;
    const padY = desktopMode ? 0 : 4;

    const usableW = Math.max(1, cssW - padX);
    const usableH = Math.max(1, cssH - padY);

    if (desktopMode) {
      gridCols = preset.cols;
      cell = Math.max(8, Math.floor(usableW / gridCols));
      boardW = cell * gridCols;
      gridRows = Math.max(8, Math.floor(usableH / cell));
      boardH = cell * gridRows;
      ox = Math.floor((cssW - boardW) / 2);
      oy = Math.floor((cssH - boardH) / 2);
      return;
    }

    gridCols = preset.cols;
    gridRows = preset.rows;

    const cellW = Math.floor(usableW / gridCols);
    const cellH = Math.floor(usableH / gridRows);
    cell = Math.max(8, Math.min(cellW, cellH));

    boardW = cell * gridCols;
    boardH = cell * gridRows;

    ox = Math.floor((cssW - boardW) / 2);
    oy = Math.floor((cssH - boardH) / 2);
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

  const NORMAL_COIN_FILES = [
    "Ethereum1.png",
    "Solana1.png",
    "Cardano1.png",
    "Doge1.png"
  ];

  const SPECIAL_COIN_FILE = "Bitcoin1.png";

  const coinImages = {
    normal: [],
    special: null
  };

  function loadCoinImages(){
    const fallbackMap = {
      "Ethereum1.png": "assets/img/ethereum.png",
      "Solana1.png": "assets/img/solana.png",
      "Cardano1.png": "assets/img/cardano.png",
      "Doge1.png": "assets/img/doge.png",
      "Bitcoin1.png": "assets/img/bitcoin.png",
    };

    function buildImage(name){
      const i = new Image();
      i._ready = false;
      i._url = new URL("assets/" + name, window.location.href).href + "?v=coins6";

      i.onload = () => {
        i._ready = true;
        console.log("coin loaded:", i.currentSrc || i.src);
      };

      i.onerror = () => {
        if (i.dataset.fallbackTried === "1") return;
        i.dataset.fallbackTried = "1";
        i.src = new URL(fallbackMap[name] || ("assets/" + name), window.location.href).href + "?v=coins6fb";
        console.log("coin fallback:", i.src);
      };

      console.log("coin request:", i._url);
      i.src = i._url;
      return i;
    }

    coinImages.normal = NORMAL_COIN_FILES.map(buildImage);
    coinImages.special = buildImage(SPECIAL_COIN_FILE);
  }


  function loadBgFromStorage() {
    const data = localStorage.getItem(LS.bgData);
    if (!data) {
      bgImg = null;
      return;
    }
    const img = new Image();
    img.onload = () => {
      bgImg = img;
      resizeCanvas();
      if (state === State.RUNNING || state === State.PAUSED || state === State.OVER) draw();
      else drawBackground();
    };
    img.src = data;
  }

  function handleBackgroundFileUpload(file) {
    if (!file) return;
    if (!String(file.type || "").startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result;
      try { localStorage.setItem(LS.bgData, data); } catch {}

      const img = new Image();
      img.onload = () => {
        bgImg = img;
        resizeCanvas();
        if (state === State.RUNNING || state === State.PAUSED || state === State.OVER) draw();
        else drawBackground();
      };
      img.src = data;
    };
    reader.readAsDataURL(file);
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

  function resetCombo() {
    combo = 0;
    comboMult = 1.0;
    lastEatAt = 0;
    lastGain = 0;
  }

  function registerEat(basePoints = 10) {
    const now = performance.now();
    if (lastEatAt && (now - lastEatAt) <= COMBO_WINDOW_MS) combo += 1;
    else combo = 1;

    lastEatAt = now;
    comboMult = 1.0;
    lastGain = basePoints;
    score += lastGain;
  }

  function hintOn() {
    return (el.hint?.value || "on") === "on";
  }

  function emitCoinBurst(gridX, gridY, kind = "normal") {
    const cx = ox + gridX * cell + cell / 2;
    const cy = oy + gridY * cell + cell / 2;
    const count = kind === "special" ? 16 : 10;

    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.35;
      const speed = (kind === "special" ? 1.8 : 1.2) + Math.random() * (kind === "special" ? 1.6 : 1.0);
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: kind === "special" ? 0.95 : 0.7,
        maxLife: kind === "special" ? 0.95 : 0.7,
        size: kind === "special" ? (3 + Math.random() * 4) : (2 + Math.random() * 3),
        color: kind === "special"
          ? [255, 215, 0]
          : [125, 249, 255],
      });
    }
  }

  function updateParticles(dtSec) {
    if (!particles.length) return;

    for (const p of particles) {
      p.x += p.vx * cell * dtSec;
      p.y += p.vy * cell * dtSec;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.life -= dtSec;
    }

    particles = particles.filter(p => p.life > 0);
  }

  function drawParticles() {
    if (!particles.length) return;

    for (const p of particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha})`;
      ctx.shadowBlur = Math.max(4, p.size * 2);
      ctx.shadowColor = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawImageCover(img, x, y, w, h) {
    if (!img || !img.complete || !img.naturalWidth || !img.naturalHeight) return;

    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const sw = img.naturalWidth * scale;
    const sh = img.naturalHeight * scale;
    const dx = x + (w - sw) / 2;
    const dy = y + (h - sh) / 2;

    ctx.drawImage(img, dx, dy, sw, sh);
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
    const world = typeof currentWorldKey === "function" ? currentWorldKey() : "medium";
    const theme = world === "small"
      ? {
          name: "NEON AMBER",
          accent: "#ffcf86",
          glow: "rgba(255,170,60,0.28)",
          border: "rgba(255,190,90,0.34)",
          font: "Trebuchet MS, Arial, sans-serif",
        }
      : world === "large"
        ? {
            name: "NEON VIOLET",
            accent: "#ddb0ff",
            glow: "rgba(180,90,255,0.28)",
            border: "rgba(205,130,255,0.34)",
            font: "Verdana, Arial, sans-serif",
          }
        : {
            name: "NEON BLUE",
            accent: "#9fddff",
            glow: "rgba(70,140,255,0.28)",
            border: "rgba(105,205,255,0.34)",
            font: "Segoe UI, Arial, sans-serif",
          };

    el.score && (el.score.textContent = String(score));
    el.best && (el.best.textContent = String(best));
    level = 1 + Math.floor(score / 50);
    el.level && (el.level.textContent = String(level));

    if (level > lastLevelForSound) {
      lastLevelForSound = level;
      try { playSfx(sfx.level); } catch {}
    }

    if (el.time) {
      el.time.textContent = (el.mode?.value === "timed") ? `${Math.max(0, timeLeft)}s` : "--";
    }

    if (el.combo) {
      el.combo.textContent = combo > 1 ? `Combo ${combo}` : "Combo 1";
    }

    if (el.stats) {
      el.stats.dataset.world = world;
      el.stats.style.setProperty("--hud-accent", theme.accent);
      el.stats.style.setProperty("--hud-glow", theme.glow);
      el.stats.style.setProperty("--hud-border", theme.border);
      el.stats.style.setProperty("--hud-font", theme.font);
    }
  }

  // ---------- Game ----------
  function spawnFood() {
    for (let tries = 0; tries < 5000; tries++) {
      const x = Math.floor(Math.random() * gridCols);
      const y = Math.floor(Math.random() * gridRows);
      const blocked = snake.some(p => p.x === x && p.y === y);
      if (!blocked) {
        const isSpecial = Math.random() < 0.12;
        food = {
          x, y,
          type: isSpecial ? "special" : "normal",
          spriteIndex: isSpecial ? -1 : Math.floor(Math.random() * NORMAL_COIN_FILES.length)
        };
        return;
      }
    }
    food = { x: 1, y: 1, type: "normal", spriteIndex: 0 };
  }

  function initGameFromMenu() {
    const diff = DIFFICULTY[el.difficulty?.value] || DIFFICULTY.normal;
    tickMs = diff.tickMs;
    gridSize = currentGridSize();

    score = 0;
    speedMult = 1.0;
    resetCombo();
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };

    wallsOn = (el.walls?.value === "on");
    if (el.mode?.value === "classic" && el.walls?.value === "off") wallsOn = false;

    const mid = Math.floor(gridSize / 2);
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
      if (newHead.x < 0 || newHead.y < 0 || newHead.x >= gridCols || newHead.y >= gridRows) {
        gameOver("Bateu na parede.");
        return;
      }
    } else {
      newHead.x = (newHead.x + gridCols) % gridCols;
      newHead.y = (newHead.y + gridRows) % gridRows;
    }

    if (snake.some(p => p.x === newHead.x && p.y === newHead.y)) {
      gameOver("Colisão com o corpo.");
      return;
    }

    snake.unshift(newHead);

    if (newHead.x === food.x && newHead.y === food.y) {
      const eatenType = food.type || "normal";
      registerEat(eatenType === "special" ? 20 : 10);
      playSfx(sfx.eat);
      if (eatenType === "special") playSfx(sfx.level);
      emitCoinBurst(newHead.x, newHead.y, eatenType);

      if (el.mode?.value === "timed") {
        timeLeft += (eatenType === "special" ? 2 : 1);
      }

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
    if (!lastFrameTs) lastFrameTs = ts;

    const dt = ts - lastTs;
    const frameDt = (ts - lastFrameTs) / 1000;
    lastTs = ts;
    lastFrameTs = ts;
    accMs += dt;

    if (el.mode?.value === "timed") {
      if (!lastSecondTs) lastSecondTs = ts;
      if (ts - lastSecondTs >= 1000) {
        lastSecondTs += 1000;
        timeLeft -= 1;
        if (timeLeft <= 0) { gameOver("Tempo esgotado."); return; }
        syncHud();
      }
    }

    const effectiveTick = tickMs / speedMult;
    while (accMs >= effectiveTick) {
      accMs -= effectiveTick;
      step();
      if (state !== State.RUNNING) return;
    }

    updateParticles(frameDt);
    draw();
    rafId = requestAnimationFrame(loop);
  }

  // ---------- Render ----------
  function drawBackground() {
    const world = typeof currentWorldKey === "function" ? currentWorldKey() : "medium";

    const theme = world === "small"
      ? {
          name: "NEON AMBER",
          accent: "rgba(255,190,90,0.86)",
          glow: "rgba(255,170,60,0.18)",
          bgA: "#120b06",
          bgB: "#1a1208",
        }
      : world === "large"
        ? {
            name: "NEON VIOLET",
            accent: "rgba(205,130,255,0.88)",
            glow: "rgba(170,90,255,0.18)",
            bgA: "#0d0716",
            bgB: "#160a24",
          }
        : {
            name: "NEON BLUE",
            accent: "rgba(105,205,255,0.88)",
            glow: "rgba(70,150,255,0.18)",
            bgA: "#050812",
            bgB: "#091226",
          };

    const bgGrad = ctx.createLinearGradient(0, 0, 0, cssH);
    bgGrad.addColorStop(0, theme.bgA);
    bgGrad.addColorStop(1, theme.bgB);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, cssW, cssH);

    if (bgImg) {
      const a = bgOpacity();
      if (a > 0) {
        ctx.save();
        ctx.globalAlpha = Math.max(0.12, a * 0.35);
        drawImageCover(bgImg, 0, 0, cssW, cssH);
        ctx.restore();
      }
    }

    if (bgImg) {
      const a = bgOpacity();
      if (a > 0) {
        ctx.save();
        ctx.globalAlpha = a;
        drawImageCover(bgImg, ox, oy, boardW, boardH);
        ctx.restore();
      } else {
        ctx.fillStyle = "rgba(7,10,18,0.92)";
        ctx.fillRect(ox, oy, boardW, boardH);
      }
    } else {
      ctx.fillStyle = "rgba(7,10,18,0.92)";
      ctx.fillRect(ox, oy, boardW, boardH);
    }

    const ga = gridAlpha();
    if (ga > 0) {
      ctx.strokeStyle = `rgba(255,255,255,${ga})`;
      ctx.lineWidth = 1;
      for (let i = 0; i <= gridCols; i++) {
        const x = ox + i * cell;
        ctx.beginPath();
        ctx.moveTo(x, oy);
        ctx.lineTo(x, oy + boardH);
        ctx.stroke();
      }
      for (let i = 0; i <= gridRows; i++) {
        const y = oy + i * cell;
        ctx.beginPath();
        ctx.moveTo(ox, y);
        ctx.lineTo(ox + boardW, y);
        ctx.stroke();
      }
    }

    ctx.save();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = theme.accent;
    ctx.shadowBlur = 7;
    ctx.shadowColor = theme.glow;
    ctx.strokeRect(ox + 1, oy + 1, boardW - 2, boardH - 2);
    ctx.restore();

    if (wallsOn) {
      ctx.save();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = theme.accent;
      ctx.shadowBlur = 11;
      ctx.shadowColor = theme.glow;
      ctx.strokeRect(ox + 1, oy + 1, boardW - 2, boardH - 2);
      ctx.restore();
    }

    ctx.save();
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.font = "bold 11px Arial";
    ctx.fillStyle = theme.accent;
    ctx.shadowBlur = 6;
    ctx.shadowColor = theme.glow;
    ctx.fillText(theme.name, ox + boardW - 10, oy + 8);
    ctx.restore();
  }

  function drawHint() {
    if (!hintOn() || !snake?.length) return;

    const head = snake[0];
    const hx = head.x;
    const hy = head.y;
    const fx = food.x;
    const fy = food.y;

    const aligned = (hx === fx || hy === fy);
    const color = aligned ? [60, 255, 60] : [255, 60, 60];

    const hxPx = ox + hx * cell + cell / 2;
    const hyPx = oy + hy * cell + cell / 2;
    const fxPx = ox + fx * cell + cell / 2;
    const fyPx = oy + fy * cell + cell / 2;

    const bandHalf = Math.max(6, Math.floor(cell * 0.34));
    const outlineOffset = bandHalf;
    const outlineWidth = Math.max(1, Math.floor(cell * 0.05));
    const step = 4;
    const maxPx = Math.max(1, 22 * cell);

    function falloff(distPx) {
      const v = distPx / maxPx;
      return Math.exp(-2.2 * v);
    }

    function drawHorizontal(x1, x2, yCenter, coinX) {
      if (x1 === x2) return;
      const xa = Math.min(x1, x2);
      const xb = Math.max(x1, x2);
      for (let x = xa; x <= xb; x += step) {
        const distPx = Math.abs(x - coinX);
        const aFill = Math.floor(210 * 0.5 * falloff(distPx));
        const aLine = Math.floor(220 * falloff(distPx));

        if (aFill > 0) {
          ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${aFill / 255})`;
          ctx.fillRect(x, yCenter - bandHalf, step, bandHalf * 2);
        }
        if (aLine > 0) {
          ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${aLine / 255})`;
          ctx.lineWidth = outlineWidth;
          ctx.beginPath();
          ctx.moveTo(x, yCenter - outlineOffset);
          ctx.lineTo(Math.min(x + step, cssW - 1), yCenter - outlineOffset);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, yCenter + outlineOffset);
          ctx.lineTo(Math.min(x + step, cssW - 1), yCenter + outlineOffset);
          ctx.stroke();
        }
      }
    }

    function drawVertical(y1, y2, xCenter, coinY) {
      if (y1 === y2) return;
      const ya = Math.min(y1, y2);
      const yb = Math.max(y1, y2);
      for (let y = ya; y <= yb; y += step) {
        const distPx = Math.abs(y - coinY);
        const aFill = Math.floor(210 * 0.5 * falloff(distPx));
        const aLine = Math.floor(220 * falloff(distPx));

        if (aFill > 0) {
          ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${aFill / 255})`;
          ctx.fillRect(xCenter - bandHalf, y, bandHalf * 2, step);
        }
        if (aLine > 0) {
          ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${aLine / 255})`;
          ctx.lineWidth = outlineWidth;
          ctx.beginPath();
          ctx.moveTo(xCenter - outlineOffset, y);
          ctx.lineTo(xCenter - outlineOffset, Math.min(y + step, cssH - 1));
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(xCenter + outlineOffset, y);
          ctx.lineTo(xCenter + outlineOffset, Math.min(y + step, cssH - 1));
          ctx.stroke();
        }
      }
    }

    if (hxPx !== fxPx) drawHorizontal(hxPx, fxPx, hyPx, fxPx);
    if (hyPx !== fyPx) drawVertical(hyPx, fyPx, fxPx, fyPx);
  }

  function drawFood() {
    const x = ox + food.x * cell;
    const y = oy + food.y * cell;
    const spriteScale = currentSpriteScale();

    let img = null;
    if (food.type === "special") {
      img = coinImages.special;
    } else {
      const idx = Number.isInteger(food.spriteIndex) ? food.spriteIndex : 0;
      img = coinImages.normal[idx] || coinImages.normal[0] || null;
    }

    if (img && img.complete && img.naturalWidth > 0) {
      const pulse = 1 + 0.06 * Math.sin(performance.now() / 180);
      const size = Math.max(8, Math.floor(cell * 0.88 * spriteScale * pulse));
      const dx = x + Math.floor((cell - size) / 2);
      const dy = y + Math.floor((cell - size) / 2);

      ctx.save();
      if (food.type === "special") {
        ctx.shadowBlur = Math.max(8, Math.floor(cell * 0.55 * spriteScale));
        ctx.shadowColor = "rgba(255, 200, 40, 0.75)";
      } else {
        ctx.shadowBlur = Math.max(5, Math.floor(cell * 0.32 * spriteScale));
        ctx.shadowColor = "rgba(125, 249, 255, 0.35)";
      }
      ctx.drawImage(img, dx, dy, size, size);
      ctx.restore();
      return;
    }

    ctx.fillStyle = food.type === "special"
      ? "rgba(245,158,11,0.95)"
      : "rgba(34,197,94,0.95)";
    ctx.beginPath();
    ctx.arc(
      x + cell / 2,
      y + cell / 2,
      Math.max(4, cell * 0.28 * spriteScale),
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  function drawSnake() {
    const spriteScale = currentSpriteScale();

    for (let i = snake.length - 1; i >= 0; i--) {
      const p = snake[i];
      const x = ox + p.x * cell;
      const y = oy + p.y * cell;
      const cx = x + cell / 2;
      const cy = y + cell / 2;

      ctx.save();

      if (i === 0) {
        const r = Math.max(6, cell * 0.42 * spriteScale);

        const headGlow = ctx.createRadialGradient(
          cx - cell * 0.08 * spriteScale,
          cy - cell * 0.10 * spriteScale,
          2,
          cx,
          cy,
          r * 1.3
        );
        headGlow.addColorStop(0, "rgba(160,255,245,1)");
        headGlow.addColorStop(0.55, "rgba(57,255,221,0.98)");
        headGlow.addColorStop(1, "rgba(0,170,155,0.92)");

        ctx.shadowBlur = Math.max(8, Math.floor(cell * 0.55 * spriteScale));
        ctx.shadowColor = "rgba(57,255,221,0.45)";
        ctx.fillStyle = headGlow;

        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 1.10, r, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#071018";

        ctx.beginPath();
        ctx.arc(cx - cell * 0.13 * spriteScale, cy - cell * 0.12 * spriteScale, Math.max(2, cell * 0.05 * spriteScale), 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx + cell * 0.13 * spriteScale, cy - cell * 0.12 * spriteScale, Math.max(2, cell * 0.05 * spriteScale), 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255,255,255,0.78)";
        ctx.lineWidth = Math.max(1, cell * 0.045 * spriteScale);
        ctx.beginPath();
        ctx.moveTo(cx - cell * 0.08 * spriteScale, cy + cell * 0.10 * spriteScale);
        ctx.quadraticCurveTo(cx, cy + cell * 0.18 * spriteScale, cx + cell * 0.08 * spriteScale, cy + cell * 0.10 * spriteScale);
        ctx.stroke();

      } else {
        const r = Math.max(4, cell * (0.34 - Math.min(i, 10) * 0.008) * spriteScale);

        const bodyGrad = ctx.createRadialGradient(
          cx - cell * 0.06 * spriteScale,
          cy - cell * 0.07 * spriteScale,
          2,
          cx,
          cy,
          r * 1.15
        );
        bodyGrad.addColorStop(0, "rgba(220,150,255,0.92)");
        bodyGrad.addColorStop(0.58, "rgba(168,85,247,0.82)");
        bodyGrad.addColorStop(1, "rgba(80,35,130,0.55)");

        ctx.shadowBlur = Math.max(4, Math.floor(cell * 0.22 * spriteScale));
        ctx.shadowColor = "rgba(168,85,247,0.18)";
        ctx.fillStyle = bodyGrad;

        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.92, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  function draw() {
    drawBackground();
    drawHint();
    drawFood();
    drawSnake();
    drawParticles();
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
    showOverlay(true, "Game Over", msg || "Restart ou Menu.");
    if (el.btnOverlayReset) el.btnOverlayReset.textContent = "Restart";
    draw();
  }

  function startGame() {
    unlockAudioOnce();
    loadCoinImages();
    resizeCanvas();
    initGameFromMenu();
    particles = [];
    lastFrameTs = 0;
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
      showOverlay(true, "Pausa", "Espaço para continuar");
    } else {
      state = State.RUNNING;
      showOverlay(false);
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
    if (state !== State.MENU) return;
    cycleWorld();
  }

  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (k === " " || k === "spacebar") { e.preventDefault(); pauseToggle(); return; }
    if (k === "r") { reset(); return; }
    if (k === "f") { toggleFullscreen(); return; }
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
  el.btnReset?.addEventListener("click", reset);
  el.btnMenu?.addEventListener("click", backToMenu);
  el.btnFull?.addEventListener("click", toggleFullscreen);

  el.btnOverlayReset?.addEventListener("click", () => startGame());
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
    setIf(el.hint, LS.hint);
    setIf(el.timedDuration, LS.timedDuration);
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
    saveVal(el.hint, LS.hint);
    saveVal(el.timedDuration, LS.timedDuration);

    el.bgFile?.addEventListener("change", () => {
      const f = el.bgFile.files && el.bgFile.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        const data = String(reader.result || "");
        localStorage.setItem(LS.bgData, data);
        loadBgFromStorage();
  loadCoinImages();
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
