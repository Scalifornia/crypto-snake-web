const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Execute the real browser script with a small DOM/clock adapter. The hook is
// injected only into this VM; the shipped game exposes no mutable test globals.
function createGame({ landscape = false, storageFails = false, saved = {}, delayedAudio = false } = {}) {
  let now = 1000;
  let landscapeMode = landscape;
  let timerId = 0;
  const pendingAudio = [];
  const raf = new Map();
  const timers = new Map();
  const values = new Map(Object.entries(saved));
  const gradients = { addColorStop() {} };
  const context2d = new Proxy({}, { get: (target, key) => target[key] || (String(key).includes('Gradient') ? () => gradients : () => {}), set: (target, key, value) => (target[key] = value, true) });

  function element(id = '') {
    const classes = new Set(['hidden']);
    const listeners = new Map();
    return {
      id, value: '', textContent: '', innerHTML: '', tagName: 'DIV', dataset: {},
      classList: { add: (...v) => v.forEach(x => classes.add(x)), remove: (...v) => v.forEach(x => classes.delete(x)), contains: v => classes.has(v), toggle(v, on) { const enabled = on ?? !classes.has(v); enabled ? classes.add(v) : classes.delete(v); return enabled; } },
      style: { setProperty() {} },
      addEventListener(type, listener) { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(listener); },
      dispatchEvent(event) { event.target ??= this; for (const fn of listeners.get(event.type) || []) fn(event); },
      closest(selector) {
        if (selector.includes('input') && ['INPUT', 'SELECT', 'TEXTAREA'].includes(this.tagName)) return this;
        if (selector.includes('button') && this.tagName === 'BUTTON') return this;
        return null;
      },
      setAttribute() {}, focus() { this.focused = true; },
      getBoundingClientRect: () => ({ width: landscapeMode ? 800 : 900, height: landscapeMode ? 230 : 600 }),
      getContext: () => context2d,
      querySelectorAll() { return this.children || []; },
    };
  }
  const nodes = new Map();
  const node = id => { if (!nodes.has(id)) nodes.set(id, element(id)); return nodes.get(id); };
  const defaults = { mode: 'classic', difficulty: 'normal', walls: 'off', grid: 'off', hint: 'off', alignmentHint: 'off', boardSize: 'small', timedDuration: 'auto', sound: 'off', music: 'off', sfxVol: '80', musicVol: '60', bgOpacity: '40', bgPreset: 'none' };
  Object.entries(defaults).forEach(([id, value]) => { node(id).value = value; });
  node('rankingNameInput').tagName = 'INPUT';
  node('combo').parentElement = element('power-pill');
  node('touchControls').children = ['up', 'down', 'left', 'right'].map(direction => Object.assign(element(), { tagName: 'BUTTON', dataset: { direction } }));
  const document = Object.assign(element(), { body: element('body'), hidden: false, getElementById: node, querySelector: () => node('topbar') });
  const window = Object.assign(element(), { devicePixelRatio: 1, location: { href: 'http://localhost/' }, matchMedia: query => ({ matches: query.includes('landscape') ? landscapeMode : query.includes('portrait') ? false : false }), close() {} });
  class Audio {
    constructor(src) { this.src = src; this.paused = true; }
    play() { this.paused = false; return delayedAudio ? new Promise(resolve => pendingAudio.push(resolve)) : Promise.resolve(); }
    pause() { this.paused = true; }
  }
  const sandbox = { document, window, Audio, Image: class { constructor() { this.dataset = {}; } }, URL, Event: class { constructor(type) { this.type = type; } }, performance: { now: () => now }, console: { log() {} },
    localStorage: { getItem(key) { if (storageFails) throw new Error('blocked'); return values.get(key) ?? null; }, setItem(key, value) { if (storageFails) throw new Error('quota'); values.set(key, value); }, removeItem(key) { if (storageFails) throw new Error('blocked'); values.delete(key); } },
    requestAnimationFrame(callback) { const id = ++timerId; raf.set(id, callback); return id; }, cancelAnimationFrame: id => raf.delete(id),
    setTimeout(callback) { const id = ++timerId; timers.set(id, callback); return id; }, clearTimeout: id => timers.delete(id),
  };
  const context = vm.createContext(sandbox);
  const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  const hook = `
    globalThis.gameTest = {
      startGame, pauseToggle, backToMenu, step, loop, resizeCanvas, spawnFood,
      activatePower, registerEat, enqueueDirection, gameOver, storage, getRankings,
      renderRankingList, timeAttackDurationForWorld, shouldRunTutorial,
      snapshot: () => ({ state, snake, food, dir, directionQueue, score, cashValue,
        gameElapsedMs, timeLeft, gridCols, gridRows, bitcoinUntil, ethereumUntil,
        blueBonusUntil, lastEatAt, runId, accMs, boardW, boardH, cssW, cssH }),
      scenario(value) {
        if ('snake' in value) snake = value.snake;
        if ('food' in value) food = value.food;
        if ('dir' in value) { dir = value.dir; nextDir = value.dir; }
        if ('gridCols' in value) gridCols = value.gridCols;
        if ('gridRows' in value) gridRows = value.gridRows;
        if ('blueBonusUntil' in value) blueBonusUntil = value.blueBonusUntil;
        if ('elapsed' in value) gameElapsedMs = value.elapsed;
      }
    };
  `;
  vm.runInContext(source.replace(/\}\)\(\);\s*$/, hook + '\n})();'), context);
  const api = context.gameTest;
  const event = (type, extra = {}) => ({ type, key: '', button: 0, detail: 0, preventDefault() { this.defaultPrevented = true; }, stopPropagation() {}, ...extra });
  return { api, node, document, window, values, pendingAudio, timers,
    snapshot: () => JSON.parse(JSON.stringify(api.snapshot())),
    advance(ms) { now += ms; api.loop(now); },
    setLandscape(value) { landscapeMode = value; },
    key(key, target = document.body, extra = {}) { const e = event('keydown', { key, target, ...extra }); window.dispatchEvent(e); return e; },
    click(id) { node(id).dispatchEvent(event('click')); },
    emit(target, type, extra) { target.dispatchEvent(event(type, extra)); },
  };
}

test('landscape run starts in bounds and rendering preserves board coordinates after rotation', () => {
  const g = createGame({ landscape: true });
  g.node('walls').value = 'on';
  g.api.startGame();
  const initial = g.snapshot();
  assert.equal(initial.gridRows, 6);
  assert.ok(initial.snake.every(p => p.x >= 0 && p.x < initial.gridCols && p.y >= 0 && p.y < initial.gridRows));
  g.api.step();
  assert.equal(g.snapshot().state, 'RUNNING');
  g.setLandscape(false);
  g.api.resizeCanvas();
  assert.equal(g.snapshot().gridRows, initial.gridRows);
  assert.equal(g.snapshot().gridCols, initial.gridCols);
  assert.ok(g.snapshot().boardH <= g.snapshot().cssH);
});

test('pause freezes movement, active timers and elapsed time through a long break', () => {
  const g = createGame();
  g.node('mode').value = 'timed';
  g.api.startGame();
  g.advance(0);
  g.advance(110);
  g.api.activatePower('bitcoin');
  g.api.registerEat();
  g.api.scenario({ food: { x: 0, y: 0, type: 'blue_bonus' }, blueBonusUntil: 6610 });
  const before = g.snapshot();
  g.api.pauseToggle(true);
  g.advance(30000);
  g.api.pauseToggle(false);
  g.advance(0);
  const after = g.snapshot();
  for (const key of ['snake', 'gameElapsedMs', 'timeLeft', 'bitcoinUntil', 'blueBonusUntil', 'lastEatAt']) assert.deepEqual(after[key], before[key], key);
  g.advance(110);
  assert.equal(g.snapshot().gameElapsedMs, before.gameElapsedMs + 110);
});

test('keyboard and direction buttons share a bounded queue without reversals', () => {
  const g = createGame(); g.api.startGame();
  const up = g.key('ArrowUp');
  g.key('ArrowLeft');
  g.key('ArrowDown');
  assert.equal(up.defaultPrevented, true);
  assert.equal(g.snapshot().directionQueue.length, 2);
  g.api.step(); assert.deepEqual(g.snapshot().dir, { x: 0, y: -1 });
  g.api.step(); assert.deepEqual(g.snapshot().dir, { x: -1, y: 0 });
  const down = g.node('touchControls').children[1];
  g.emit(down, 'pointerdown');
  g.emit(down, 'click', { detail: 1 });
  assert.equal(g.snapshot().directionQueue.length, 1);
  g.api.step(); assert.deepEqual(g.snapshot().dir, { x: 0, y: 1 });
  assert.equal(g.api.enqueueDirection(0, -1), false);
});

test('editing a ranking name does not activate gameplay shortcuts', () => {
  const g = createGame(); g.api.startGame();
  const id = g.snapshot().runId;
  for (const key of ['r', 'h', 'f', ' ', 'ArrowUp']) g.key(key, g.node('rankingNameInput'));
  assert.equal(g.snapshot().runId, id);
  assert.equal(g.snapshot().state, 'RUNNING');
  assert.equal(g.snapshot().directionQueue.length, 0);
  g.key('r', undefined, { ctrlKey: true });
  assert.equal(g.snapshot().runId, id);
});

test('pause, resume and restart work through visible controls; each run resets currency', () => {
  const g = createGame(); g.api.startGame(); g.api.registerEat(1, 500);
  g.click('btnPause'); assert.equal(g.snapshot().state, 'PAUSED');
  assert.equal(g.node('btnOverlayResume').classList.contains('hidden'), false);
  g.click('btnOverlayResume'); assert.equal(g.snapshot().state, 'RUNNING');
  g.click('btnPause'); g.click('btnOverlayReset');
  assert.equal(g.snapshot().state, 'RUNNING');
  assert.equal(g.snapshot().cashValue, 0);
  assert.equal(g.snapshot().score, 0);
});

test('hidden documents and unfocused windows pause the run', () => {
  const g = createGame(); g.api.startGame();
  g.document.hidden = true; g.emit(g.document, 'visibilitychange');
  assert.equal(g.snapshot().state, 'PAUSED');
  g.api.pauseToggle(false); g.emit(g.window, 'blur');
  assert.equal(g.snapshot().state, 'PAUSED');
});

test('the departing tail is traversable but an occupied body cell still ends a run', () => {
  const g = createGame(); g.api.startGame();
  g.api.scenario({ snake: [{ x: 2, y: 2 }, { x: 2, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 2 }], dir: { x: -1, y: 0 }, food: { x: 5, y: 5 } });
  g.api.step(); assert.equal(g.snapshot().state, 'RUNNING');
  g.api.scenario({ snake: [{ x: 2, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 2, y: 3 }], dir: { x: -1, y: 0 } });
  g.api.step(); assert.equal(g.snapshot().state, 'OVER');
});

test('filling the last free cell ends with victory and no overlapping food', () => {
  const g = createGame(); g.api.startGame();
  g.api.scenario({ gridCols: 2, gridRows: 2, snake: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], dir: { x: 1, y: 0 }, food: { x: 1, y: 0, type: 'normal' } });
  g.api.step();
  assert.equal(g.snapshot().state, 'OVER');
  assert.equal(g.snapshot().food, null);
  assert.equal(g.node('overlayTitle').textContent, 'Vitória!');
});

test('storage failures do not stop boot, coin collection or ranking saves', () => {
  const g = createGame({ storageFails: true });
  g.api.startGame(); g.api.registerEat(); g.api.gameOver('Teste');
  g.node('rankingNameInput').value = 'ANA'; g.click('btnSaveRank');
  assert.equal(g.api.getRankings().classic[0].name, 'ANA');
  assert.equal(JSON.parse(g.api.storage.getItem('cs_progress_v1')).moedas_recolhidas, 1);
});

test('explicit 20 seconds differs from automatic duration and completed tutorials stay dismissed', () => {
  const g = createGame({ saved: { cs_tutorialSeen: 'true' } });
  g.node('hint').value = 'on'; assert.equal(g.api.shouldRunTutorial(), false);
  g.node('timedDuration').value = '20'; assert.equal(g.api.timeAttackDurationForWorld('medium'), 20);
  g.node('timedDuration').value = 'auto'; assert.equal(g.api.timeAttackDurationForWorld('medium'), 25);
});

test('collecting a timed coin preserves the fraction of the current second', () => {
  const g = createGame(); g.node('mode').value = 'timed'; g.api.startGame();
  g.advance(0);
  for (let i = 0; i < 9; i += 1) g.advance(100);
  const before = g.snapshot();
  g.api.scenario({ food: { x: (before.snake[0].x + 1) % before.gridCols, y: before.snake[0].y, type: 'normal' } });
  g.api.step();
  assert.equal(g.snapshot().timeLeft, 26);
  g.advance(100);
  assert.equal(g.snapshot().timeLeft, 25);
  assert.equal(g.node('time').textContent, '25s');
});

test('elapsed time and expired powers update without collecting another coin', () => {
  const g = createGame(); g.api.startGame(); g.api.activatePower('bitcoin');
  g.api.scenario({ food: { x: 0, y: 0, type: 'normal' } });
  g.advance(0);
  for (let i = 0; i < 60; i += 1) g.advance(100);
  assert.equal(g.node('time').textContent, '6.0s');
  assert.equal(g.node('combo').textContent, '--');
});

test('late death audio cannot reopen game-over after starting a new game', async () => {
  const g = createGame({ delayedAudio: true });
  g.node('sound').value = 'on'; g.api.startGame(); g.api.gameOver('Teste');
  g.api.startGame();
  for (const resolve of g.pendingAudio.splice(0)) resolve();
  await Promise.resolve(); await Promise.resolve();
  assert.equal(g.snapshot().state, 'RUNNING');
  assert.equal(g.node('overlay').classList.contains('hidden'), true);
  assert.equal(g.pendingAudio.length, 0);
});

test('damaged ranking entries normalize safely and player names render as text', () => {
  const g = createGame({ saved: { cs_rankings_v1: JSON.stringify({ classic: [null, { name: '<b>ANA</b>', timeSeconds: 'oops', coins: 4 }] }) } });
  g.api.renderRankingList('classic');
  assert.match(g.node('rankingList').innerHTML, /&lt;b&gt;ANA&lt;\/b&gt;/);
  assert.equal(g.api.getRankings().classic[0].timeSeconds, 0);
});
