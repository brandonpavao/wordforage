/* --------------------------------------------------
   Infinite Connections
   Static GitHub Pages version with raccoon foraging.
-------------------------------------------------- */

const homeScreenEl = document.getElementById("homeScreen");
const playScreenEl = document.getElementById("playScreen");
const resultScreenEl = document.getElementById("resultScreen");
const graveyardScreenEl = document.getElementById("graveyardScreen");
const graveDetailScreenEl = document.getElementById("graveDetailScreen");

const homeMealTimerEl = document.getElementById("homeMealTimer");
const homeFeedBtn = document.getElementById("homeFeedBtn");
const homeFeedTextEl = document.getElementById("homeFeedText");
const homeFeedBadgeEl = document.getElementById("homeFeedBadge");
const homeStageLabelEl = document.getElementById("homeStageLabel");
const homeProgressFillEl = document.getElementById("homeProgressFill");
const homeProgressTextEl = document.getElementById("homeProgressText");
const homeNextStageEl = document.getElementById("homeNextStage");
const speechBubbleEl = document.getElementById("speechBubble");
const homeRaccoonSpriteEl = document.getElementById("homeRaccoonSprite");
const homeRaccoonNameEl = document.getElementById("homeRaccoonName");
const visitGravesBtn = document.getElementById("visitGravesBtn");

const livesEl = document.getElementById("lives");
const statusEl = document.getElementById("status");
const solvedEl = document.getElementById("solved");
const gridEl = document.getElementById("grid");
const sessionRaccoonSpriteEl = document.getElementById("sessionRaccoonSprite");
const sessionRaccoonNameEl = document.getElementById("sessionRaccoonName");
const sessionRewardEl = document.getElementById("sessionReward");

const resultHeartsEl = document.getElementById("resultHearts");
const resultMiniGridEl = document.getElementById("resultMiniGrid");
const resultTextEl = document.getElementById("resultText");
const resultFeedsEl = document.getElementById("resultFeeds");
const resultTimerEl = document.getElementById("resultTimer");
const resultHomeBtn = document.getElementById("resultHomeBtn");
const graveyardTitleEl = document.getElementById("graveyardTitle");
const graveyardCopyEl = document.getElementById("graveyardCopy");
const graveGridEl = document.getElementById("graveGrid");
const graveyardBackBtn = document.getElementById("graveyardBackBtn");
const graveDetailBackBtn = document.getElementById("graveDetailBackBtn");
const bouquetBtn = document.getElementById("bouquetBtn");
const graveFlowerCountEl = document.getElementById("graveFlowerCount");
const graveTextEl = document.getElementById("graveText");
const screenTransitionEl = document.getElementById("screenTransition");

const shuffleBtn = document.getElementById("shuffleBtn");
const submitBtn = document.getElementById("submitBtn");
const clearBtn = document.getElementById("clearBtn");
const nextBtn = document.getElementById("nextBtn");

const flashEl = document.getElementById("flash");
const toastEl = document.getElementById("toast");
const nameModalEl = document.getElementById("nameModal");
const raccoonNameInputEl = document.getElementById("raccoonNameInput");
const startForagingBtn = document.getElementById("startForagingBtn");

/* Dev mode UI disabled. Leave the ids here for later re-enable.
const devToggle = document.getElementById("devToggle");
const devMenu = document.getElementById("devMenu");
const devResetSessionBtn = document.getElementById("devResetSessionBtn");
const devResetRaccoonBtn = document.getElementById("devResetRaccoonBtn");
const devResetAllBtn = document.getElementById("devResetAllBtn");
const devAddProgressBtn = document.getElementById("devAddProgressBtn");
const devExplodeBtn = document.getElementById("devExplodeBtn");
const devOverfeedBtn = document.getElementById("devOverfeedBtn");
*/
const devToggle = null;
const devMenu = null;
const devResetSessionBtn = null;
const devResetRaccoonBtn = null;
const devResetAllBtn = null;
const devAddProgressBtn = null;
const devExplodeBtn = null;
const devOverfeedBtn = null;

const TIER_COLORS = {
  1: "#7dd87d",
  2: "#f9df6d",
  3: "#7aa7ff",
  4: "#c69cf2",
};

const MISTAKES_ALLOWED = 3;
const RACCOON_STORAGE_KEY = "infiniteConnectionsRaccoonStateV4";
const GRAVEYARD_STORAGE_KEY = "infiniteConnectionsGraveyardV1";
const MEAL_COOLDOWN_MS = 2 * 60 * 60 * 1000;

const ASSET_PATHS = {
  tomato: "Assets/tomato.png",
  heartFull: "Assets/heart-full.png",
  heartEmpty: "Assets/heart-empty.png",
  bouquet: "Assets/flowers.webp",
  grave: "Assets/grave.png",
  hole: "Assets/hole.png",
  sfx: {
    feed: "sfx/feed.mp3",
    wordSelection: "sfx/word-selection.mp3",
    wrongGuess: "sfx/wrong-guess.mp3",
    lostLevel: "sfx/lost-level.mp3",
    correctGuess: "sfx/correct-guess.mp3",
    wonLevel: "sfx/won-level.mp3",
    shuffle: "sfx/shuffle.mp3",
  },
  raccoon: {
    idle: "Assets/Raccoon/idle.png",
    full: "Assets/Raccoon/full.png",
    happy: "Assets/Raccoon/happy.png",
    sad: "Assets/Raccoon/sad.png",
    look: "Assets/Raccoon/look.png",
    explode: "Assets/Raccoon/sad.png",
  },
};

const STAGE_TIERS = [
  { tier: 1, goal: 100, stages: ["Infant", "Toddler", "Child", "Kid", "Preteen"] },
  { tier: 2, goal: 250, stages: ["Teen", "Young Adult", "Adult", "Mature Adult", "Professional"] },
  { tier: 3, goal: 500, stages: ["Executive", "Elite", "Veteran", "Elder", "Senior"] },
  { tier: 4, goal: 1000, stages: ["Grandparent", "Ancient", "Legendary", "Mythic", "Ancestry"] },
];

let tiles = [];
let puzzles = [];
let puzzleOrder = [];
let puzzlePointer = 0;
let currentGroups = [];
let currentTiers = {};
let groupByWord = {};
let board = [];
let selected = [];
let solvedGroups = [];
let attempted = new Set();
let mistakesUsed = 0;
let gameOver = false;
let won = false;
let puzzleCompleteWaitingForNext = false;
let currentView = "home";
let timerInterval = null;
let raccoonState = getDefaultRaccoonState();
let currentSession = getDefaultSession();
let lastResultSnapshot = null;
let graveyardState = getDefaultGraveyardState();
let pendingBurial = null;
let selectedGraveIndex = null;
let resetPuzzleAfterResult = false;
let speechBubbleInterval = null;
let speechBubbleStartTimeout = null;
let speechBubbleLookTimeout = null;
let speechBubbleLookInterval = null;
let speechBubbleTimeout = null;
let raccoonReactionTimeout = null;
let lookReactionTimeout = null;
let sessionSpeechTomatoesShown = 0;
let sessionHiKateShown = false;

function normalizeWord(word) {
  return String(word || "").trim().toUpperCase();
}

function shuffleArray(items) {
  const arr = [...items];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  return arr;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "\'": "&#39;",
    };

    return map[char] || char;
  });
}


function assetIcon(src, alt, className) {
  const safeSrc = escapeHtml(src);
  const safeAlt = escapeHtml(alt);
  const safeClass = escapeHtml(className);

  return `<img class="${safeClass}" src="${safeSrc}" alt="${safeAlt}" onerror="this.classList.add('assetMissing');" />`;
}

function tomatoIcon(className = "inlineIcon") {
  return assetIcon(ASSET_PATHS.tomato, "Tomato", className);
}

function heartIcon(isFull) {
  return assetIcon(isFull ? ASSET_PATHS.heartFull : ASSET_PATHS.heartEmpty, isFull ? "Life" : "Lost life", "heartIcon");
}

function bouquetIcon(className = "bouquetIcon") {
  return assetIcon(ASSET_PATHS.bouquet, "Bouquet", className);
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => toastEl.classList.remove("show"), 1200);
}

function playSfx(name, volume = 1) {
  const src = ASSET_PATHS.sfx[name];

  if (!src) {
    return;
  }

  const audio = new Audio(src);
  audio.volume = Math.max(0, Math.min(1, volume));
  audio.play().catch(() => {});
}

function preloadSfx() {
  Object.values(ASSET_PATHS.sfx).forEach((src) => {
    const audio = new Audio(src);
    audio.preload = "auto";
  });
}


function playScreenTransition() {
  if (!screenTransitionEl) {
    return;
  }

  screenTransitionEl.classList.remove("on");
  void screenTransitionEl.offsetWidth;
  screenTransitionEl.classList.add("on");
}

function isMealReadyForSpeech() {
  refreshMealCooldown();

  const now = Date.now();
  const target = Number(raccoonState.nextMealAt) || 0;
  const hasFeedsLeft = raccoonState.dailyFeeds < raccoonState.maxDailyFeeds;
  const mealReady = target === 0 || target <= now;

  return currentView === "home" && hasFeedsLeft && mealReady;
}

function getNextSpeechBubbleHtml(shouldAdvance) {
  let html = tomatoIcon("bubbleIcon");

  if (sessionSpeechTomatoesShown >= 5 && !sessionHiKateShown) {
    html = "Hi Kate";

    if (shouldAdvance) {
      sessionHiKateShown = true;
    }
  } else if (shouldAdvance) {
    sessionSpeechTomatoesShown += 1;
  }

  return html;
}

function triggerLookRaccoon() {
  if (!isMealReadyForSpeech() || currentView !== "home") {
    return;
  }

  if (raccoonState.dailyFeeds >= raccoonState.maxDailyFeeds) {
    return;
  }

  window.clearTimeout(lookReactionTimeout);
  raccoonState.currentReaction = "look";
  render();

  lookReactionTimeout = window.setTimeout(() => {
    if (raccoonState.currentReaction === "look") {
      raccoonState.currentReaction = "idle";
      render();
    }
  }, 1000);
}

function showTimedSpeechBubble() {
  if (!isMealReadyForSpeech()) {
    speechBubbleEl.classList.remove("show");
    return;
  }

  speechBubbleEl.innerHTML = getNextSpeechBubbleHtml(true);
  speechBubbleEl.classList.add("show");
  window.clearTimeout(speechBubbleTimeout);
  speechBubbleTimeout = window.setTimeout(() => speechBubbleEl.classList.remove("show"), 5000);
}

function startSpeechBubbleTimer() {
  if (speechBubbleInterval) {
    window.clearInterval(speechBubbleInterval);
  }

  if (speechBubbleLookInterval) {
    window.clearInterval(speechBubbleLookInterval);
  }

  if (speechBubbleStartTimeout) {
    window.clearTimeout(speechBubbleStartTimeout);
  }

  if (speechBubbleLookTimeout) {
    window.clearTimeout(speechBubbleLookTimeout);
  }

  speechBubbleEl.classList.remove("show");
  speechBubbleEl.innerHTML = "";

  speechBubbleLookTimeout = window.setTimeout(() => {
    triggerLookRaccoon();
    speechBubbleLookInterval = window.setInterval(triggerLookRaccoon, 69000);
  }, 34500);

  speechBubbleStartTimeout = window.setTimeout(() => {
    showTimedSpeechBubble();
    speechBubbleInterval = window.setInterval(showTimedSpeechBubble, 69000);
  }, 69000);
}

function advancePuzzleAfterForageResult() {
  if (!resetPuzzleAfterResult || !puzzleOrder.length) {
    return;
  }

  resetPuzzleAfterResult = false;
  puzzlePointer = (puzzlePointer + 1) % puzzleOrder.length;
}

function fitTileText(el, text) {
  const n = text.replace(/\s+/g, "").length;
  let pt = 16;
  let shrink = Math.max(0, n - 5);

  if (n >= 8) {
    shrink += 2;
  }

  pt = Math.max(9, pt - shrink);
  el.style.fontSize = `${pt}px`;
}

function getDefaultSession() {
  return {
    tomatoesEarned: 0,
    livesLost: 0,
    isOverfeed: false,
    ended: false,
  };
}

function getDefaultRaccoonState() {
  return {
    name: "",
    generation: 1,
    currentTier: 1,
    currentStage: "Infant",
    currentReaction: "idle",
    totalProgress: 0,
    tierProgress: 0,
    tierGoal: 100,
    dailyFeeds: 0,
    maxDailyFeeds: 3,
    nextMealAt: 0,
    isExploded: false,
    lastReward: "tomato",
    speechBubbleCycleIndex: 0,
    createdAt: new Date().toISOString(),
  };
}

function getDefaultGraveyardState() {
  return Array.from({ length: 16 }, () => null);
}

function loadGraveyardState() {
  const raw = window.localStorage.getItem(GRAVEYARD_STORAGE_KEY);
  let loadedState = getDefaultGraveyardState();

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        loadedState = getDefaultGraveyardState();
        for (let i = 0; i < Math.min(16, parsed.length); i++) {
          loadedState[i] = parsed[i] || null;
        }
      }
    } catch (error) {
      loadedState = getDefaultGraveyardState();
    }
  }

  graveyardState = loadedState;
}

function saveGraveyardState() {
  window.localStorage.setItem(GRAVEYARD_STORAGE_KEY, JSON.stringify(graveyardState.slice(0, 16)));
}

function formatGraveDate(value) {
  const date = value ? new Date(value) : new Date();
  let result = "Unknown";

  if (!Number.isNaN(date.getTime())) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    result = `${day}/${month}/${year}`;
  }

  return result;
}

function getRaccoonGraveRecord() {
  return {
    name: raccoonState.name || "Raccoon",
    generation: raccoonState.generation || 1,
    createdAt: raccoonState.createdAt || new Date().toISOString(),
    passedAt: new Date().toISOString(),
    ageTier: raccoonState.currentStage || "Infant",
    totalProgress: raccoonState.totalProgress || 0,
    flowers: 0,
  };
}

function loadRaccoonState() {
  const raw = window.localStorage.getItem(RACCOON_STORAGE_KEY);
  let loadedState = getDefaultRaccoonState();

  if (raw) {
    try {
      loadedState = { ...loadedState, ...JSON.parse(raw) };
    } catch (error) {
      loadedState = getDefaultRaccoonState();
    }
  }

  raccoonState = loadedState;
}

function saveRaccoonState() {
  window.localStorage.setItem(RACCOON_STORAGE_KEY, JSON.stringify(raccoonState));
}

function clearRaccoonState() {
  window.localStorage.removeItem(RACCOON_STORAGE_KEY);
  raccoonState = getDefaultRaccoonState();
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");

  return `${h}:${m}:${s}`;
}

function getMealResetText() {
  const now = Date.now();
  const target = Number(raccoonState.nextMealAt) || 0;
  let result = "New meal ready";

  if (target > now) {
    result = `New meal in ${formatCountdown(target - now)}`;
  }

  return result;
}

function getFeedButtonCounterText() {
  const feedsUsed = Math.max(0, Number(raccoonState.dailyFeeds) || 0);
  const maxFeeds = Math.max(1, Number(raccoonState.maxDailyFeeds) || 3);
  const feedsLeft = Math.max(0, maxFeeds - feedsUsed);
  let result = `${feedsLeft} / ${maxFeeds}`;

  if (feedsLeft <= 0) {
    result = "Overfeed?";
  }

  return result;
}

function getFeedsRemaining() {
  return Math.max(0, raccoonState.maxDailyFeeds - raccoonState.dailyFeeds);
}

function refreshMealCooldown() {
  const now = Date.now();

  if (raccoonState.dailyFeeds > 0 && raccoonState.dailyFeeds < raccoonState.maxDailyFeeds && raccoonState.nextMealAt > 0 && now >= raccoonState.nextMealAt) {
    raccoonState.dailyFeeds = Math.max(0, raccoonState.dailyFeeds - 1);
    raccoonState.nextMealAt = raccoonState.dailyFeeds > 0 ? now + MEAL_COOLDOWN_MS : 0;
    saveRaccoonState();
  }
}

function getStageLocation(stage) {
  let location = { tierIndex: 0, stageIndex: 0 };

  for (let tierIndex = 0; tierIndex < STAGE_TIERS.length; tierIndex++) {
    const stageIndex = STAGE_TIERS[tierIndex].stages.indexOf(stage);

    if (stageIndex >= 0) {
      location = { tierIndex, stageIndex };
      break;
    }
  }

  return location;
}

function getNextStageName() {
  const location = getStageLocation(raccoonState.currentStage);
  const tierConfig = STAGE_TIERS[location.tierIndex];
  let result = "???";

  if (location.stageIndex >= tierConfig.stages.length - 1 && location.tierIndex >= STAGE_TIERS.length - 1) {
    result = "∞";
  }

  return result;
}

function getRaccoonAsset(reaction) {
  return ASSET_PATHS.raccoon[reaction] || ASSET_PATHS.raccoon.idle;
}

function getRaccoonFallback(reaction) {
  return `${reaction || "idle"} raccoon image missing`;
}

function renderRaccoonSprite(el, reaction) {
  const safeReaction = reaction || "idle";
  const src = getRaccoonAsset(safeReaction);
  const fallback = getRaccoonFallback(safeReaction);

  el.className = el.classList.contains("sessionRaccoon")
    ? `sessionRaccoon ${safeReaction}`
    : `bigRaccoon ${safeReaction}`;

  el.innerHTML = `
    <img class="raccoonImage" src="${src}" alt="${safeReaction} raccoon" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
    <span class="raccoonFallback">${fallback}</span>
  `;
}

function setTemporaryRaccoonReaction(reaction, durationMs = 5000) {
  window.clearTimeout(raccoonReactionTimeout);
  raccoonState.currentReaction = reaction;
  saveRaccoonState();
  render();

  raccoonReactionTimeout = window.setTimeout(() => {
    if (currentView === "play" && !gameOver && !puzzleCompleteWaitingForNext) {
      raccoonState.currentReaction = "idle";
      saveRaccoonState();
      render();
    }
  }, durationMs);
}

function ensureTiles() {
  if (tiles.length === 16) {
    return;
  }

  gridEl.innerHTML = "";
  tiles = [];

  for (let i = 0; i < 16; i++) {
    const tile = document.createElement("button");
    tile.className = "tile";
    tile.type = "button";
    tile.textContent = "WORD";
    tile.addEventListener("click", () => onTileClick(i));
    tiles.push(tile);
    gridEl.appendChild(tile);
  }
}

function puzzleToGroups(puzzle) {
  const groups = [];
  const tiers = {};

  for (const group of puzzle.groups || []) {
    const name = normalizeWord(group.name);
    const tier = Number.parseInt(group.tier, 10) || 0;
    const words = (group.words || []).map(normalizeWord);

    if (!name || words.length !== 4) {
      continue;
    }

    groups.push({ name, words });
    tiers[name] = tier;
  }

  return { groups, tiers };
}

function validateGroups(groups) {
  if (groups.length !== 4) {
    return false;
  }

  const seen = new Set();

  for (const group of groups) {
    for (const word of group.words) {
      if (!word || seen.has(word)) {
        return false;
      }

      seen.add(word);
    }
  }

  return seen.size === 16;
}

function loadPuzzleByPointer() {
  if (!puzzles.length) {
    throw new Error("No puzzles found in puzzles_generated.json");
  }

  let attempts = 0;

  while (attempts < puzzles.length) {
    const puzzleIndex = puzzleOrder[puzzlePointer % puzzleOrder.length];
    const puzzle = puzzles[puzzleIndex];
    const parsed = puzzleToGroups(puzzle);

    if (validateGroups(parsed.groups)) {
      currentGroups = parsed.groups;
      currentTiers = parsed.tiers;
      groupByWord = {};

      const allWords = [];

      for (const group of currentGroups) {
        for (const word of group.words) {
          groupByWord[word] = group.name;
          allWords.push(word);
        }
      }

      board = shuffleArray(allWords);
      selected = [];
      solvedGroups = [];
      attempted = new Set();
      gameOver = false;
      won = false;
      puzzleCompleteWaitingForNext = false;
      render();
      return;
    }

    puzzlePointer = (puzzlePointer + 1) % puzzleOrder.length;
    attempts += 1;
  }

  throw new Error("No valid puzzles found. Each puzzle needs 4 groups and 16 unique words.");
}

function publicState() {
  const solvedBars = solvedGroups.map((name) => {
    const tier = currentTiers[name] || 0;
    const group = currentGroups.find((item) => item.name === name);

    return {
      name,
      tier,
      tier_color: TIER_COLORS[tier] || "#63a7ff",
      words: group ? group.words : [],
      solved: true,
    };
  });

  const revealBars = [];

  if (gameOver && !won) {
    for (const group of currentGroups) {
      if (!solvedGroups.includes(group.name)) {
        const tier = currentTiers[group.name] || 0;

        revealBars.push({
          name: group.name,
          tier,
          tier_color: TIER_COLORS[tier] || "#63a7ff",
          words: group.words,
          solved: false,
        });
      }
    }
  }

  return {
    board,
    selected,
    mistakes_allowed: MISTAKES_ALLOWED,
    mistakes_used: mistakesUsed,
    remaining_lives: MISTAKES_ALLOWED - mistakesUsed,
    game_over: gameOver,
    won,
    solved_groups: solvedBars,
    reveal_groups: revealBars,
  };
}

function setView(view) {
  if (currentView !== view) {
    playScreenTransition();
  }

  currentView = view;
  homeScreenEl.classList.toggle("active", view === "home");
  playScreenEl.classList.toggle("active", view === "play");
  resultScreenEl.classList.toggle("active", view === "result");
  graveyardScreenEl.classList.toggle("active", view === "graveyard");
  graveDetailScreenEl.classList.toggle("active", view === "graveDetail");
}

function toggleSelect(index) {
  if (gameOver || puzzleCompleteWaitingForNext || index < 0 || index >= board.length) {
    return;
  }

  const word = board[index];
  const groupName = groupByWord[word];

  if (solvedGroups.includes(groupName)) {
    return;
  }

  if (selected.includes(index)) {
    selected = selected.filter((item) => item !== index);
  } else if (selected.length < 4) {
    selected.push(index);
  }
}

function clearSelection() {
  selected = [];
}

function submitGuess() {
  let result = {
    status: "",
    message: "",
    flash: null,
    shake: false,
  };

  if (!raccoonState.name) {
    result.status = "no_raccoon";
    result.message = "Name your raccoon first.";
    openNameModal();
    return result;
  }

  if (gameOver || puzzleCompleteWaitingForNext) {
    result.status = "waiting";
    result.message = "Press Next.";
    return result;
  }

  if (selected.length !== 4) {
    result.status = "invalid";
    result.message = "Select exactly 4 tiles.";
    return result;
  }

  const selectedWords = selected.map((index) => board[index]);
  const key = selectedWords.slice().sort().join("|");

  if (attempted.has(key)) {
    result.status = "repeat";
    result.message = "Already guessed!";
    return result;
  }

  attempted.add(key);

  const counts = {};

  for (const word of selectedWords) {
    const groupName = groupByWord[word];

    if (!solvedGroups.includes(groupName)) {
      counts[groupName] = (counts[groupName] || 0) + 1;
    }
  }

  for (const [groupName, count] of Object.entries(counts)) {
    if (count === 4) {
      solvedGroups.push(groupName);
      currentSession.tomatoesEarned += 1;
      clearSelection();
      setTemporaryRaccoonReaction("happy", 2500);

      const tier = currentTiers[groupName] || 0;
      result.status = "correct";
      result.flash = TIER_COLORS[tier] || "#63a7ff";
      result.message = "Correct.";

      if (solvedGroups.length === 4) {
        completePuzzle(result);
      }

      saveRaccoonState();
      return result;
    }
  }

  mistakesUsed += 1;
  currentSession.livesLost += 1;
  clearSelection();

  result.status = Object.values(counts).some((count) => count === 3) ? "one_away" : "incorrect";
  result.message = result.status === "one_away" ? "One away." : "Incorrect.";
  result.flash = "#ff3b30";
  result.shake = true;

  if (mistakesUsed < MISTAKES_ALLOWED) {
    setTemporaryRaccoonReaction("sad", 2500);
  }

  if (mistakesUsed >= MISTAKES_ALLOWED) {
    endForagingSession(false);
  }

  saveRaccoonState();
  return result;
}

function completePuzzle(result) {
  applyRaccoonProgress(4);
  gameOver = true;
  won = true;
  puzzleCompleteWaitingForNext = true;
  raccoonState.currentReaction = "happy";
  result.status = "puzzle_complete";
  result.message = "Correct.";

  if (currentSession.isOverfeed) {
    endForagingSession(true);
  }
}

function endForagingSession(didCompletePuzzle) {
  currentSession.ended = true;
  gameOver = true;
  won = Boolean(didCompletePuzzle);
  puzzleCompleteWaitingForNext = false;

  if (!didCompletePuzzle) {
    applyRaccoonProgress(currentSession.tomatoesEarned);
    raccoonState.currentReaction = "sad";
  }

  resetPuzzleAfterResult = true;

  lastResultSnapshot = {
    tomatoesEarned: currentSession.tomatoesEarned,
    feedsRemaining: getFeedsRemaining(),
    didCompletePuzzle,
    isOverfeed: currentSession.isOverfeed,
  };

  saveRaccoonState();

  setView("result");
  render();
}

function applyRaccoonProgress(amount) {
  const earned = Math.max(0, Number(amount) || 0);

  if (earned > 0) {
    raccoonState.tierProgress += earned;
    raccoonState.totalProgress += earned;
    raccoonState.currentReaction = "happy";
  }

  raccoonState.lastReward = "tomato";
  checkEvolution();
  saveRaccoonState();
}

function checkEvolution() {
  let safety = 0;

  while (raccoonState.tierProgress >= raccoonState.tierGoal && safety < 30) {
    const location = getStageLocation(raccoonState.currentStage);
    const currentTierConfig = STAGE_TIERS[location.tierIndex];

    raccoonState.tierProgress -= raccoonState.tierGoal;

    if (location.stageIndex < currentTierConfig.stages.length - 1) {
      raccoonState.currentStage = currentTierConfig.stages[location.stageIndex + 1];
      raccoonState.currentTier = currentTierConfig.tier;
      raccoonState.tierGoal = currentTierConfig.goal;
    } else if (location.tierIndex < STAGE_TIERS.length - 1) {
      const nextTierConfig = STAGE_TIERS[location.tierIndex + 1];
      raccoonState.currentTier = nextTierConfig.tier;
      raccoonState.currentStage = nextTierConfig.stages[0];
      raccoonState.tierGoal = nextTierConfig.goal;
    } else {
      raccoonState.currentStage = "Ancestry";
      raccoonState.tierProgress = raccoonState.tierGoal;
      break;
    }

    safety += 1;
  }
}

function startFeedSession(options = {}) {
  if (!raccoonState.name) {
    openNameModal();
    return;
  }

  refreshMealCooldown();

  const isOverfeed = Boolean(options.isOverfeed);

  if (!isOverfeed) {
    raccoonState.dailyFeeds += 1;
    raccoonState.nextMealAt = Date.now() + MEAL_COOLDOWN_MS;
  }

  window.clearTimeout(raccoonReactionTimeout);
  window.clearTimeout(lookReactionTimeout);
  raccoonState.currentReaction = "idle";
  saveRaccoonState();

  currentSession = getDefaultSession();
  currentSession.isOverfeed = isOverfeed;
  mistakesUsed = 0;
  selected = [];
  solvedGroups = [];
  attempted = new Set();
  gameOver = false;
  won = false;
  puzzleCompleteWaitingForNext = false;
  lastResultSnapshot = null;

  setView("play");
  loadPuzzleByPointer();
  showToast(isOverfeed ? "Overfeed started." : "Foraging started.");
}

function handleHomeFeed() {
  refreshMealCooldown();

  if (!raccoonState.name) {
    openNameModal();
    return;
  }

  playSfx("feed");

  if (raccoonState.dailyFeeds >= raccoonState.maxDailyFeeds) {
    startFeedSession({ isOverfeed: true });
    return;
  }

  startFeedSession({ isOverfeed: false });
}

function loadNextPuzzleAfterSuccess() {
  if (!puzzleCompleteWaitingForNext) {
    return;
  }

  puzzlePointer = (puzzlePointer + 1) % puzzleOrder.length;
  loadPuzzleByPointer();
  showToast("Next puzzle.");
}

function triggerRaccoonExplosion() {
  pendingBurial = getRaccoonGraveRecord();
  raccoonState.currentReaction = "explode";
  raccoonState.isExploded = true;
  saveRaccoonState();
  render();
  showToast("Overfed.");

  window.setTimeout(() => {
    openBurialScreen();
  }, 900);
}

function openBurialScreen() {
  graveyardTitleEl.textContent = `${pendingBurial.name} has passed.`;
  graveyardCopyEl.textContent = "Gone too soon.";
  setView("graveyard");
  render();
}

function openGraveyard() {
  pendingBurial = null;
  graveyardTitleEl.textContent = "Graveyard";
  graveyardCopyEl.textContent = "Gone too soon.";
  setView("graveyard");
  render();
}

function buryPendingRaccoon(index) {
  if (!pendingBurial) {
    return;
  }

  graveyardState[index] = pendingBurial;
  saveGraveyardState();
  renderGraveyard();
  showToast(`${pendingBurial.name} rests here.`);

  window.setTimeout(() => {
    const nextGeneration = (raccoonState.generation || 1) + 1;
    clearRaccoonState();
    raccoonState.generation = nextGeneration;
    raccoonState.createdAt = new Date().toISOString();
    saveRaccoonState();
    pendingBurial = null;
    setView("home");
    render();
    openNameModal();
  }, 1200);
}

function openGraveDetail(index) {
  const grave = graveyardState[index];

  if (!grave) {
    return;
  }

  selectedGraveIndex = index;

  const name = escapeHtml(grave.name || "Raccoon");
  const createdAt = escapeHtml(formatGraveDate(grave.createdAt));
  const passedAt = escapeHtml(formatGraveDate(grave.passedAt));
  const ageTier = escapeHtml(grave.ageTier || "Infant");
  const flowers = Math.max(0, Number(grave.flowers) || 0);

  if (graveFlowerCountEl) {
    graveFlowerCountEl.textContent = `Flowers: ${flowers}`;
  }

  graveTextEl.innerHTML = `
    <div class="graveRipHeader">RIP</div>
    <div class="graveLargeName">${name}</div>
    <div class="graveDates">${createdAt} - ${passedAt}</div>
    <div class="graveLoving">loving ${ageTier}</div>
  `;

  setView("graveDetail");
  render();
}

function handleGraveSlotClick(index) {
  if (pendingBurial) {
    buryPendingRaccoon(index);
    return;
  }

  if (graveyardState[index]) {
    openGraveDetail(index);
  }
}

function renderGraveyard() {
  graveyardBackBtn.classList.toggle("hidden", Boolean(pendingBurial));
  graveGridEl.innerHTML = "";

  for (let i = 0; i < 16; i++) {
    const grave = graveyardState[i];
    const slot = document.createElement("button");
    slot.className = grave ? "graveSlot hasGrave" : "graveSlot";
    slot.type = "button";
    slot.addEventListener("click", () => handleGraveSlotClick(i));

    const img = document.createElement("img");
    img.src = grave ? ASSET_PATHS.grave : ASSET_PATHS.hole;
    img.alt = grave ? `${grave.name} grave` : "Empty grave spot";
    slot.appendChild(img);

    if (grave) {
      const label = document.createElement("div");
      label.className = "graveName";
      label.textContent = grave.name;
      slot.appendChild(label);
    }

    graveGridEl.appendChild(slot);
  }
}

function renderHearts(targetEl, remainingLives) {
  targetEl.innerHTML = "";

  for (let i = 0; i < MISTAKES_ALLOWED; i++) {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.innerHTML = heartIcon(i < remainingLives);
    targetEl.appendChild(heart);
  }
}

function renderSolvedBars(state) {
  solvedEl.innerHTML = "";
  const bars = [...(state.solved_groups || []), ...(state.reveal_groups || [])];

  for (const barData of bars) {
    const bar = document.createElement("div");
    bar.className = "groupBar";
    bar.style.borderColor = barData.solved ? barData.tier_color : "#ff3b30";

    const title = document.createElement("div");
    title.className = "groupTitle";
    title.style.color = barData.solved ? barData.tier_color : "#ff3b30";
    title.textContent = barData.name;

    const words = document.createElement("div");
    words.className = "groupWords";
    words.textContent = (barData.words || []).join("  •  ");

    bar.appendChild(title);
    bar.appendChild(words);
    solvedEl.appendChild(bar);
  }
}

function renderBoard(state) {
  ensureTiles();

  const tierColorByWord = {};

  for (const solvedBar of state.solved_groups || []) {
    for (const word of solvedBar.words || []) {
      tierColorByWord[word] = solvedBar.tier_color;
    }
  }

  for (let i = 0; i < 16; i++) {
    const word = state.board[i] || "";
    const tile = tiles[i];

    tile.textContent = word;
    fitTileText(tile, word);
    tile.classList.remove("selected", "disabled");
    tile.style.borderColor = "";

    if ((state.selected || []).includes(i)) {
      tile.classList.add("selected");
    }

    const isSolvedWord = Boolean(tierColorByWord[word]);

    if (state.game_over || puzzleCompleteWaitingForNext || isSolvedWord || !raccoonState.name) {
      tile.classList.add("disabled");
    }

    if (isSolvedWord) {
      tile.style.borderColor = tierColorByWord[word];
    }
  }

  const boardLocked = state.game_over || puzzleCompleteWaitingForNext || !raccoonState.name;
  shuffleBtn.disabled = boardLocked;
  submitBtn.disabled = boardLocked || (state.selected || []).length !== 4;
  clearBtn.disabled = boardLocked || (state.selected || []).length === 0;
  nextBtn.classList.toggle("hidden", !puzzleCompleteWaitingForNext);
}


function shuffleCurrentBoard() {
  if (gameOver || puzzleCompleteWaitingForNext || !raccoonState.name) {
    return;
  }

  playSfx("shuffle");

  const activeIndices = [];
  const activeWords = [];

  for (let i = 0; i < board.length; i++) {
    const word = board[i];
    const groupName = groupByWord[word];

    if (!solvedGroups.includes(groupName)) {
      activeIndices.push(i);
      activeWords.push(word);
    }
  }

  const shuffledWords = shuffleArray(activeWords);

  for (let i = 0; i < activeIndices.length; i++) {
    board[activeIndices[i]] = shuffledWords[i];
  }

  selected = [];
  render();
}

function renderProgress() {
  const tierColor = TIER_COLORS[raccoonState.currentTier] || "#63a7ff";
  const percent = raccoonState.tierGoal > 0
    ? Math.min(100, (raccoonState.tierProgress / raccoonState.tierGoal) * 100)
    : 100;

  homeStageLabelEl.textContent = raccoonState.currentStage;
  homeProgressFillEl.style.width = `${percent}%`;
  homeProgressFillEl.style.background = tierColor;
  homeProgressTextEl.textContent = raccoonState.currentStage === "Ancestry" ? "∞" : `${raccoonState.tierProgress} / ${raccoonState.tierGoal}`;
  homeNextStageEl.textContent = getNextStageName();
}

function renderHome() {
  refreshMealCooldown();

  const isOverfeed = raccoonState.dailyFeeds >= raccoonState.maxDailyFeeds;
  const reaction = "idle";

  homeMealTimerEl.textContent = raccoonState.dailyFeeds > 0 ? getMealResetText() : "New meal ready";
  homeFeedTextEl.innerHTML = isOverfeed
    ? "Overkill"
    : `Feed ${tomatoIcon("feedButtonTomatoIcon")}`;
  homeFeedBadgeEl.textContent = getFeedButtonCounterText();
  homeFeedBtn.classList.toggle("overfeed", isOverfeed);
  speechBubbleEl.classList.toggle("danger", isOverfeed);
  if (!isMealReadyForSpeech()) {
    speechBubbleEl.classList.remove("show");
    speechBubbleEl.innerHTML = "";
  }

  renderRaccoonSprite(homeRaccoonSpriteEl, reaction);
  homeRaccoonNameEl.textContent = raccoonState.name || "Name";
  renderProgress();
}

function renderPlay(state) {
  let statusText = "Select 4 tiles and submit.";

  if (currentSession.isOverfeed) {
    statusText = "Overfeed foraging.";
  }

  if (puzzleCompleteWaitingForNext) {
    statusText = `Puzzle complete. ${raccoonState.name} got tomatoes x ${currentSession.tomatoesEarned}.`;
  }

  statusEl.textContent = statusText;
  renderHearts(livesEl, state.remaining_lives);
  renderSolvedBars(state);
  renderBoard(state);

  const reaction = raccoonState.currentReaction || "idle";
  renderRaccoonSprite(sessionRaccoonSpriteEl, reaction);
  sessionRaccoonNameEl.textContent = raccoonState.name || "Raccoon";
  sessionRewardEl.innerHTML = `${tomatoIcon("rewardIcon")} +${currentSession.tomatoesEarned}`;
}

function renderResultCategoryReveal() {
  resultMiniGridEl.innerHTML = "";

  for (const group of currentGroups) {
    const tier = currentTiers[group.name] || 0;
    const tierColor = TIER_COLORS[tier] || "#63a7ff";
    const isSolved = solvedGroups.includes(group.name);

    const bar = document.createElement("div");
    bar.className = isSolved ? "resultGroupBar" : "resultGroupBar revealed";
    bar.style.borderColor = tierColor;

    const title = document.createElement("div");
    title.className = "resultGroupTitle";
    title.style.color = tierColor;
    title.textContent = group.name;

    const words = document.createElement("div");
    words.className = "resultGroupWords";
    words.textContent = (group.words || []).join("  •  ");

    bar.appendChild(title);
    bar.appendChild(words);
    resultMiniGridEl.appendChild(bar);
  }
}

function renderResult() {
  const snapshot = lastResultSnapshot || {
    tomatoesEarned: currentSession.tomatoesEarned,
    feedsRemaining: getFeedsRemaining(),
    didCompletePuzzle: won,
    isOverfeed: currentSession.isOverfeed,
  };

  renderHearts(resultHeartsEl, Math.max(0, MISTAKES_ALLOWED - mistakesUsed));
  renderResultCategoryReveal();

  resultTextEl.innerHTML = `Foraging over. ${escapeHtml(raccoonState.name || "Raccoon")} got ${tomatoIcon("inlineIcon")} x ${snapshot.tomatoesEarned}`;
  resultFeedsEl.textContent = `Feeds remaining: ${snapshot.feedsRemaining}`;
  resultTimerEl.textContent = `Meals reset in ${formatCountdown(Math.max(0, (Number(raccoonState.nextMealAt) || Date.now()) - Date.now()))}`;
  resultHomeBtn.textContent = `Back to ${raccoonState.name || "raccoon"}`;
}

function render(lastResult = null) {
  const state = publicState();

  if (currentView === "home") {
    renderHome();
  }

  if (currentView === "play") {
    renderPlay(state);
  }

  if (currentView === "result") {
    renderResult();
  }

  if (currentView === "graveyard") {
    renderGraveyard();
  }

  if (lastResult) {
    if (["correct", "one_away", "incorrect", "repeat"].includes(lastResult.status)) {
      showToast(lastResult.message || "...");
    }

    if (lastResult.flash) {
      flashEl.style.background = lastResult.flash;
      flashEl.classList.remove("on");
      void flashEl.offsetWidth;
      flashEl.classList.add("on");
    }

    if (lastResult.shake) {
      gridEl.classList.remove("shake");
      void gridEl.offsetWidth;
      gridEl.classList.add("shake");
    }
  }
}

function openNameModal() {
  speechBubbleEl.classList.remove("show");
  speechBubbleEl.innerHTML = "";
  nameModalEl.classList.add("open");
  nameModalEl.setAttribute("aria-hidden", "false");
  raccoonNameInputEl.value = "";
  window.setTimeout(() => raccoonNameInputEl.focus(), 50);
}

function closeNameModal() {
  nameModalEl.classList.remove("open");
  nameModalEl.setAttribute("aria-hidden", "true");
}

function createRaccoon(name) {
  const cleanName = String(name || "").trim().slice(0, 20);

  if (!cleanName) {
    showToast("Enter a raccoon name.");
    return;
  }

  const generation = raccoonState.generation || 1;
  raccoonState = getDefaultRaccoonState();
  raccoonState.name = cleanName;
  raccoonState.generation = generation;
  raccoonState.createdAt = new Date().toISOString();
  saveRaccoonState();
  closeNameModal();
  setView("home");
  render();
}

function resetCurrentSession() {
  currentSession = getDefaultSession();
  mistakesUsed = 0;
  selected = [];
  solvedGroups = [];
  attempted = new Set();
  gameOver = false;
  won = false;
  puzzleCompleteWaitingForNext = false;
  resetPuzzleAfterResult = false;
  window.clearTimeout(raccoonReactionTimeout);
  window.clearTimeout(lookReactionTimeout);
  raccoonState.currentReaction = "idle";
  saveRaccoonState();

  if (currentView === "play") {
    loadPuzzleByPointer();
  } else {
    render();
  }

  showToast("Session reset.");
}

function resetRaccoonProgress() {
  const name = raccoonState.name;
  const generation = raccoonState.generation;
  const dailyFeeds = raccoonState.dailyFeeds;
  const nextMealAt = raccoonState.nextMealAt;

  raccoonState = getDefaultRaccoonState();
  raccoonState.name = name;
  raccoonState.generation = generation;
  raccoonState.dailyFeeds = dailyFeeds;
  raccoonState.nextMealAt = nextMealAt;
  saveRaccoonState();
  render();
  showToast("Raccoon reset.");
}

function resetAllRaccoonData() {
  clearRaccoonState();
  graveyardState = getDefaultGraveyardState();
  saveGraveyardState();
  currentSession = getDefaultSession();
  mistakesUsed = 0;
  selected = [];
  solvedGroups = [];
  attempted = new Set();
  gameOver = false;
  won = false;
  puzzleCompleteWaitingForNext = false;
  resetPuzzleAfterResult = false;
  setView("home");
  render();
  openNameModal();
  showToast("All data reset.");
}

function addDevProgress(amount) {
  applyRaccoonProgress(amount);
  raccoonState.currentReaction = "happy";
  saveRaccoonState();
  render();
  showToast(`Added ${amount} progress.`);
}

function onTileClick(index) {
  const previousSelection = selected.slice();
  toggleSelect(index);

  if (previousSelection.join("|") !== selected.join("|")) {
    playSfx("wordSelection");
  }

  render();
}

function onSubmit() {
  const result = submitGuess();

  if (result.status === "puzzle_complete") {
    playSfx("wonLevel");
  } else if (result.status === "correct") {
    playSfx("correctGuess");
  } else if (result.status === "incorrect" || result.status === "one_away") {
    playSfx(currentSession.ended && !won ? "lostLevel" : "wrongGuess");
  }

  render(result);
}

function onClear() {
  clearSelection();
  render();
}

function onResultHome() {
  advancePuzzleAfterForageResult();

  if (lastResultSnapshot && lastResultSnapshot.isOverfeed) {
    triggerRaccoonExplosion();
    return;
  }

  raccoonState.currentReaction = currentSession.ended && currentSession.tomatoesEarned > 0 ? "happy" : "idle";
  saveRaccoonState();
  setView("home");
  render();
}

function spawnBouquetHearts() {
  const card = document.querySelector(".graveDetailCard");

  if (!card) {
    return;
  }

  if (selectedGraveIndex !== null && graveyardState[selectedGraveIndex]) {
    const currentFlowers = Math.max(0, Number(graveyardState[selectedGraveIndex].flowers) || 0);
    graveyardState[selectedGraveIndex].flowers = currentFlowers + 1;
    saveGraveyardState();

    if (graveFlowerCountEl) {
      graveFlowerCountEl.textContent = `Flowers: ${graveyardState[selectedGraveIndex].flowers}`;
    }
  }

  for (let i = 0; i < 12; i++) {
    const heart = document.createElement("span");
    heart.className = "graveHeart";
    heart.innerHTML = heartIcon(true);
    heart.style.left = `${35 + Math.random() * 30}%`;
    heart.style.top = `${32 + Math.random() * 30}%`;
    heart.style.animationDelay = `${Math.random() * 120}ms`;
    card.appendChild(heart);
    window.setTimeout(() => heart.remove(), 1300);
  }
}

function onGraveyardBack() {
  if (pendingBurial) {
    return;
  }

  setView("home");
  render();
}

function onGraveDetailBack() {
  selectedGraveIndex = null;
  setView("graveyard");
  render();
}

function startTimer() {
  if (timerInterval) {
    window.clearInterval(timerInterval);
  }

  timerInterval = window.setInterval(() => {
    refreshMealCooldown();
    render();
  }, 1000);
}

async function boot() {
  ensureTiles();
  preloadSfx();
  loadRaccoonState();
  loadGraveyardState();
  refreshMealCooldown();
  setView("home");
  submitBtn.disabled = true;
  clearBtn.disabled = true;

  try {
    const response = await fetch("puzzles_generated.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Could not load puzzles_generated.json");
    }

    puzzles = await response.json();

    if (!Array.isArray(puzzles) || puzzles.length === 0) {
      throw new Error("puzzles_generated.json has no puzzles.");
    }

    puzzleOrder = shuffleArray(puzzles.map((_, index) => index));
    puzzlePointer = Math.floor(Math.random() * puzzleOrder.length);

    render();

    if (!raccoonState.name || raccoonState.isExploded) {
      openNameModal();
    }

    startTimer();
    startSpeechBubbleTimer();
  } catch (error) {
    showToast(error.message);
  }
}

homeFeedBtn.addEventListener("click", handleHomeFeed);
visitGravesBtn.addEventListener("click", openGraveyard);
shuffleBtn.addEventListener("click", shuffleCurrentBoard);
submitBtn.addEventListener("click", onSubmit);
clearBtn.addEventListener("click", onClear);
nextBtn.addEventListener("click", loadNextPuzzleAfterSuccess);
resultHomeBtn.addEventListener("click", onResultHome);
graveyardBackBtn.addEventListener("click", onGraveyardBack);
graveDetailBackBtn.addEventListener("click", onGraveDetailBack);
bouquetBtn.innerHTML = bouquetIcon("bouquetIcon");
bouquetBtn.addEventListener("click", spawnBouquetHearts);
startForagingBtn.addEventListener("click", () => createRaccoon(raccoonNameInputEl.value));
raccoonNameInputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    createRaccoon(raccoonNameInputEl.value);
  }
});

/* Dev mode UI event wiring disabled. Keep this block for later re-enable.
if (devToggle && devMenu) {
  devToggle.addEventListener("click", () => {
    devMenu.classList.toggle("open");
    devMenu.setAttribute("aria-hidden", devMenu.classList.contains("open") ? "false" : "true");
  });
}

if (devResetSessionBtn) devResetSessionBtn.addEventListener("click", resetCurrentSession);
if (devResetRaccoonBtn) devResetRaccoonBtn.addEventListener("click", resetRaccoonProgress);
if (devResetAllBtn) devResetAllBtn.addEventListener("click", resetAllRaccoonData);
if (devAddProgressBtn) devAddProgressBtn.addEventListener("click", () => addDevProgress(25));
if (devExplodeBtn) devExplodeBtn.addEventListener("click", triggerRaccoonExplosion);
if (devOverfeedBtn) devOverfeedBtn.addEventListener("click", () => startFeedSession({ isOverfeed: true }));
*/

window.devResetSession = resetCurrentSession;
window.devResetRaccoon = resetRaccoonProgress;
window.devResetAll = resetAllRaccoonData;
window.devAddProgress = addDevProgress;
window.devExplode = triggerRaccoonExplosion;
window.devStartOverfeedSession = () => startFeedSession({ isOverfeed: true });

boot();
