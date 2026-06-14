(() => {
  "use strict";

  const el = {
    canvas: document.getElementById("game"),
    menu: document.getElementById("menu"),
    topbar: document.querySelector(".topbar"),
    btnOptions: document.getElementById("btnOptions"),
    btnCloseOptions: document.getElementById("btnCloseOptions"),
    optionsPanel: document.getElementById("optionsPanel"),
    overlay: document.getElementById("overlay"),
    overlayTitle: document.getElementById("overlayTitle"),
    overlayText: document.getElementById("overlayText"),
    overlayRanking: document.getElementById("overlayRanking"),
    rankingList: document.getElementById("rankingList"),
    rankingNameWrap: document.getElementById("rankingNameWrap"),
    rankingNameInput: document.getElementById("rankingNameInput"),
    btnSaveRank: document.getElementById("btnSaveRank"),
    worldToast: document.getElementById("worldToast"),
    btnProfile: document.getElementById("btnProfile"),
    btnWorlds: document.getElementById("btnWorlds"),
    btnRanking: document.getElementById("btnRanking"),
    btnExit: document.getElementById("btnExit"),
    profilePanel: document.getElementById("profilePanel"),
    profileContent: document.getElementById("profileContent"),
    btnCloseProfile: document.getElementById("btnCloseProfile"),
    worldsPanel: document.getElementById("worldsPanel"),
    worldsList: document.getElementById("worldsList"),
    btnCloseWorlds: document.getElementById("btnCloseWorlds"),
    levelUpToast: document.getElementById("levelUpToast"),
    levelUpText: document.getElementById("levelUpText"),
    tutorialCard: document.getElementById("tutorialCard"),
    tutorialText: document.getElementById("tutorialText"),

    btnPlay: document.getElementById("btnPlay"),
    btnReset: document.getElementById("btnReset"),
    btnMenu: document.getElementById("btnMenu"),
    btnHint: document.getElementById("btnHint"),
    btnFull: document.getElementById("btnFull"),

    btnOverlayReset: document.getElementById("btnOverlayReset"),
    btnOverlayMenu: document.getElementById("btnOverlayMenu"),
    btnOverlayWorlds: document.getElementById("btnOverlayWorlds"),

    mode: document.getElementById("mode"),
    difficulty: document.getElementById("difficulty"),
    walls: document.getElementById("walls"),
    grid: document.getElementById("grid"),

    bgPreset: document.getElementById("bgPreset"),
    bgOpacity: document.getElementById("bgOpacity"),
    bgFile: document.getElementById("bgFile"),

    sound: document.getElementById("sound"),
    sfxVol: document.getElementById("sfxVol"),

    music: document.getElementById("music"),
    musicVol: document.getElementById("musicVol"),

    score: document.getElementById("score"),
    best: document.getElementById("best"),
    stats: document.getElementById("stats"),
    level: document.getElementById("level"),
    time: document.getElementById("time"),
    combo: document.getElementById("combo"),
    hint: document.getElementById("hint"),
    alignmentHint: document.getElementById("alignmentHint"),
    boardSize: document.getElementById("boardSize"),
    worldSelect: document.getElementById("worldSelect"),
    timedDuration: document.getElementById("timedDuration"),
    timedOptionsGroup: document.getElementById("timedOptionsGroup"),
  };

  if (!el.canvas) return;
  const ctx = el.canvas.getContext("2d", { alpha: false });

  const STORAGE_KEY = "cryptoSnakeBest_v58";
  const RANKING_KEY = "cs_rankings_v1";
  const LS = {
    sfxVol: "cs_sfxVol",
    musicVol: "cs_musicVol",
    bgData: "cs_bgData",
    bgPreset: "cs_bgPreset",
    bgOpacity: "cs_bgOpacity",
    grid: "cs_grid",
    walls: "cs_walls",
    difficulty: "cs_difficulty",
    mode: "cs_mode",
    hint: "cs_hint",
    alignmentHint: "cs_alignmentHint",
    tutorialSeen: "cs_tutorialSeen",
    boardSize: "cs_boardSize",
    timedDuration: "cs_timedDuration",
    progress: "cs_progress_v1",
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
  const WORLD2_BLUE_BONUS = {
    chance: 0.18,
    durationMs: 6500,
    coins: 3,
    cash: 450,
    timedSeconds: 3,
  };
  const XP_PER_COIN = 10;
  const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700];
  const LEVEL_SCALING = {
    incrementAfterDefined: 300,
    growth: 1.18,
  };
  const WORLDS = [
    { id: "bitcoin_city", number: 1, name: "Bitcoin City", image: null, music: null, unlockLevel: 1 },
    { id: "ethereum_network", number: 2, name: "Ethereum Network", image: null, music: null, unlockLevel: 5 },
    { id: "solana_speed", number: 3, name: "Solana Speed", image: null, music: null, unlockLevel: 10 },
    { id: "doge_moon", number: 4, name: "Doge Moon", image: null, music: null, unlockLevel: 15 },
    { id: "cardano_labs", number: 5, name: "Cardano Labs", image: null, music: null, unlockLevel: 20 },
  ];

  const BACKGROUND_LIBRARY = {
    alien1: "assets/backgrounds/alien1.png",
    allien2: "assets/backgrounds/allien2.png",
    bitimage: "assets/backgrounds/bitimage.jpg",
    bitimage1: "assets/backgrounds/bitimage1.jpg",
    image: "assets/backgrounds/image.png",
    image1: "assets/backgrounds/image1.png",
    image2: "assets/backgrounds/image2.png",
    image3: "assets/backgrounds/image3.png",
    images: "assets/backgrounds/images.jpeg",
  };

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
  let gameElapsedMs = 0;

  let combo = 0;
  let comboMult = 1.0;
  let lastEatAt = 0;
  let lastGain = 0;

  let particles = [];
  let floatingTexts = [];
  let lastFrameTs = 0;
  let eatAnimUntil = 0;

  let wallsOn = false;

  let snake = [];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = { x: 10, y: 10 };
  let blueBonusUntil = 0;
  let pendingRankEntry = null;
  let tutorialActive = false;
  let tutorialCoins = 0;
  let tutorialIntroShown = false;
  let tutorialDirectionPending = false;
  let tutorialFirstCoinShown = false;
  let tutorialCoinMessageDone = false;
  let tutorialDirectionShown = false;
  let tutorialFinalShown = false;
  let tutorialMessageTimer = null;
  let tutorialStartTimer = null;

  let score = 0;
  let cashValue = 0;
  let level = 1;
  let lastLevelForSound = 1;

  let bitcoinUntil = 0;
  let ethereumUntil = 0;
  let solanaUntil = 0;

  const BITCOIN_MS = 5500;
  const ETHEREUM_MS = 6000;
  const SOLANA_MS = 4500;
  let best = Number(localStorage.getItem(STORAGE_KEY) || 0);
  el.best && (el.best.textContent = "$0");

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
    const key = el.boardSize?.value || "medium";
    return key === "small" ? "small" : key === "large" ? "large" : "medium";
  }

  function isWorld2() {
    return currentWorldKey() === "medium";
  }

  function worldForMode(mode) {
    if (mode === "classic") return "small";
    if (mode === "timed") return "medium";
    if (mode === "survival") return "large";
    return "small";
  }

  function syncWorldToMode() {
    const world = worldForMode(currentModeKey());
    if (el.boardSize) el.boardSize.value = world;
    localStorage.setItem(LS.boardSize, world);
    return world;
  }

  function timeAttackDurationForWorld(world) {
    const selectedTimed = Number(el.timedDuration?.value || 20);
    const autoTimed = world === "small" ? 20 : world === "large" ? 30 : 25;
    return selectedTimed === 20 ? autoTimed : selectedTimed;
  }

  function applyModeExperience() {
    const world = syncWorldToMode();
    syncModeOptionsVisibility();
    if (state === State.MENU) {
      gameElapsedMs = 0;
      timeLeft = currentModeKey() === "timed" ? timeAttackDurationForWorld(world) : 0;
      lastSecondTs = 0;
    }
    resizeCanvas();
    syncHud();
    drawBackground();
  }

  const SaveManager = {
    defaultProgress() {
      return {
        xp_total: 0,
        nivel: 1,
        moedas_recolhidas: 0,
        jogos_jogados: 0,
        melhor_score: 0,
        tempo_total_jogado: 0,
        achievements_desbloqueados: 0,
      };
    },

    normalizeProgress(data) {
      const base = this.defaultProgress();
      const source = data && typeof data === "object" ? data : {};
      const progress = {
        xp_total: Math.max(0, Math.floor(Number(source.xp_total ?? base.xp_total) || 0)),
        nivel: Math.max(1, Math.floor(Number(source.nivel ?? base.nivel) || 1)),
        moedas_recolhidas: Math.max(0, Math.floor(Number(source.moedas_recolhidas ?? base.moedas_recolhidas) || 0)),
        jogos_jogados: Math.max(0, Math.floor(Number(source.jogos_jogados ?? base.jogos_jogados) || 0)),
        melhor_score: Math.max(0, Math.floor(Number(source.melhor_score ?? base.melhor_score) || 0)),
        tempo_total_jogado: Math.max(0, Math.floor(Number(source.tempo_total_jogado ?? base.tempo_total_jogado) || 0)),
        achievements_desbloqueados: Math.max(0, Math.floor(Number(source.achievements_desbloqueados ?? base.achievements_desbloqueados) || 0)),
      };

      progress.nivel = ProgressManager.calculateLevel(progress.xp_total);
      return progress;
    },

    loadProgress() {
      try {
        return this.normalizeProgress(JSON.parse(localStorage.getItem(LS.progress) || "null"));
      } catch {
        return this.defaultProgress();
      }
    },

    saveProgress(progress) {
      const normalized = this.normalizeProgress(progress);
      localStorage.setItem(LS.progress, JSON.stringify(normalized));
      return normalized;
    },
  };

  const WorldManager = {
    worlds: WORLDS,

    isUnlocked(world, currentLevel) {
      return Number(currentLevel || 1) >= Number(world?.unlockLevel || 1);
    },

    unlockedWorlds(currentLevel) {
      return this.worlds.filter((world) => this.isUnlocked(world, currentLevel));
    },

    nextLockedWorld(currentLevel) {
      return this.worlds.find((world) => !this.isUnlocked(world, currentLevel)) || null;
    },
  };

  const ProgressManager = {
    state: null,

    xpForLevel(targetLevel) {
      const nextLevel = Math.max(1, Math.floor(Number(targetLevel) || 1));
      if (nextLevel <= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[nextLevel - 1];

      let xp = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
      let increment = LEVEL_SCALING.incrementAfterDefined;
      for (let levelIndex = LEVEL_THRESHOLDS.length + 1; levelIndex <= nextLevel; levelIndex += 1) {
        xp += Math.round(increment);
        increment *= LEVEL_SCALING.growth;
      }
      return xp;
    },

    calculateLevel(totalXp) {
      const xp = Math.max(0, Math.floor(Number(totalXp) || 0));
      let calculatedLevel = 1;
      while (xp >= this.xpForLevel(calculatedLevel + 1)) {
        calculatedLevel += 1;
      }
      return calculatedLevel;
    },

    nextLevelXp(currentLevel) {
      return this.xpForLevel(Math.max(1, Number(currentLevel) || 1) + 1);
    },

    load() {
      this.state = SaveManager.loadProgress();
      return this.state;
    },

    save() {
      this.state = SaveManager.saveProgress(this.state || SaveManager.defaultProgress());
      return this.state;
    },

    addCoins(coins) {
      const amount = Math.max(0, Math.floor(Number(coins) || 0));
      if (!amount) return;

      if (!this.state) this.load();
      const previousLevel = this.state.nivel;
      this.state.xp_total += amount * XP_PER_COIN;
      this.state.moedas_recolhidas += amount;
      this.state.nivel = this.calculateLevel(this.state.xp_total);
      this.save();
      syncProgressUI();

      if (this.state.nivel > previousLevel) {
        showLevelUp(this.state.nivel);
      }
    },

    recordGame(finalScore, elapsedMs) {
      if (!this.state) this.load();
      this.state.jogos_jogados += 1;
      this.state.melhor_score = Math.max(this.state.melhor_score, Math.max(0, Math.floor(Number(finalScore) || 0)));
      this.state.tempo_total_jogado += Math.max(0, Math.round((Number(elapsedMs) || 0) / 1000));
      this.state.nivel = this.calculateLevel(this.state.xp_total);
      this.save();
      syncProgressUI();
    },
  };

  const ProfileScreen = {
    formatTime(totalSeconds) {
      const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const rest = seconds % 60;
      if (hours) return `${hours}h ${minutes}m`;
      if (minutes) return `${minutes}m ${rest}s`;
      return `${rest}s`;
    },

    render() {
      if (!el.profileContent) return;
      if (!ProgressManager.state) ProgressManager.load();

      const progress = ProgressManager.state;
      const levelStartXp = ProgressManager.xpForLevel(progress.nivel);
      const nextLevelXp = ProgressManager.nextLevelXp(progress.nivel);
      const unlockedWorlds = WorldManager.unlockedWorlds(progress.nivel).length;

      el.profileContent.innerHTML = `
        <section class="profile-summary">
          <div class="profile-level">Level ${progress.nivel}</div>
          <div class="profile-xp">XP ${progress.xp_total} / ${nextLevelXp}</div>
          <div class="profile-xp-track" aria-hidden="true">
            <span style="width:${Math.round(Math.max(0, Math.min(1, (progress.xp_total - levelStartXp) / Math.max(1, nextLevelXp - levelStartXp))) * 100)}%"></span>
          </div>
        </section>
        <section class="profile-stats">
          <div><span>Total Coins Collected</span><strong>${progress.moedas_recolhidas}</strong></div>
          <div><span>Games Played</span><strong>${progress.jogos_jogados}</strong></div>
          <div><span>Best Score</span><strong>${progress.melhor_score}</strong></div>
          <div><span>Total Play Time</span><strong>${this.formatTime(progress.tempo_total_jogado)}</strong></div>
          <div><span>Achievements Unlocked</span><strong>${progress.achievements_desbloqueados}</strong></div>
          <div><span>Worlds Unlocked</span><strong>${unlockedWorlds}/${WORLDS.length}</strong></div>
        </section>
      `;
    },

    show() {
      closeMenuScreens();
      this.render();
      el.profilePanel?.classList.remove("hidden");
    },

    hide() {
      el.profilePanel?.classList.add("hidden");
    },
  };

  const WorldScreen = {
    render() {
      if (!el.worldsList) return;
      if (!ProgressManager.state) ProgressManager.load();

      const currentLevel = ProgressManager.state.nivel;
      el.worldsList.innerHTML = WORLDS.map((world) => {
        const unlocked = WorldManager.isUnlocked(world, currentLevel);
        return `
          <article class="world-entry ${unlocked ? "unlocked" : "locked"}">
            <div class="world-entry-art" aria-hidden="true">${world.number}</div>
            <div class="world-entry-body">
              <strong>${world.name}</strong>
              <span>${unlocked ? "Unlocked" : `Unlocks at Level ${world.unlockLevel}`}</span>
              <small>Image: ${world.image || "not set"} · Music: ${world.music || "not set"}</small>
            </div>
            <div class="world-entry-status">${unlocked ? "OPEN" : "LOCKED"}</div>
          </article>
        `;
      }).join("");
    },

    show() {
      closeMenuScreens();
      this.render();
      el.worldsPanel?.classList.remove("hidden");
    },

    hide() {
      el.worldsPanel?.classList.add("hidden");
    },
  };

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
    const mode = currentModeKey();
    const nextMode = mode === "classic" ? "timed" : mode === "timed" ? "survival" : "classic";
    if (el.mode) el.mode.value = nextMode;
    localStorage.setItem(LS.mode, nextMode);
    const applied = syncWorldToMode();
    syncModeOptionsVisibility();
    resizeCanvas();
    syncHud();
    drawBackground();
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
  let menuBgImg = null;

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


  function loadMenuBackground() {
    const img = new Image();
    img.onload = () => {
      menuBgImg = img;
      if (state === State.MENU) drawBackground();
    };
    img.src = "assets/menu/fundo_snake_melhorado.png";
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
      if (el.bgPreset) el.bgPreset.value = "none";
      localStorage.removeItem(LS.bgPreset);
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

  function applyBuiltInBackground(presetKey) {
    if (!presetKey || presetKey === "none") {
      if (el.bgPreset) el.bgPreset.value = "none";
      localStorage.removeItem(LS.bgPreset);
      localStorage.removeItem(LS.bgData);
      bgImg = null;
      draw();
      return;
    }

    const src = BACKGROUND_LIBRARY[presetKey];
    if (!src) return;

    const img = new Image();
    img.onload = () => {
      bgImg = img;
      if (el.bgPreset) el.bgPreset.value = presetKey;
      localStorage.setItem(LS.bgPreset, presetKey);
      localStorage.removeItem(LS.bgData);
      draw();
    };
    img.src = src;
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

  function nowMs() {
    return performance.now();
  }

  function isBitcoinActive() {
    return nowMs() < bitcoinUntil;
  }

  function isEthereumActive() {
    return nowMs() < ethereumUntil;
  }

  function isSolanaActive() {
    return nowMs() < solanaUntil;
  }

  function currentActivePower() {
    if (isBitcoinActive()) return "bitcoin";
    if (isEthereumActive()) return "ethereum";
    if (isSolanaActive()) return "solana";
    return null;
  }

  function getPowerTheme(power) {
    if (power === "bitcoin") {
      return {
        color: "rgba(255,200,60,0.95)",
        glow: "rgba(255,180,40,0.45)",
        ring: "rgba(255,225,120,0.85)",
      };
    }
    if (power === "ethereum") {
      return {
        color: "rgba(120,220,255,0.95)",
        glow: "rgba(70,160,255,0.40)",
        ring: "rgba(180,240,255,0.82)",
      };
    }
    if (power === "solana") {
      return {
        color: "rgba(180,120,255,0.95)",
        glow: "rgba(150,90,255,0.40)",
        ring: "rgba(225,190,255,0.82)",
      };
    }
    return {
      color: "rgba(57,255,221,0.95)",
      glow: "rgba(57,255,221,0.20)",
      ring: "rgba(180,255,245,0.70)",
    };
  }

  function getWorldSnakePalette() {
    const world = typeof currentWorldKey === "function" ? currentWorldKey() : "medium";

    if (world === "small") {
      return {
        head: "#ffd089",
        body: "#ffb347",
        tail: "#c97a1f",
        shadow: "rgba(255,180,60,0.30)",
      };
    }

    if (world === "large") {
      return {
        head: "#ddb0ff",
        body: "#a855f7",
        tail: "#6d28d9",
        shadow: "rgba(170,90,255,0.30)",
      };
    }

    return {
      head: "#8ee7ff",
      body: "#38bdf8",
      tail: "#0f6fa8",
      shadow: "rgba(70,170,255,0.30)",
    };
  }

  function visualDir() {
    if (dir?.x || dir?.y) return dir;
    return { x: 1, y: 0 };
  }

  function mouthOpenAmount() {
    const remain = eatAnimUntil - nowMs();
    if (remain <= 0) return 0;
    const t = Math.max(0, Math.min(1, remain / 180));
    return 0.18 + (0.42 * t);
  }

  function activatePower(power) {
    const now = nowMs();
    if (power === "bitcoin") {
      bitcoinUntil = now + BITCOIN_MS;
    } else if (power === "ethereum") {
      ethereumUntil = now + ETHEREUM_MS;
    } else if (power === "solana") {
      solanaUntil = now + SOLANA_MS;
    }
  }

  function resetCombo() {
    combo = 0;
    comboMult = 1.0;
    lastEatAt = 0;
    lastGain = 0;
    bitcoinUntil = 0;
    ethereumUntil = 0;
    solanaUntil = 0;
    eatAnimUntil = 0;
    floatingTexts = [];
  }

  function registerEat(baseCoins = 1, baseCash = 100) {
    const now = nowMs();
    if (lastEatAt && (now - lastEatAt) <= COMBO_WINDOW_MS) combo += 1;
    else combo = 1;

    lastEatAt = now;
    comboMult = 1.0;

    score += baseCoins;
    const cashMult = isEthereumActive() ? 2 : 1;
    lastGain = Math.round(baseCash * cashMult);
    cashValue += lastGain;
    ProgressManager.addCoins(baseCoins);
  }

  function hintOn() {
    return (el.alignmentHint?.value || "on") === "on";
  }

  function syncHintButton() {
    if (!el.btnHint) return;
    const active = hintOn();
    el.btnHint.textContent = active ? "Hint ON" : "Hint OFF";
    el.btnHint.classList.toggle("active", active);
  }

  function setAlignmentHint(value) {
    const next = value === "off" ? "off" : "on";
    if (el.alignmentHint) el.alignmentHint.value = next;
    localStorage.setItem(LS.alignmentHint, next);
    syncHintButton();
    draw();
  }

  function toggleAlignmentHint() {
    setAlignmentHint(hintOn() ? "off" : "on");
  }

  function tutorialEnabled() {
    return (el.hint?.value || "on") === "on";
  }

  function tutorialSeen() {
    return localStorage.getItem(LS.tutorialSeen) === "true";
  }

  function shouldRunTutorial() {
    return tutorialEnabled();
  }

  function clearTutorialTimers() {
    if (tutorialMessageTimer) clearTimeout(tutorialMessageTimer);
    if (tutorialStartTimer) clearTimeout(tutorialStartTimer);
    tutorialMessageTimer = null;
    tutorialStartTimer = null;
  }

  function hideTutorialMessage() {
    if (!el.tutorialCard) return;
    el.tutorialCard.classList.remove("show");
    setTimeout(() => {
      if (!el.tutorialCard?.classList.contains("show")) {
        el.tutorialCard?.classList.add("hidden");
      }
    }, 240);
  }

  function showTutorialMessage(text, durationMs = 3600, showKeys = false, onDone = null) {
    if (!el.tutorialCard || !el.tutorialText) return;
    if (tutorialMessageTimer) clearTimeout(tutorialMessageTimer);

    el.tutorialText.textContent = text;
    el.tutorialCard.classList.remove("hidden");
    el.tutorialCard.classList.remove("show");
    void el.tutorialCard.offsetWidth;
    requestAnimationFrame(() => el.tutorialCard?.classList.add("show"));

    if (durationMs > 0) {
      tutorialMessageTimer = setTimeout(() => {
        hideTutorialMessage();
        tutorialMessageTimer = null;
        if (typeof onDone === "function") onDone();
      }, durationMs);
    }
  }

  function resetTutorialProgress() {
    tutorialCoins = 0;
    tutorialIntroShown = false;
    tutorialDirectionPending = false;
    tutorialFirstCoinShown = false;
    tutorialCoinMessageDone = false;
    tutorialDirectionShown = false;
    tutorialFinalShown = false;
  }

  function startTutorial() {
    clearTutorialTimers();
    resetTutorialProgress();
    hideTutorialMessage();
    tutorialActive = shouldRunTutorial();
    if (!tutorialActive) return;

    tutorialStartTimer = setTimeout(() => {
      tutorialStartTimer = null;
      if (!tutorialActive || state !== State.RUNNING) return;
      tutorialIntroShown = true;
      showTutorialMessage("Move a cobra para apanhar moedas.", 0);
    }, 300);
  }

  function stopTutorial(complete = false) {
    clearTutorialTimers();
    hideTutorialMessage();
    if (complete) localStorage.setItem(LS.tutorialSeen, "true");
    tutorialActive = false;
  }

  function onTutorialCoin() {
    if (!tutorialActive || state !== State.RUNNING) return;

    tutorialCoins += 1;
    if (tutorialCoins === 1 && !tutorialFirstCoinShown) {
      tutorialFirstCoinShown = true;
      tutorialCoinMessageDone = true;
      showTutorialMessage("Cada moeda aumenta a tua pontuação.", 0);
      return;
    }

    if (tutorialCoins === 2 && !tutorialDirectionShown) {
      showTutorialDirectionMessage();
      return;
    }

    if (tutorialCoins >= 3 && !tutorialFinalShown) {
      tutorialFinalShown = true;
      showTutorialMessage("Está pronto. Boa sorte.", 2600, false, () => stopTutorial(true));
    }
  }

  function showTutorialDirectionMessage() {
    if (!tutorialActive || state !== State.RUNNING || tutorialDirectionShown) return;
    tutorialDirectionPending = false;
    tutorialDirectionShown = true;
    showTutorialMessage("Evita paredes e o próprio corpo.", 0);
  }

  function onTutorialDirectionChange() {
    if (!tutorialActive || state !== State.RUNNING || tutorialDirectionShown) return;
    tutorialDirectionPending = true;
  }

  function emitCoinBurst(gridX, gridY, kind = "normal", power = null) {
    const cx = ox + gridX * cell + cell / 2;
    const cy = oy + gridY * cell + cell / 2;
    const count = kind === "special" ? 16 : 10;
    const pTheme = getPowerTheme(power);

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
          ? (power === "bitcoin" ? [255, 200, 60] : power === "ethereum" ? [120, 220, 255] : power === "solana" ? [180, 120, 255] : [255, 215, 0])
          : [125, 249, 255],
        glow: kind === "special" ? pTheme.glow : "rgba(125, 249, 255, 0.35)",
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
      ctx.shadowBlur = Math.max(4, p.size * 2.4);
      ctx.shadowColor = p.glow || `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function emitFloatingText(gridX, gridY, text, color = "rgba(255,255,255,0.96)") {
    floatingTexts.push({
      x: ox + gridX * cell + cell / 2,
      y: oy + gridY * cell + cell / 2,
      text,
      color,
      life: 1.15,
      maxLife: 1.15,
      vy: -16,
      blink: true,
    });
  }

  function updateFloatingTexts(dtSec) {
    if (!floatingTexts.length) return;
    for (const t of floatingTexts) {
      t.y += t.vy * dtSec;
      t.life -= dtSec;
    }
    floatingTexts = floatingTexts.filter(t => t.life > 0);
  }

  function drawFloatingTexts() {
    if (!floatingTexts.length) return;

    for (const t of floatingTexts) {
      let alpha = Math.max(0, t.life / t.maxLife);

      if (t.blink) {
        const elapsed = t.maxLife - t.life;
        if (elapsed < 0.54) {
          const blinkPhase = Math.sin(elapsed * 34);
          alpha *= blinkPhase > 0 ? 1 : 0.15;
        }
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `900 ${Math.max(22, Math.floor(cell * 0.82))}px Arial`;
      ctx.lineWidth = Math.max(2, Math.floor(cell * 0.07));
      ctx.strokeStyle = "rgba(5,8,18,0.72)";
      ctx.fillStyle = t.color;
      ctx.shadowBlur = 18;
      ctx.shadowColor = t.color;
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);
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


  function currentModeKey() {
    return el.mode?.value || "classic";
  }

  function getRankings() {
    try {
      const raw = localStorage.getItem(RANKING_KEY);
      const data = raw ? JSON.parse(raw) : {};
      return {
        classic: Array.isArray(data.classic) ? data.classic : [],
        timed: Array.isArray(data.timed) ? data.timed : [],
        survival: Array.isArray(data.survival) ? data.survival : [],
      };
    } catch {
      return { classic: [], timed: [], survival: [] };
    }
  }

  function saveRankings(data) {
    localStorage.setItem(RANKING_KEY, JSON.stringify(data));
  }

  function compareRankingEntries(a, b) {
    if (a.mode === "survival" && b.mode === "survival") {
      if ((b.timeSeconds || 0) !== (a.timeSeconds || 0)) return (b.timeSeconds || 0) - (a.timeSeconds || 0);
      if ((b.coins || 0) !== (a.coins || 0)) return (b.coins || 0) - (a.coins || 0);
      return (b.cash || 0) - (a.cash || 0);
    }
    if ((b.coins || 0) !== (a.coins || 0)) return (b.coins || 0) - (a.coins || 0);
    if ((b.cash || 0) !== (a.cash || 0)) return (b.cash || 0) - (a.cash || 0);
    return (b.timeSeconds || 0) - (a.timeSeconds || 0);
  }

  function formatRankingEntry(entry, index) {
    const pos = index === 0 ? "1º" : index === 1 ? "2º" : "3º";
    const world = entry.world === "small" ? "W1" : entry.world === "large" ? "W3" : "W2";
    const metric = entry.mode === "survival"
      ? `${entry.timeSeconds.toFixed(1)}s`
      : `${entry.coins}`;
    const extra = entry.mode === "survival"
      ? `${entry.coins}`
      : `${entry.timeSeconds.toFixed(1)}s`;

    return `
      <div class="ranking-row rank-${index + 1}">
        <div class="rank-pos">${pos}</div>
        <div class="rank-name">${entry.name}</div>
        <div class="rank-metric">${metric}</div>
        <div class="rank-extra">${extra}</div>
        <div class="rank-world">${world}</div>
      </div>
    `;
  }

  function renderRankingList(mode) {
    if (!el.rankingList) return;
    const list = getRankings()[mode] || [];

    const primaryLabel = mode === "survival" ? "Tempo" : "Moedas";
    const secondaryLabel = mode === "survival" ? "Moedas" : "Tempo";

    const header = `
      <div class="ranking-head">
        <div class="rank-pos">#</div>
        <div class="rank-name">Nome</div>
        <div class="rank-metric">${primaryLabel}</div>
        <div class="rank-extra">${secondaryLabel}</div>
        <div class="rank-world">Mundo</div>
      </div>
    `;

    if (!list.length) {
      el.rankingList.innerHTML = `${header}<div class="ranking-item empty">Sem registos ainda.</div>`;
      return;
    }

    el.rankingList.innerHTML = header + list.map((entry, i) => formatRankingEntry(entry, i)).join("");
  }

  function evaluateRankingEntry() {
    const mode = currentModeKey();
    const rankings = getRankings();
    const list = rankings[mode] || [];

    const entry = {
      name: "PLAYER",
      mode,
      world: currentWorldKey(),
      coins: score,
      cash: cashValue,
      timeSeconds: Number((gameElapsedMs / 1000).toFixed(1)),
      createdAt: Date.now(),
    };

    const merged = [...list, entry].sort(compareRankingEntries).slice(0, 3);
    const qualifies = merged.some(e => e.createdAt === entry.createdAt);
    return { mode, rankings, list, entry, qualifies };
  }

  function savePendingRanking(name) {
    if (!pendingRankEntry) return false;
    const { mode, rankings, list, entry } = pendingRankEntry;
    entry.name = (name || "PLAYER").trim().slice(0, 12) || "PLAYER";
    rankings[mode] = [...list, entry].sort(compareRankingEntries).slice(0, 3);
    saveRankings(rankings);
    pendingRankEntry = null;
    return true;
  }

  function configureOverlayForPause() {
    el.btnOverlayReset && el.btnOverlayReset.classList.remove("hidden");
    el.btnOverlayReset && (el.btnOverlayReset.textContent = "Reset");
    el.btnOverlayWorlds && el.btnOverlayWorlds.classList.add("hidden");
    el.btnOverlayMenu && el.btnOverlayMenu.classList.remove("hidden");
    el.btnOverlayMenu && (el.btnOverlayMenu.textContent = "Menu");
    el.overlayRanking && el.overlayRanking.classList.add("hidden");
    el.rankingNameWrap && el.rankingNameWrap.classList.add("hidden");
  }

  function configureOverlayForGameOver(qualifies, mode) {
    el.btnOverlayReset && el.btnOverlayReset.classList.remove("hidden");
    el.btnOverlayReset && (el.btnOverlayReset.textContent = "Try Again");
    el.btnOverlayWorlds && el.btnOverlayWorlds.classList.remove("hidden");
    el.btnOverlayWorlds && (el.btnOverlayWorlds.textContent = "Worlds");
    el.btnOverlayMenu && el.btnOverlayMenu.classList.remove("hidden");
    el.btnOverlayMenu && (el.btnOverlayMenu.textContent = "Menu");

    if (qualifies) {
      el.overlayRanking && el.overlayRanking.classList.add("hidden");
      el.rankingNameWrap && el.rankingNameWrap.classList.remove("hidden");
      if (el.rankingNameInput) {
        el.rankingNameInput.value = "";
        setTimeout(() => el.rankingNameInput?.focus(), 40);
      }
    } else {
      el.rankingNameWrap && el.rankingNameWrap.classList.add("hidden");
      el.overlayRanking && el.overlayRanking.classList.remove("hidden");
      renderRankingList(mode);
    }
  }

  // ---------- UI ----------
  function showMenu(show) {
    el.menu?.classList.toggle("hidden", !show);
    el.topbar?.classList.toggle("menu-hidden", !!show);
    document.body.classList.toggle("game-active", !show);
  }

  function syncProgressUI() {
    if (!el.profilePanel?.classList.contains("hidden")) ProfileScreen.render();
    if (!el.worldsPanel?.classList.contains("hidden")) WorldScreen.render();
  }

  function closeMenuScreens() {
    el.profilePanel?.classList.add("hidden");
    el.worldsPanel?.classList.add("hidden");
    showOptions(false);
  }

  let levelUpToastTimer = null;

  function showLevelUp(nextLevel) {
    if (!el.levelUpToast) return;

    el.levelUpText && (el.levelUpText.textContent = `LEVEL ${nextLevel}`);
    el.levelUpToast.classList.remove("hidden");
    el.levelUpToast.classList.remove("show");
    void el.levelUpToast.offsetWidth;
    el.levelUpToast.classList.add("show");
    playSfx(sfx.level);

    clearTimeout(levelUpToastTimer);
    levelUpToastTimer = setTimeout(() => {
      el.levelUpToast?.classList.remove("show");
      setTimeout(() => el.levelUpToast?.classList.add("hidden"), 260);
    }, 1600);
  }

  function showOptions(show) {
    if (show) {
      ProfileScreen.hide();
      WorldScreen.hide();
    }
    el.optionsPanel?.classList.toggle("hidden", !show);
  }

  function showRankingFromMenu() {
    closeMenuScreens();
    pendingRankEntry = null;
    el.rankingNameWrap?.classList.add("hidden");
    el.overlayRanking?.classList.remove("hidden");
    el.btnOverlayReset?.classList.add("hidden");
    el.btnOverlayWorlds?.classList.add("hidden");
    el.btnOverlayMenu?.classList.remove("hidden");
    el.btnOverlayMenu && (el.btnOverlayMenu.textContent = "Back");
    renderRankingList(currentModeKey());
    showOverlay(true, "Ranking", "Current mode records.");
  }

  function exitGame() {
    window.close();
  }

  function syncModeOptionsVisibility() {
    const isTimed = (el.mode?.value || "classic") === "timed";
    el.timedOptionsGroup?.classList.toggle("hidden", !isTimed);
  }

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
    const worldName = world === "small" ? "Neon Amber" : world === "large" ? "Neon Violet" : "Neon Blue";

    const theme = world === "small"
      ? {
          accent: "#ffcf86",
          glow: "rgba(255,170,60,0.28)",
          border: "rgba(255,190,90,0.34)",
          font: "Trebuchet MS, Arial, sans-serif",
        }
      : world === "large"
        ? {
            accent: "#ddb0ff",
            glow: "rgba(180,90,255,0.28)",
            border: "rgba(205,130,255,0.34)",
            font: "Verdana, Arial, sans-serif",
          }
        : {
            accent: "#9fddff",
            glow: "rgba(70,140,255,0.28)",
            border: "rgba(105,205,255,0.34)",
            font: "Segoe UI, Arial, sans-serif",
          };

    el.score && (el.score.textContent = String(score));
    el.best && (el.best.textContent = `$${cashValue.toLocaleString("en-US")}`);
    el.level && (el.level.textContent = worldName);

    if (el.time) {
      if (el.mode?.value === "timed") el.time.textContent = `${Math.max(0, timeLeft)}s`;
      else el.time.textContent = `${(gameElapsedMs / 1000).toFixed(1)}s`;
    }

    if (el.combo) {
      const parts = [];
      if (isBitcoinActive()) parts.push(`₿ Bitcoin ${((bitcoinUntil - nowMs()) / 1000).toFixed(1)}s`);
      if (isEthereumActive()) parts.push(`Ξ Ethereum ${((ethereumUntil - nowMs()) / 1000).toFixed(1)}s`);
      if (isSolanaActive()) parts.push(`◎ Solana ${((solanaUntil - nowMs()) / 1000).toFixed(1)}s`);
      el.combo.textContent = parts.length ? parts.join(" | ") : "--";

      const active = currentActivePower();
      const pTheme = getPowerTheme(active);
      el.combo.style.color = parts.length ? pTheme.color : "";
      el.combo.style.textShadow = parts.length ? `0 0 10px ${pTheme.glow}` : "";
      el.combo.style.fontWeight = parts.length ? "700" : "";

      const powerPill = el.combo.parentElement;
      if (powerPill) powerPill.classList.toggle("power-active", parts.length > 0);
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
    const world = currentWorldKey();

    for (let tries = 0; tries < 5000; tries++) {
      const x = Math.floor(Math.random() * gridCols);
      const y = Math.floor(Math.random() * gridRows);
      const blocked = snake.some(p => p.x === x && p.y === y);
      if (!blocked) {
        const canSpawnBlueBonus = isWorld2() && Math.random() < WORLD2_BLUE_BONUS.chance;
        const isSpecial = !canSpawnBlueBonus && Math.random() < 0.12;

        let power = null;
        if (isSpecial) {
          const roll = Math.random();
          power = roll < 0.34 ? "bitcoin" : roll < 0.67 ? "ethereum" : "solana";
        }

        food = {
          x, y,
          type: canSpawnBlueBonus ? "blue_bonus" : (isSpecial ? "special" : "normal"),
          power,
          spriteIndex: (canSpawnBlueBonus || isSpecial) ? -1 : Math.floor(Math.random() * NORMAL_COIN_FILES.length)
        };

        blueBonusUntil = canSpawnBlueBonus ? nowMs() + WORLD2_BLUE_BONUS.durationMs : 0;
        return;
      }
    }

    food = { x: 1, y: 1, type: "normal", power: null, spriteIndex: 0 };
    blueBonusUntil = 0;
  }

  function initGameFromMenu() {
    const diff = DIFFICULTY[el.difficulty?.value] || DIFFICULTY.normal;
    tickMs = diff.tickMs;
    gridSize = currentGridSize();

    score = 0;
    gameElapsedMs = 0;
    speedMult = 1.0;
    blueBonusUntil = 0;
    resetCombo();
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };

    wallsOn = (el.walls?.value === "on");
    if (el.mode?.value === "timed") wallsOn = false;
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
      const world = currentWorldKey();
      timeAttackDuration = timeAttackDurationForWorld(world);
      timeLeft = timeAttackDuration;
      lastSecondTs = 0;
    } else {
      timeLeft = 0;
      lastSecondTs = 0;
    }

    spawnFood();
    lastTs = 0;
    accMs = 0;
    touchDirectionQueue = [];
    lastTouchDirectionAt = 0;
    syncHud();
  }

  function setNextDir(x, y) {
    if (x === -dir.x && y === -dir.y) return;
    const changed = x !== dir.x || y !== dir.y;
    nextDir = { x, y };
    if (changed) onTutorialDirectionChange();
  }

  // Swipe: 1 viragem por tick
  let activeTouchId = null;
  let swipeX = null;
  let swipeY = null;
  let touchDirectionQueue = [];
  let lastTouchDirectionAt = 0;
  const TOUCH_MIN_SWIPE_DISTANCE = 24;
  const TOUCH_DIRECTION_COOLDOWN_MS = 100;
  const TOUCH_AXIS_DOMINANCE_RATIO = 1.25;
  const TOUCH_MAX_QUEUED_DIRECTIONS = 2;

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

  function sameDirection(a, b) {
    return !!a && !!b && a.x === b.x && a.y === b.y;
  }

  function oppositeDirection(a, b) {
    return !!a && !!b && a.x === -b.x && a.y === -b.y;
  }

  function lastQueuedTouchDirection() {
    return touchDirectionQueue.length ? touchDirectionQueue[touchDirectionQueue.length - 1] : null;
  }

  function enqueueTouchDirection(x, y) {
    const queuedDir = { x, y };
    const lastQueued = lastQueuedTouchDirection();
    const referenceDir = lastQueued || nextDir || dir;
    const now = nowMs();

    if (touchDirectionQueue.length >= TOUCH_MAX_QUEUED_DIRECTIONS) return false;
    if (sameDirection(queuedDir, referenceDir)) return false;
    if (oppositeDirection(queuedDir, referenceDir)) return false;
    if (!lastQueued && oppositeDirection(queuedDir, dir)) return false;
    if (now - lastTouchDirectionAt < TOUCH_DIRECTION_COOLDOWN_MS) return false;

    touchDirectionQueue.push(queuedDir);
    lastTouchDirectionAt = now;
    onTutorialDirectionChange();
    return true;
  }

  function consumeTouchDirectionQueue() {
    if (!touchDirectionQueue.length) return;
    const queuedDir = touchDirectionQueue.shift();
    if (oppositeDirection(queuedDir, dir)) return;
    nextDir = queuedDir;
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
    lastTouchDirectionAt = 0;
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

    if (ax < TOUCH_MIN_SWIPE_DISTANCE && ay < TOUCH_MIN_SWIPE_DISTANCE) {
      e.preventDefault();
      return;
    }

    let accepted = false;
    if (ax > ay * TOUCH_AXIS_DOMINANCE_RATIO) {
      accepted = enqueueTouchDirection(dx > 0 ? 1 : -1, 0);
    } else if (ay > ax * TOUCH_AXIS_DOMINANCE_RATIO) {
      accepted = enqueueTouchDirection(0, dy > 0 ? 1 : -1);
    }

    if (accepted) {
      swipeX = x;
      swipeY = y;
    }
    e.preventDefault();
  }

  function onTouchEnd(e) {
    if (isUiTarget(e)) return;
    if (state !== State.RUNNING) return;
    const still = findActiveTouch(e.touches);
    if (!still) {
      activeTouchId = null;
      swipeX = null;
      swipeY = null;
      lastTouchDirectionAt = 0;
    }
    e.preventDefault();
  }

  document.addEventListener("touchstart", onTouchStart, { passive:false });
  document.addEventListener("touchmove", onTouchMove, { passive:false });
  document.addEventListener("touchend", onTouchEnd, { passive:false });
  document.addEventListener("touchcancel", onTouchEnd, { passive:false });

  function step() {
    consumeTouchDirectionQueue();
    dir = nextDir;

    const head = snake[0];
    const newHead = { x: head.x + dir.x, y: head.y + dir.y };

    if (el.mode?.value === "timed") {
      newHead.x = (newHead.x + gridCols) % gridCols;
      newHead.y = (newHead.y + gridRows) % gridRows;
    } else if (wallsOn) {
      if (!isBitcoinActive() && (newHead.x < 0 || newHead.y < 0 || newHead.x >= gridCols || newHead.y >= gridRows)) {
        gameOver("Bateu na parede.");
        return;
      }
      newHead.x = (newHead.x + gridCols) % gridCols;
      newHead.y = (newHead.y + gridRows) % gridRows;
    } else {
      newHead.x = (newHead.x + gridCols) % gridCols;
      newHead.y = (newHead.y + gridRows) % gridRows;
    }

    if (el.mode?.value !== "timed" && !isBitcoinActive() && snake.some(p => p.x === newHead.x && p.y === newHead.y)) {
      gameOver("Colisão com o corpo.");
      return;
    }

    snake.unshift(newHead);

    if (newHead.x === food.x && newHead.y === food.y) {
      const eatenType = food.type || "normal";
      const eatenPower = food.power || null;

      let cashAward = 100;
      if (eatenType === "special") {
        cashAward = eatenPower === "bitcoin" ? 1000 : eatenPower === "ethereum" ? 800 : 700;
      } else if (eatenType === "blue_bonus") {
        cashAward = WORLD2_BLUE_BONUS.cash;
      }

      registerEat(eatenType === "blue_bonus" ? WORLD2_BLUE_BONUS.coins : 1, cashAward);
      onTutorialCoin();
      playSfx(sfx.eat);
      eatAnimUntil = nowMs() + 180;

      if (eatenType === "special") {
        activatePower(eatenPower);
        playSfx(sfx.level);
      } else if (eatenType === "blue_bonus") {
        emitFloatingText(newHead.x, newHead.y, "+3", "rgba(90,190,255,0.98)");
      }

      if (el.mode?.value === "timed") {
        let timeGain = 1;
        let popupColor = "rgba(255,255,255,0.96)";

        if (eatenType === "special") {
          if (eatenPower === "bitcoin") {
            timeGain = 4;
            popupColor = "rgba(255,200,60,0.98)";
          } else if (eatenPower === "ethereum") {
            timeGain = 2;
            popupColor = "rgba(145,175,210,0.98)";
          } else if (eatenPower === "solana") {
            timeGain = 2;
            popupColor = "rgba(180,120,255,0.98)";
          }
        } else if (eatenType === "blue_bonus") {
          timeGain = WORLD2_BLUE_BONUS.timedSeconds;
          popupColor = "rgba(90,190,255,0.98)";
        } else {
          const idx = Number.isInteger(food.spriteIndex) ? food.spriteIndex : 0;
          if (idx === 0) popupColor = "rgba(145,175,210,0.98)";      // Ethereum
          else if (idx === 1) popupColor = "rgba(180,120,255,0.98)"; // Solana
          else if (idx === 2) popupColor = "rgba(90,170,255,0.98)";  // Cardano
          else if (idx === 3) popupColor = "rgba(255,190,70,0.98)";  // Doge
          else if (idx === 4) popupColor = "rgba(255,200,60,0.98)";  // Bitcoin
        }

        timeLeft += timeGain;
        lastSecondTs = nowMs();
        emitFloatingText(newHead.x, newHead.y, `+${timeGain}s`, popupColor);
      } else {
        emitCoinBurst(newHead.x, newHead.y, eatenType === "blue_bonus" ? "special" : eatenType, eatenPower);
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
    gameElapsedMs += dt;
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

    let effectiveTick = tickMs / speedMult;
    if (isSolanaActive()) effectiveTick *= (1 / 0.70);

    while (accMs >= effectiveTick) {
      accMs -= effectiveTick;
      step();
      if (state !== State.RUNNING) return;
    }

    if (food.type === "blue_bonus" && nowMs() >= blueBonusUntil) {
      spawnFood();
    }

    updateParticles(frameDt);
    updateFloatingTexts(frameDt);
    draw();
    rafId = requestAnimationFrame(loop);
  }

  // ---------- Render ----------
  function drawBackground() {
    const world = typeof currentWorldKey === "function" ? currentWorldKey() : "medium";
    const isMenuScreen = state === State.MENU;
    const bgToUse = isMenuScreen ? menuBgImg : bgImg;

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

    if (bgToUse) {
      const a = isMenuScreen ? 0.95 : bgOpacity();
      if (a > 0) {
        ctx.save();
        ctx.globalAlpha = isMenuScreen ? 0.92 : Math.max(0.12, a * 0.35);
        drawImageCover(bgToUse, 0, 0, cssW, cssH);
        ctx.restore();
      }
    }

    if (!isMenuScreen) {
      if (bgToUse) {
        const a = bgOpacity();
        if (a > 0) {
          ctx.save();
          ctx.globalAlpha = a;
          drawImageCover(bgToUse, ox, oy, boardW, boardH);
          ctx.restore();
        } else {
          ctx.fillStyle = "rgba(7,10,18,0.92)";
          ctx.fillRect(ox, oy, boardW, boardH);
        }
      } else {
        ctx.fillStyle = "rgba(7,10,18,0.92)";
        ctx.fillRect(ox, oy, boardW, boardH);
      }
    }

    const active = currentActivePower();
    if (active) {
      ctx.save();
      ctx.fillStyle = active === "bitcoin"
        ? "rgba(255, 200, 60, 0.08)"
        : active === "ethereum"
          ? "rgba(120, 220, 255, 0.07)"
          : "rgba(180, 120, 255, 0.07)";
      ctx.fillRect(ox, oy, boardW, boardH);
      ctx.restore();
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
    if (!hintOn() || !snake?.length || !food) return;

    const head = snake[0];
    const hx = head.x;
    const hy = head.y;
    const fx = food.x;
    const fy = food.y;

    const aligned = (hx === fx || hy === fy);
    if (!aligned) return;

    const hxPx = ox + hx * cell + cell / 2;
    const hyPx = oy + hy * cell + cell / 2;
    const fxPx = ox + fx * cell + cell / 2;
    const fyPx = oy + fy * cell + cell / 2;
    if (hxPx === fxPx && hyPx === fyPx) return;

    const half = Math.max(4, cell * 0.18);
    const lineWidth = Math.max(2, cell * 0.10);
    const glow = Math.max(10, cell * 0.50);
    const pulse = 0.78 + 0.18 * Math.sin(performance.now() / 120);
    const fillGradient = ctx.createLinearGradient(hxPx, hyPx, fxPx, fyPx);
    const lineGradient = ctx.createLinearGradient(hxPx, hyPx, fxPx, fyPx);

    fillGradient.addColorStop(0, "rgba(0,255,170,0.03)");
    fillGradient.addColorStop(0.45, `rgba(0,255,170,${0.12 * pulse})`);
    fillGradient.addColorStop(1, `rgba(0,255,170,${0.42 * pulse})`);
    lineGradient.addColorStop(0, "rgba(0,255,170,0.08)");
    lineGradient.addColorStop(0.55, `rgba(0,255,170,${0.36 * pulse})`);
    lineGradient.addColorStop(1, `rgba(0,255,170,${0.88 * pulse})`);

    ctx.save();
    ctx.shadowBlur = glow;
    ctx.shadowColor = "rgba(0,255,170,0.48)";
    ctx.fillStyle = fillGradient;
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";

    if (hy === fy) {
      const x = Math.min(hxPx, fxPx);
      const w = Math.abs(fxPx - hxPx);
      ctx.fillRect(x, hyPx - half, w, half * 2);
      ctx.beginPath();
      ctx.moveTo(hxPx, hyPx - half);
      ctx.lineTo(fxPx, fyPx - half);
      ctx.moveTo(hxPx, hyPx + half);
      ctx.lineTo(fxPx, fyPx + half);
      ctx.stroke();
    } else {
      const y = Math.min(hyPx, fyPx);
      const h = Math.abs(fyPx - hyPx);
      ctx.fillRect(hxPx - half, y, half * 2, h);
      ctx.beginPath();
      ctx.moveTo(hxPx - half, hyPx);
      ctx.lineTo(fxPx - half, fyPx);
      ctx.moveTo(hxPx + half, hyPx);
      ctx.lineTo(fxPx + half, fyPx);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFood() {
    const x = ox + food.x * cell;
    const y = oy + food.y * cell;
    const spriteScale = currentSpriteScale();

    let img = null;
    if (food.type === "special") {
      img = coinImages.special;
    } else if (food.type === "blue_bonus") {
      img = coinImages.normal[0] || coinImages.normal[1] || null;
    } else {
      const idx = Number.isInteger(food.spriteIndex) ? food.spriteIndex : 0;
      img = coinImages.normal[idx] || coinImages.normal[0] || null;
    }

    const pTheme = getPowerTheme(food.power);
    const powerSymbol = food.type === "blue_bonus"
      ? `+${WORLD2_BLUE_BONUS.coins}`
      : (food.power === "bitcoin" ? "₿" : food.power === "ethereum" ? "Ξ" : food.power === "solana" ? "◎" : "");

    if (img && img.complete && img.naturalWidth > 0) {
      const pulse = 1 + (food.type === "blue_bonus" ? 0.10 : 0.06) * Math.sin(performance.now() / 180);
      const size = Math.max(8, Math.floor(cell * 0.88 * spriteScale * pulse));
      const dx = x + Math.floor((cell - size) / 2);
      const dy = y + Math.floor((cell - size) / 2);

      ctx.save();
      if (food.type === "special") {
        ctx.shadowBlur = Math.max(12, Math.floor(cell * 0.72 * spriteScale));
        ctx.shadowColor = pTheme.glow;

        ctx.strokeStyle = pTheme.ring;
        ctx.lineWidth = Math.max(2, Math.floor(cell * 0.08));
        ctx.beginPath();
        ctx.arc(x + cell / 2, y + cell / 2, Math.max(8, cell * 0.42 * spriteScale), 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.82;
        ctx.beginPath();
        ctx.arc(x + cell / 2, y + cell / 2, Math.max(11, cell * 0.54 * spriteScale), 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (food.type === "blue_bonus") {
        ctx.shadowBlur = Math.max(12, Math.floor(cell * 0.66 * spriteScale));
        ctx.shadowColor = "rgba(90,190,255,0.90)";
        ctx.strokeStyle = "rgba(120,220,255,0.95)";
        ctx.lineWidth = Math.max(2, Math.floor(cell * 0.08));
        ctx.beginPath();
        ctx.arc(x + cell / 2, y + cell / 2, Math.max(8, cell * 0.42 * spriteScale), 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.shadowBlur = Math.max(5, Math.floor(cell * 0.32 * spriteScale));
        ctx.shadowColor = "rgba(125, 249, 255, 0.35)";
      }
      ctx.drawImage(img, dx, dy, size, size);
      ctx.restore();

      if ((food.type === "special" || food.type === "blue_bonus") && powerSymbol) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `bold ${Math.max(10, Math.floor(cell * (food.type === "blue_bonus" ? 0.28 : 0.34)))}px Arial`;
        ctx.fillStyle = "rgba(255,255,255,0.96)";
        ctx.shadowBlur = 10;
        ctx.shadowColor = pTheme.glow;
        ctx.fillText(powerSymbol, x + cell / 2, y + cell / 2 + 1);
        ctx.restore();
      }
      return;
    }

    ctx.save();
    ctx.fillStyle = food.type === "special"
      ? pTheme.color
      : food.type === "blue_bonus"
        ? "rgba(90,190,255,0.96)"
        : "rgba(34,197,94,0.95)";
    ctx.shadowBlur = food.type === "special" || food.type === "blue_bonus" ? 14 : 6;
    ctx.shadowColor = food.type === "special"
      ? pTheme.glow
      : food.type === "blue_bonus"
        ? "rgba(90,190,255,0.85)"
        : "rgba(34,197,94,0.35)";
    ctx.beginPath();
    ctx.arc(
      x + cell / 2,
      y + cell / 2,
      Math.max(4, cell * 0.28 * spriteScale),
      0,
      Math.PI * 2
    );
    ctx.fill();

    if (food.type === "special" || food.type === "blue_bonus") {
      ctx.strokeStyle = food.type === "blue_bonus" ? "rgba(120,220,255,0.95)" : pTheme.ring;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + cell / 2, y + cell / 2, Math.max(8, cell * 0.40 * spriteScale), 0, Math.PI * 2);
      ctx.stroke();

      if (powerSymbol) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `bold ${Math.max(10, Math.floor(cell * 0.34))}px Arial`;
        ctx.fillStyle = "rgba(255,255,255,0.96)";
        ctx.fillText(powerSymbol, x + cell / 2, y + cell / 2 + 1);
      }
    }
    ctx.restore();
  }

  function drawSnake() {
    if (!snake.length) return;

    const active = currentActivePower();
    const pTheme = getPowerTheme(active);
    const palette = getWorldSnakePalette();
    const head = snake[0];
    const facing = visualDir();

    if (active) {
      ctx.save();
      ctx.shadowBlur = Math.max(12, Math.floor(cell * 0.85));
      ctx.shadowColor = pTheme.glow;
      for (const part of snake) {
        const x = ox + part.x * cell;
        const y = oy + part.y * cell;
        ctx.fillStyle = pTheme.glow;
        ctx.fillRect(x + 3, y + 3, cell - 6, cell - 6);
      }
      ctx.restore();
    }

    // body + tail
    for (let i = snake.length - 1; i >= 1; i--) {
      const part = snake[i];
      const x = ox + part.x * cell;
      const y = oy + part.y * cell;

      const t = i / Math.max(1, snake.length - 1);
      const tailFactor = 0.58 + (0.34 * (1 - t));
      const size = Math.max(cell * 0.42, cell * tailFactor);
      const inset = (cell - size) / 2;

      ctx.save();

      if (active) {
        ctx.fillStyle = i < snake.length - 2 ? pTheme.ring : pTheme.color;
      } else {
        const mix = Math.max(0, Math.min(1, 1 - t));
        ctx.fillStyle = mix > 0.55 ? palette.body : palette.tail;
        ctx.shadowBlur = 5;
        ctx.shadowColor = palette.shadow;
      }

      const r = Math.max(4, size * 0.28);
      ctx.beginPath();
      ctx.moveTo(x + inset + r, y + inset);
      ctx.lineTo(x + inset + size - r, y + inset);
      ctx.quadraticCurveTo(x + inset + size, y + inset, x + inset + size, y + inset + r);
      ctx.lineTo(x + inset + size, y + inset + size - r);
      ctx.quadraticCurveTo(x + inset + size, y + inset + size, x + inset + size - r, y + inset + size);
      ctx.lineTo(x + inset + r, y + inset + size);
      ctx.quadraticCurveTo(x + inset, y + inset + size, x + inset, y + inset + size - r);
      ctx.lineTo(x + inset, y + inset + r);
      ctx.quadraticCurveTo(x + inset, y + inset, x + inset + r, y + inset);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // head
    const hx = ox + head.x * cell;
    const hy = oy + head.y * cell;
    const cx = hx + cell / 2;
    const cy = hy + cell / 2;

    ctx.save();
    ctx.translate(cx, cy);

    let angle = 0;
    if (facing.x === 1) angle = 0;
    else if (facing.x === -1) angle = Math.PI;
    else if (facing.y === 1) angle = Math.PI / 2;
    else angle = -Math.PI / 2;
    ctx.rotate(angle);

    const headLen = cell * 0.94;
    const headWid = cell * 0.74;

    ctx.fillStyle = active ? pTheme.color : palette.head;
    ctx.shadowBlur = active ? 16 : 10;
    ctx.shadowColor = active ? pTheme.glow : palette.shadow;

    ctx.beginPath();
    ctx.moveTo(headLen * 0.48, 0);
    ctx.quadraticCurveTo(headLen * 0.26, -headWid * 0.54, -headLen * 0.34, -headWid * 0.42);
    ctx.quadraticCurveTo(-headLen * 0.56, 0, -headLen * 0.34, headWid * 0.42);
    ctx.quadraticCurveTo(headLen * 0.26, headWid * 0.54, headLen * 0.48, 0);
    ctx.closePath();
    ctx.fill();

    // darker top plate
    ctx.fillStyle = "rgba(5,8,18,0.16)";
    ctx.beginPath();
    ctx.moveTo(headLen * 0.30, 0);
    ctx.quadraticCurveTo(0, -headWid * 0.28, -headLen * 0.18, 0);
    ctx.quadraticCurveTo(0, headWid * 0.28, headLen * 0.30, 0);
    ctx.closePath();
    ctx.fill();

    // eyes
    const eyeR = Math.max(2, cell * 0.052);
    const eyeX = headLen * 0.14;
    const eyeY = headWid * 0.18;
    ctx.fillStyle = "rgba(5,8,18,0.95)";
    ctx.beginPath();
    ctx.arc(eyeX, -eyeY, eyeR, 0, Math.PI * 2);
    ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();

    // eye shine
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.beginPath();
    ctx.arc(eyeX + 0.8, -eyeY - 0.6, Math.max(1, eyeR * 0.38), 0, Math.PI * 2);
    ctx.arc(eyeX + 0.8, eyeY - 0.6, Math.max(1, eyeR * 0.38), 0, Math.PI * 2);
    ctx.fill();

    // mouth
    const mouth = mouthOpenAmount();
    ctx.strokeStyle = "rgba(5,8,18,0.88)";
    ctx.lineWidth = Math.max(1.2, cell * 0.045);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(headLen * 0.28, 0);
    ctx.lineTo(headLen * 0.46, -headWid * mouth);
    ctx.moveTo(headLen * 0.28, 0);
    ctx.lineTo(headLen * 0.46, headWid * mouth);
    ctx.stroke();

    // tongue
    if (mouth > 0.22) {
      ctx.strokeStyle = active ? pTheme.ring : "rgba(255,110,150,0.92)";
      ctx.lineWidth = Math.max(1, cell * 0.032);
      ctx.beginPath();
      ctx.moveTo(headLen * 0.46, 0);
      ctx.lineTo(headLen * 0.60, 0);
      ctx.moveTo(headLen * 0.60, 0);
      ctx.lineTo(headLen * 0.68, -headWid * 0.08);
      ctx.moveTo(headLen * 0.60, 0);
      ctx.lineTo(headLen * 0.68, headWid * 0.08);
      ctx.stroke();
    }

    ctx.restore();
  }

  function draw() {
    drawBackground();
    drawFood();
    drawSnake();
    drawHint();
    drawParticles();
    drawFloatingTexts();
  }

  function gameOver(msg) {
    if (state === State.OVER) return;

    state = State.OVER;
    stopLoop();
    stopAllMusic();
    stopTutorial(false);

    activeTouchId = null;
    swipeX = null;
    swipeY = null;
    resetCombo();
    ProgressManager.recordGame(score, gameElapsedMs);

    const rankingEval = evaluateRankingEntry();
    pendingRankEntry = rankingEval.qualifies ? rankingEval : null;

    playDeathSequence().finally(() => {
      if (score > best) {
        best = score;
        localStorage.setItem(STORAGE_KEY, String(best));
      }

      syncHud();
      configureOverlayForGameOver(rankingEval.qualifies, rankingEval.mode);
      showOverlay(true, "Game Over", msg || "Restart ou Menu.");
      draw();
    });
  }

  function startGame() {
    unlockAudioOnce();
    loadCoinImages();
    syncWorldToMode();
    resizeCanvas();
    initGameFromMenu();
    particles = [];
    lastFrameTs = 0;
    closeMenuScreens();
    state = State.RUNNING;

    showMenu(false);
    configureOverlayForPause();
    showOverlay(false);

    syncModeOptionsVisibility();
    startTutorial();
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
      configureOverlayForPause();
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
    stopTutorial(false);
    closeMenuScreens();
    pendingRankEntry = null;
    state = State.MENU;
    configureOverlayForPause();
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
      toggleAlignmentHint();
      return;
    }
    if (state !== State.RUNNING) return;

    if (k === "arrowup" || k === "w") setNextDir(0, -1);
    else if (k === "arrowdown" || k === "s") setNextDir(0, 1);
    else if (k === "arrowleft" || k === "a") setNextDir(-1, 0);
    else if (k === "arrowright" || k === "d") setNextDir(1, 0);
  });

  function bindActionButton(button, action) {
    if (!button) return;
    let handledAt = 0;
    const run = (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      if (nowMs() - handledAt < 450) return;
      handledAt = nowMs();
      action();
    };
    button.addEventListener("pointerdown", run, { passive:false });
    button.addEventListener("touchstart", run, { passive:false });
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (nowMs() - handledAt > 450) action();
    });
  }

  el.btnPlay?.addEventListener("click", startGame);
  el.btnProfile?.addEventListener("click", () => ProfileScreen.show());
  el.btnWorlds?.addEventListener("click", () => WorldScreen.show());
  el.btnRanking?.addEventListener("click", showRankingFromMenu);
  el.btnExit?.addEventListener("click", exitGame);
  bindActionButton(el.btnHint, toggleAlignmentHint);
  el.btnOptions?.addEventListener("click", () => showOptions(true));
  el.btnCloseOptions?.addEventListener("click", () => showOptions(false));
  el.btnCloseProfile?.addEventListener("click", () => ProfileScreen.hide());
  el.btnCloseWorlds?.addEventListener("click", () => WorldScreen.hide());
  el.mode?.addEventListener("change", () => {
    localStorage.setItem(LS.mode, String(el.mode.value));
    applyModeExperience();
  });
  el.bgPreset?.addEventListener("change", () => {
    const v = el.bgPreset?.value || "none";
    if (v === "none") {
      localStorage.removeItem(LS.bgPreset);
      bgImg = null;
      draw();
      return;
    }
    applyBuiltInBackground(v);
  });
  el.btnReset?.addEventListener("click", reset);
  bindActionButton(el.btnMenu, backToMenu);
  el.btnFull?.addEventListener("click", toggleFullscreen);

  el.btnOverlayReset?.addEventListener("click", () => {
    if (state === State.OVER) startGame();
    else initGameFromMenu();
  });
  el.btnOverlayMenu?.addEventListener("click", backToMenu);
  el.btnOverlayWorlds?.addEventListener("click", () => {
    backToMenu();
    WorldScreen.show();
  });
  el.btnSaveRank?.addEventListener("click", () => {
    if (!pendingRankEntry) return;
    const ok = savePendingRanking(el.rankingNameInput?.value || "PLAYER");
    if (!ok) return;
    el.rankingNameWrap?.classList.add("hidden");
    el.overlayRanking?.classList.remove("hidden");
    renderRankingList(currentModeKey());
  });

  function applySavedSettingsToUI() {
    const setIf = (node, key) => {
      const v = localStorage.getItem(key);
      if (node && v !== null) node.value = v;
    };
    setIf(el.sfxVol, LS.sfxVol);
    setIf(el.musicVol, LS.musicVol);
    setIf(el.bgPreset, LS.bgPreset);
    setIf(el.bgOpacity, LS.bgOpacity);
    setIf(el.grid, LS.grid);
    setIf(el.walls, LS.walls);
    setIf(el.difficulty, LS.difficulty);
    setIf(el.mode, LS.mode);
    setIf(el.hint, LS.hint);
    setIf(el.alignmentHint, LS.alignmentHint);
    setIf(el.boardSize, LS.boardSize);
    setIf(el.timedDuration, LS.timedDuration);
    const world = syncWorldToMode();
    gameElapsedMs = 0;
    timeLeft = currentModeKey() === "timed" ? timeAttackDurationForWorld(world) : 0;
    lastSecondTs = 0;
    syncModeOptionsVisibility();
    syncHintButton();
  }

  function migrateLegacyBoardSizeSetting() {
    if (localStorage.getItem(LS.boardSize) !== null) return;

    const legacy = localStorage.getItem("undefined");
    if (legacy === "small" || legacy === "medium" || legacy === "large") {
      localStorage.setItem(LS.boardSize, legacy);
    }
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
    el.alignmentHint?.addEventListener("change", () => {
      setAlignmentHint(String(el.alignmentHint.value));
    });
    el.hint?.addEventListener("change", () => {
      localStorage.setItem(LS.hint, String(el.hint.value));
      if (tutorialEnabled()) localStorage.setItem(LS.tutorialSeen, "false");
      else stopTutorial(false);
    });
    el.boardSize?.addEventListener("change", () => {
      localStorage.setItem(LS.boardSize, String(el.boardSize.value));
      resizeCanvas();
      syncHud();
      drawBackground();
    });
    saveVal(el.timedDuration, LS.timedDuration);

    el.bgFile?.addEventListener("change", () => {
      const f = el.bgFile.files && el.bgFile.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        const data = String(reader.result || "");
        localStorage.setItem(LS.bgData, data);
        loadMenuBackground();
  loadBgFromStorage();
  loadCoinImages();
      };
      reader.readAsDataURL(f);
    });
  }

  // BOOT
  migrateLegacyBoardSizeSetting();
  ProgressManager.load();
  applySavedSettingsToUI();
  loadBgFromStorage();
  
  wireSettingsSave();

  showOverlay(false);
  showMenu(true);
  resizeCanvas();
  syncHud();
  syncProgressUI();
  drawBackground();

  // PC/Mac: tenta tocar menu logo
  unlockAudioOnce();
})();
