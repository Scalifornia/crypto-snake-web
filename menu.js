(() => {
  "use strict";

  const byId = (id) => document.getElementById(id);
  const menu = byId("menu");
  if (!menu) return;

  const mode = byId("mode");
  const difficulty = byId("difficulty");
  const quickDifficulty = byId("quickDifficulty");
  const modeCards = [...document.querySelectorAll(".mode-card[data-mode]")];
  const modes = {
    classic: ["Clássico", "Recolhe moedas, cresce e supera o teu recorde."],
    timed: ["Contra o tempo", "Cada moeda dá-te mais tempo. Faz cada segundo contar."],
    survival: ["Sobrevivência", "O ritmo acelera. Aguenta o máximo de tempo."],
  };
  const readStorage = (key) => {
    try { return localStorage.getItem(key); } catch { return null; }
  };
  const writeStorage = (key, value) => {
    try { localStorage.setItem(key, value); } catch { /* Settings still work for this visit. */ }
  };
  const setText = (id, text) => {
    const node = byId(id);
    if (node) node.textContent = text;
  };
  const changeValue = (node, value) => {
    if (!node || node.value === value) return;
    node.value = value;
    node.dispatchEvent(new Event("change", { bubbles: true }));
  };

  function syncMode() {
    const selected = modes[mode?.value] ? mode.value : "classic";
    for (const card of modeCards) {
      const active = card.dataset.mode === selected;
      card.classList.toggle("selected", active);
      card.setAttribute("aria-pressed", String(active));
    }
    setText("selectedModeName", modes[selected][0]);
    setText("selectedModeDetail", modes[selected][1]);
  }

  modeCards.forEach((card) => card.addEventListener("click", () => {
    if (modes[card.dataset.mode]) changeValue(mode, card.dataset.mode);
    syncMode();
  }));
  mode?.addEventListener("change", syncMode);
  quickDifficulty?.addEventListener("change", () => changeValue(difficulty, quickDifficulty.value));
  difficulty?.addEventListener("change", () => {
    if (quickDifficulty) quickDifficulty.value = difficulty.value;
  });

  const formatNumber = new Intl.NumberFormat("pt-PT");
  const safeInteger = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(number))) : fallback;
  };
  function xpForLevel(level) {
    const thresholds = [0, 100, 250, 450, 700];
    if (level <= thresholds.length) return thresholds[level - 1];
    let xp = 700;
    let increment = 300;
    for (let next = 6; next <= Math.min(201, level); next += 1) {
      xp = Math.min(Number.MAX_SAFE_INTEGER, xp + Math.round(increment));
      increment *= 1.18;
    }
    return xp;
  }

  function syncProgress() {
    let progress = {};
    try {
      const stored = JSON.parse(readStorage("cs_progress_v1") || "{}");
      if (stored && typeof stored === "object") progress = stored;
    } catch { /* A damaged save must not prevent opening the menu. */ }
    const level = Math.min(200, Math.max(1, safeInteger(progress.nivel, 1)));
    const xp = safeInteger(progress.xp_total);
    const start = xpForLevel(level);
    const next = xpForLevel(level + 1);
    const percent = Math.max(0, Math.min(100, ((xp - start) / Math.max(1, next - start)) * 100));
    setText("homeBest", formatNumber.format(safeInteger(progress.melhor_score)));
    setText("homeCoins", formatNumber.format(safeInteger(progress.moedas_recolhidas)));
    setText("homeLevel", formatNumber.format(level));
    setText("homeXpText", `${formatNumber.format(xp)} / ${formatNumber.format(next)} XP`);
    const fill = byId("homeXpFill");
    if (fill) fill.style.width = `${percent}%`;
  }

  const music = byId("music");
  const sound = byId("sound");
  const soundButton = byId("btnSound");
  const isMuted = () => music?.value !== "on" && sound?.value !== "on";
  function syncSound() {
    const muted = isMuted();
    setText("soundLabel", muted ? "Som desligado" : "Som ligado");
    soundButton?.setAttribute("aria-pressed", String(!muted));
    soundButton?.setAttribute("aria-label", muted ? "Ligar o som" : "Desligar o som");
    soundButton?.classList.toggle("muted", muted);
    writeStorage("cs_masterMuted", String(muted));
  }
  // Apply a saved mute before observing the two separate audio settings.
  if (readStorage("cs_masterMuted") === "true") {
    changeValue(music, "off");
    changeValue(sound, "off");
  }
  music?.addEventListener("change", syncSound);
  sound?.addEventListener("change", syncSound);
  soundButton?.addEventListener("click", () => {
    const value = isMuted() ? "on" : "off";
    changeValue(music, value);
    changeValue(sound, value);
    syncSound();
  });

  const help = byId("helpDialog");
  byId("btnHelp")?.addEventListener("click", () => {
    if (help && !help.open) {
      returnFocus = document.activeElement;
      help.showModal();
    }
  });
  byId("btnCloseHelp")?.addEventListener("click", () => help?.close());

  const overlay = byId("overlay");
  const home = menu.querySelector(".menu-home-inner");
  const panels = [
    [byId("optionsPanel"), byId("btnCloseOptions")],
    [byId("profilePanel"), byId("btnCloseProfile")],
    [byId("worldsPanel"), byId("btnCloseWorlds")],
  ].filter(([panel]) => panel);
  const visible = (node) => !!node && !node.closest(".hidden, [hidden], [inert]") && node.getClientRects().length > 0;
  const focusable = (node) => [...node.querySelectorAll(
    'button, a[href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])'
  )].filter((item) => !item.disabled && item.tabIndex >= 0 && visible(item));
  const menuVisible = () => !menu.classList.contains("hidden");
  let activeModal = null;
  let returnFocus = null;

  function syncModals() {
    const next = help?.open ? help
      : overlay && !overlay.classList.contains("hidden") ? overlay
      : menuVisible() ? panels.find(([panel]) => !panel.classList.contains("hidden"))?.[0] || null
      : null;
    if (home) home.inert = !!next;
    for (const panel of [...panels.map(([node]) => node), overlay].filter(Boolean)) {
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", String(panel === next));
      panel.setAttribute("aria-hidden", String(panel !== next));
      const heading = panel.querySelector("h2");
      if (heading && !panel.hasAttribute("aria-labelledby") && !panel.hasAttribute("aria-label")) {
        if (!heading.id) heading.id = `${panel.id}Title`;
        panel.setAttribute("aria-labelledby", heading.id);
      }
    }
    if (next === activeModal) return;
    const previous = activeModal;
    activeModal = next;
    if (next) {
      if (!previous && !returnFocus) returnFocus = document.activeElement;
      if (!next.contains(document.activeElement)) {
        next.tabIndex = -1;
        (focusable(next)[0] || next).focus({ preventScroll: true });
      }
    } else if (previous) {
      const canRestore = visible(returnFocus) && (menuVisible() ? menu.contains(returnFocus) : !menu.contains(returnFocus));
      const target = menuVisible() ? (canRestore ? returnFocus : byId("btnPlay")) : byId("game");
      if (target) {
        if (target.tabIndex < 0) target.tabIndex = -1;
        target.focus({ preventScroll: true });
      }
      returnFocus = null;
    }
  }

  document.addEventListener("keydown", (event) => {
    if (!activeModal) return;
    // Menu dialogs own their keystrokes; game shortcuts must not run behind them.
    if (menuVisible() && !["Escape", "Tab"].includes(event.key)) event.stopPropagation();
    if (event.key === "Escape") {
      let close = null;
      if (activeModal === help) close = () => help.close();
      else if (activeModal === overlay && menuVisible()) close = () => byId("btnOverlayMenu")?.click();
      else {
        const button = panels.find(([panel]) => panel === activeModal)?.[1];
        if (button) close = () => button.click();
      }
      if (close) {
        event.preventDefault();
        event.stopPropagation();
        close();
      }
    } else if (event.key === "Tab") {
      const items = focusable(activeModal);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || document.activeElement === activeModal || !activeModal.contains(document.activeElement)
        || (event.shiftKey && document.activeElement === first)
        || (!event.shiftKey && document.activeElement === last)) {
        event.preventDefault();
        (event.shiftKey ? last || activeModal : first || activeModal).focus();
      }
    }
  }, true);

  const observer = new MutationObserver((changes) => {
    if (changes.some(({ target }) => target === menu) && menuVisible()) {
      syncProgress();
      syncMode();
      if (quickDifficulty && difficulty) quickDifficulty.value = difficulty.value;
    }
    syncModals();
  });
  for (const node of [menu, overlay, help, ...panels.map(([panel]) => panel)].filter(Boolean)) {
    observer.observe(node, { attributes: true, attributeFilter: ["class", "open"] });
  }
  help?.addEventListener("close", syncModals);
  window.addEventListener("storage", (event) => {
    if (event.key === "cs_progress_v1" || event.key === null) syncProgress();
  });

  if (quickDifficulty && difficulty) quickDifficulty.value = difficulty.value;
  syncMode();
  syncProgress();
  syncSound();
  syncModals();
})();
