// __ONERROR_HOOK_V1__
window.onerror = function(message, source, lineno, colno, error) {
  alert("JS ERROR: " + message + "\nLine: " + lineno + ":" + colno);
  return false;
};
console.log("app.js loaded OK");
// __END_ONERROR_HOOK_V1__

(() => {
  const GRID = 25;
  const SPEED = 95;
  const DEADZONE = 6;
  const STORAGE_KEY = "cryptoSnakeBest";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const scoreEl = document.getElementById("score");
  const bestEl  = document.getElementById("best");

  const btnPause   = document.getElementById("btnPause");
  const btnNew     = document.getElementById("btnNew");
  const btnRestart = document.getElementById("btnRestart");
  const btnStart = document.getElementById("btnStart");

  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayText  = document.getElementById("overlayText");

  const tapLayer = document.getElementById("tapLayer");
  const touchPad = document.getElementById("touchPad");
  const menuScreen = document.getElementById("menuScreen");
  const btnPlay = document.getElementById("btnPlay");
  const settingsModal = document.getElementById("settingsModal");
  const btnCloseSettings = document.getElementById("btnCloseSettings");
  const btnSaveSettings = document.getElementById("btnSaveSettings");
  const musicVol = document.getElementById("musicVol");
  const sfxVol = document.getElementById("sfxVol");
  const bgMode = document.getElementById("bgMode");
  const bgAlpha = document.getElementById("bgAlpha");
  const difficulty = document.getElementById("difficulty");
  const walls = document.getElementById("walls");
  const obstacles = document.getElementById("obstacles");


  // ---------------- IMAGENS ----------------
  const imgFundo = new Image();
  imgFundo.src = "assets/img/fundo.png";

  // Ajusta aqui se os teus nomes no assets/img forem diferentes
  const foods = ["maca","morango","uvas","bitcoin","ethereum","doge","cardano","solana"];
  const foodImgs = {};
  foods.forEach(name => {
    const img = new Image();
    // tenta ambos: name.png e name1.png (para cobrir Bitcoin1.png, etc.)
    img.src = `assets/img/${name}.png`;
    img.onerror = () => { img.src = `assets/img/${name}1.png`; };
    foodImgs[name] = img;
  });

  const CONFIG_KEY = "cryptoSnakeConfig_v1";
const MODE_KEY = "cryptoSnakeMode_v1";
const defaultConfig = {
  musicVol: 0.25,
  sfxVol: 0.80,
  bgMode: "gradient",
  bgAlpha: 0.30,
  difficulty: "normal",
  walls: "wrap",
  obstacles: "off"
};
function loadConfig(){
  try{ return { ...defaultConfig, ...(JSON.parse(localStorage.getItem(CONFIG_KEY)||"{}")) }; }
  catch(_){ return { ...defaultConfig }; }
}
function saveConfig(c){ localStorage.setItem(CONFIG_KEY, JSON.stringify(c)); }
let config = loadConfig();
let mode = localStorage.getItem(MODE_KEY) || "infinite";
function setMode(m){ mode=m; localStorage.setItem(MODE_KEY,m); }

// ---------------- AUDIO (iPhone unlock) ----------------
  const audio = {
    eat: new Audio("assets/audio/som_comer.wav"),
    lose: new Audio("assets/audio/som_perder.wav"),
    combo: new Audio("assets/audio/combo.wav"),
    level: new Audio("assets/audio/level_up.wav"),
    music: new Audio("assets/audio/trilha_sonora.wav"),
  };
  audio.music.loop = true;
  audio.music.volume = config.musicVol;
  audio.eat.volume = config.sfxVol * 0.30;
  audio.lose.volume = config.sfxVol;
  audio.combo.volume = 0.0;
  audio.level.volume = config.sfxVol;

  let audioUnlocked = false;
  let soundOn = true;

  function unlockAudioOnce() {
    if (audioUnlocked) return;
    audioUnlocked = true;

    const prime = async (a) => {
      try {
        a.muted = true;
        const p = a.play();
        if (p && p.then) await p;
        a.pause();
        a.currentTime = 0;
        a.muted = false;
      } catch (_) {}
    };

    // “prime” todos, não só a música
    prime(audio.eat);
    prime(audio.lose);
    prime(audio.combo);
    prime(audio.level);
    prime(audio.music);
  }

  function playSfx(a) {
    if (!soundOn || !audioUnlocked) return;
    try {
      a.currentTime = 0;
      a.play();
    } catch (_) {}
  }

  function startMusic() {
    if (!soundOn || !audioUnlocked) return;
    try { audio.music.play(); } catch (_) {}
  }

  function stopMusic() {
    try { audio.music.pause(); audio.music.currentTime = 0; } catch (_) {}
  }

  function difficultySpeed(diff){
    if (diff === "easy") return 110;
    if (diff === "hard") return 80;
    return 95;
  }

  // ---------------- STATE ----------------
  const state = {
    running: true,
    paused: false,
    over: false,
    score: 0,
    best: Number(localStorage.getItem(STORAGE_KEY) || 0),
    snake: [],
    dir: {x:1,y:0},
    nextDir: {x:1,y:0},
    food: {x:10,y:10},
    foodType: "maca",
    pointerDown: false,
    lastPointer: null,
    mouthTimer: 0,
    baseSpeed: difficultySpeed(config.difficulty),
    speed: difficultySpeed(config.difficulty),
    boostUntil: 0,
    invincibleUntil: 0,
  };

  bestEl.textContent = String(state.best);

  // ---------------- CANVAS ----------------
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    canvas.width  = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener("resize", resize);
  resize();

  // ---------------- GAME ----------------
  function spawnFood() {
    state.foodType = foods[Math.floor(Math.random()*foods.length)];
    while (true) {
      const p = {x:Math.floor(Math.random()*GRID), y:Math.floor(Math.random()*GRID)};
      if (!state.snake.some(s => s.x===p.x && s.y===p.y)) {
        state.food = p;
        break;
      }
    }
  }

  function reset() {
    state.score = 0;
    scoreEl.textContent = "0";
    state.dir = {x:1,y:0};
    state.nextDir = {x:1,y:0};
    const mid = Math.floor(GRID/2);
    state.snake = [{x:mid,y:mid},{x:mid-1,y:mid},{x:mid-2,y:mid}];
    state.over = false;
    state.running = true;
            state.mouthTimer = 0;
state.mouthTimer = 0;
overlay.classList.add("hidden");
    spawnFood();
    // música começa depois do 1º toque (unlock)
  }
  function openSettings() {
    if (!settingsModal) return;
    // preencher UI
    musicVol.value = Math.round(config.musicVol * 100);
    sfxVol.value = Math.round(config.sfxVol * 100);
    bgMode.value = config.bgMode;
    bgAlpha.value = Math.round(config.bgAlpha * 100);
    difficulty.value = config.difficulty;
    walls.value = config.walls;
    obstacles.value = config.obstacles;
    settingsModal.classList.remove('hidden');
  }
  function closeSettings() {
    settingsModal?.classList.add('hidden');
  }
  function applyConfigToAudio(){
    audio.music.volume = config.musicVol;
    audio.eat.volume = config.sfxVol * 0.30;
    audio.lose.volume = config.sfxVol;
    audio.level.volume = config.sfxVol;
    audio.combo.volume = 0.0;
  }
  function applyConfigToGame(){
    state.baseSpeed = difficultySpeed(config.difficulty);
    if (!state.boostUntil) state.speed = state.baseSpeed;
  }

  function showMenu() {
    state.running = false;
    state.over = false;
    overlayTitle.textContent = "Crypto Snake";
    overlayText.textContent = "Toca Start para começar.";
    overlay.classList.remove("hidden");
    if (btnRestart) btnRestart.style.display = "inline-block";
    if (btnStart) btnStart.style.display = "none";
    if (btnRestart) btnRestart.style.display = "none";
    if (btnStart) btnStart.style.display = "inline-block";
  }

  function gameOver() {
    state.over = true;
    state.running = false;
    overlayTitle.textContent = "Game Over";
    overlayText.textContent = `Score: ${state.score}`;
    overlay.classList.remove("hidden");
    if (btnRestart) btnRestart.style.display = "inline-block";
    if (btnStart) btnStart.style.display = "none";

    if (state.score > state.best) {
      state.best = state.score;
      bestEl.textContent = String(state.best);
      localStorage.setItem(STORAGE_KEY, String(state.best));
    }

    playSfx(audio.lose);
  }

  function wrap(p) {
    if (config.walls === "wrap") {
      p.x = (p.x + GRID) % GRID;
      p.y = (p.y + GRID) % GRID;
      return true;
    }
    // solid: se sair fora, perde
    if (p.x < 0 || p.x >= GRID || p.y < 0 || p.y >= GRID) return false;
    return true;
  }

  function step() {
    if (!state.snake || !state.snake.length) return;
    const now = performance.now();
    const inv = now < state.invincibleUntil;

    state.dir = state.nextDir;

    const head = state.snake[0];
    const newHead = {x: head.x + state.dir.x, y: head.y + state.dir.y};
    const ok = wrap(newHead);
    if (!ok) {
      if (!(performance.now() < state.invincibleUntil)) { gameOver(); return; }
      // invencível: volta para dentro (wrap temporário)
      newHead.x = (newHead.x + GRID) % GRID;
      newHead.y = (newHead.y + GRID) % GRID;
    }

    const willEat = (newHead.x===state.food.x && newHead.y===state.food.y);
    const bodyToCheck = willEat ? state.snake : state.snake.slice(0,-1);

    if (!inv && bodyToCheck.some(s => s.x===newHead.x && s.y===newHead.y)) {
      gameOver();
      return;
    }

    state.snake.unshift(newHead);

    if (willEat) {
      state.score++;
      scoreEl.textContent = String(state.score);
      playSfx(audio.eat);
      state.mouthTimer = 10;

      // Bitcoin power-up: speed + invencível 5s
      if (state.foodType === "bitcoin") {
        const now = performance.now();
        state.boostUntil = now + 5000;
        state.invincibleUntil = now + 5000;
        state.speed = 55; // mais rápido durante power-up
      }

      if (state.score % 5 === 0) playSfx(audio.level);
      spawnFood();
    } else {
      state.snake.pop();
    }
  }


  function roundRect(x, y, w, h, r) {
    const rr = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawFace(cell) {
    const head = state.snake[0];
    if (!head) return;

    const x = head.x * cell;
    const y = head.y * cell;
    const cx = x + cell/2;
    const cy = y + cell/2;

    const dx = state.dir.x;
    const dy = state.dir.y;

    // perpendicular
    const px = -dy;
    const py = dx;

    // olhos
    const eyeSep = cell * 0.16;
    const eyeFwd = cell * 0.10;
    const eyeR = cell * 0.08;

    const e1x = cx + px * eyeSep + dx * eyeFwd;
    const e1y = cy + py * eyeSep + dy * eyeFwd;
    const e2x = cx - px * eyeSep + dx * eyeFwd;
    const e2y = cy - py * eyeSep + dy * eyeFwd;

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath(); ctx.arc(e1x, e1y, eyeR, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(e2x, e2y, eyeR, 0, Math.PI*2); ctx.fill();

    const pr = eyeR * 0.45;
    const pf = cell * 0.03;
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.beginPath(); ctx.arc(e1x + dx*pf, e1y + dy*pf, pr, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(e2x + dx*pf, e2y + dy*pf, pr, 0, Math.PI*2); ctx.fill();

    // boca (abre quando come)
    const open = state.mouthTimer > 0;
    const mouthFwd = cell * 0.23;
    const mouthW = cell * 0.24;
    const mouthH = open ? cell * 0.16 : cell * 0.06;

    const mx = cx + dx * mouthFwd;
    const my = cy + dy * mouthFwd;

    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(Math.atan2(dy, dx));
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    roundRect(-mouthW/2, -mouthH/2, mouthW, mouthH, mouthH * 0.7);
    ctx.fill();
    ctx.restore();

    if (state.mouthTimer > 0) state.mouthTimer -= 1;
  }

  // ---------------- DRAW ----------------
  function draw() {
    if (!state.snake || !state.snake.length) return;
    const w = canvas.width / (window.devicePixelRatio || 1);
    const cell = Math.floor(w / GRID);

    {
      const g = ctx.createLinearGradient(0,0,w,w);
      g.addColorStop(0, "#050812");
      g.addColorStop(1, "#0b1430");
      ctx.fillStyle = g;
      ctx.fillRect(0,0,w,w);
    }

    const foodImg = foodImgs[state.foodType];
    if (foodImg && foodImg.complete && foodImg.naturalWidth > 0) {
      ctx.drawImage(foodImg, state.food.x*cell, state.food.y*cell, cell, cell);
    } else {
      ctx.fillStyle="#22c55e";
      ctx.fillRect(state.food.x*cell, state.food.y*cell, cell, cell);
    }

    state.snake.forEach((seg,i)=>{
      const t = i / Math.max(1, state.snake.length-1);
      const alpha = 1 - t*0.65;

      const x = seg.x*cell;
      const y = seg.y*cell;

      const r = Math.floor(cell*0.28);
      ctx.fillStyle = `rgba(34,197,94,${alpha})`; // verde
      ctx.beginPath();
      ctx.moveTo(x+r, y);
      ctx.arcTo(x+cell, y, x+cell, y+cell, r);
      ctx.arcTo(x+cell, y+cell, x, y+cell, r);
      ctx.arcTo(x, y+cell, x, y, r);
      ctx.arcTo(x, y, x+cell, y, r);
      ctx.closePath();
      ctx.fill();

      // brilho na cabeça
      if (i === 0) {
        ctx.fillStyle = "rgba(187,247,208,0.25)";
        ctx.fillRect(x+cell*0.15, y+cell*0.15, cell*0.7, cell*0.7);
      }
    });

    drawFace(cell);
  }

  // ---------------- LOOP ----------------
  let last = 0;
  function loop(t){
    if (state.boostUntil && t > state.boostUntil) {
      state.boostUntil = 0;
      state.invincibleUntil = 0;
      state.speed = state.baseSpeed;
    }

    if (state.running && !state.over && (t-last) > state.speed) {
      step();
      last = t;
    }
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ---------------- CONTROLOS ----------------
  function isOpposite(a,b){ return a.x===-b.x && a.y===-b.y; }
  function setDir(d){
    if (!isOpposite(d, state.dir)) state.nextDir = d;
  }

  // Teclado (Mac/PC)
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (k === "arrowup" || k === "w") setDir({x:0,y:-1});
    else if (k === "arrowdown" || k === "s") setDir({x:0,y:1});
    else if (k === "arrowleft" || k === "a") setDir({x:-1,y:0});
    else if (k === "arrowright" || k === "d") setDir({x:1,y:0});
    else if (k === " ") state.running = !state.running;
  });

  // iPhone: unlock + controlo por “arrasto incremental”
  touchPad.addEventListener("pointerdown", (e) => {
    unlockAudioOnce();
    startMusic();
    state.pointerDown = true;
    state.lastPointer = {x:e.clientX, y:e.clientY};
    touchPad.setPointerCapture?.(e.pointerId);
  });

  touchPad.addEventListener("pointermove", (e) => {
    if (!state.pointerDown || !state.lastPointer || !state.running || state.over) return;

    const dx = e.clientX - state.lastPointer.x;
    const dy = e.clientY - state.lastPointer.y;
    if (Math.abs(dx) < DEADZONE && Math.abs(dy) < DEADZONE) return;

    if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? {x:1,y:0} : {x:-1,y:0});
    else setDir(dy > 0 ? {x:0,y:1} : {x:0,y:-1});

    state.lastPointer = {x:e.clientX, y:e.clientY};
  });

  function endPointer(){ state.pointerDown=false; state.lastPointer=null; }
  touchPad.addEventListener("pointerup", endPointer);
  touchPad.addEventListener("pointercancel", endPointer);

  btnPause?.addEventListener("click", () => { state.running = !state.running; });
  btnNew?.addEventListener("click", reset);
  btnRestart?.addEventListener("click", reset);

  // modeBtnHandlers_v1
  document.querySelectorAll('.modeBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = btn.dataset.mode;
      if (m === 'settings') { openSettings(); return; }
      setMode(m);
      document.querySelectorAll('.modeBtn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    });
  });
  btnPlay?.addEventListener('click', () => {
    unlockAudioOnce();
    startMusic();
    // preparar variáveis do modo
    state.mode = mode;
    state.modeStart = performance.now();
    state.timeLimitMs = (mode === 'time') ? 60000 : 0;
    state.lives = (mode === 'survival') ? 3 : 0;
    applyConfigToGame();
    reset();
    state.running = true;
    hideMenuScreen();
  });
  btnCloseSettings?.addEventListener('click', closeSettings);
  btnSaveSettings?.addEventListener('click', () => {
    config = {
      musicVol: Number(musicVol.value)/100,
      sfxVol: Number(sfxVol.value)/100,
      bgMode: bgMode.value,
      bgAlpha: Number(bgAlpha.value)/100,
      difficulty: difficulty.value,
      walls: walls.value,
      obstacles: obstacles.value
    };
    saveConfig(config);
    applyConfigToAudio();
    applyConfigToGame();
    closeSettings();
  });
  // START_GAME_FROM_MENU_V1

  function hideMenuScreen() { menuScreen?.classList.add("hidden"); }
  function showMenuScreen() {
    menuScreen?.classList.remove("hidden");
    // garantir que o jogo não corre por trás do menu
    state.running = false;
    state.paused = true;
    state.over = false;
    try { hideOverlay(); } catch(e) {}
  }

  function startGame(mode = "infinite") {
        if (tapLayer) tapLayer.style.pointerEvents = "auto";
try { unlockAudioOnce(); } catch(e) {}
    try { startMusic(); } catch(e) {}
    try { (typeof reset === "function" ? reset() : (typeof resetGame === "function" ? resetGame() : null)); } catch(e) {}
    state.mode = mode;
    state.running = true;
    state.paused = false;
    state.over = false;
    try { hideOverlay(); } catch(e) {}
    hideMenuScreen();
  }

  window.startGame = startGame;

    btnStart?.addEventListener("click", () => startGame(state.mode || "infinite"));

  btnPlay?.addEventListener("click", () => startGame(state.mode || "infinite"));

  // Ligar vários IDs possíveis (para ser à prova de mudanças no HTML)
  const playIds = [
    "btnPlayInfinite", "btnInfinite", "btnModeInfinite", "btnInfinito",
    "btnPlayTime", "btnTime", "btnModeTime", "btnTimeAttack",
    "btnPlaySurvival", "btnSurvival", "btnModeSurvival",
    "btnStart", "btnPlay"
  ];

  for (const id of playIds) {
    const el = document.getElementById(id);
    if (!el) continue;
    const mode =
      id.toLowerCase().includes("time") ? "time" :
      id.toLowerCase().includes("surv") ? "survival" :
      "infinite";
    el.addEventListener("click", () => startGame(mode));
  }
  // END START_GAME_FROM_MENU_V1

  // PLAY_START_LISTENERS_V1
  btnPlay?.addEventListener("click", () => startGame(state.mode || "infinite"));
  btnStart?.addEventListener("click", () => startGame(state.mode || "infinite"));

  showMenuScreen();
})();


/* MENU_DELEGATION_FIX_V1 */
(function(){
  const get = (id) => document.getElementById(id);

  function menuVisible(){
    const m = get("menuScreen");
    return !!(m && !m.classList.contains("hidden"));
  }

  function syncPointerEvents(){
    const tap = get("tapLayer");
    if (!tap) return;
    tap.style.pointerEvents = menuVisible() ? "none" : "auto";
  }

  // Atualiza sempre que o menu muda de visibilidade
  const m = get("menuScreen");
  if (m && window.MutationObserver){
    new MutationObserver(syncPointerEvents).observe(m, {attributes:true, attributeFilter:["class"]});
  }
  syncPointerEvents();

  // Delegação de cliques: funciona mesmo se o menu for criado depois
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || !btn.id) return;

    const id = btn.id.toLowerCase();
    const isPlay =
      id.includes("play") || id.includes("start");

    if (!isPlay) return;

    e.preventDefault();
    e.stopPropagation();

    const mode =
      id.includes("time") ? "time" :
      id.includes("surv") ? "survival" :
      "infinite";

    try {
      // startGame tem de existir no teu app.js
      if (typeof window.startGame === "function") window.startGame(mode);
    } catch(err){
      console.error("startGame failed:", err);
      alert("startGame error: " + (err?.message || err));
    }
  }, true);
})();

// === FORCE MENU CLICK FIX ===
document.addEventListener("click", function(e) {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.id === "btnPlay") {
    console.log("PLAY CLICKED");

    if (typeof startGame === "function") {
      startGame("infinite");
    } else {
      alert("startGame não existe");
    }
  }
});
