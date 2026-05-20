/* --------------------------------------------------
   Infinite Connections - static GitHub Pages version
   Python Flask logic converted into browser JavaScript.
-------------------------------------------------- */

const gridEl = document.getElementById("grid");
const solvedEl = document.getElementById("solved");
const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const flashEl = document.getElementById("flash");
const toastEl = document.getElementById("toast");

const submitBtn = document.getElementById("submitBtn");
const clearBtn = document.getElementById("clearBtn");
const nextBtn = document.getElementById("nextBtn");

const TIER_COLORS = {
  1: "#f9df6d",
  2: "#a0c35a",
  3: "#7aa7ff",
  4: "#c69cf2",
};

const MISTAKES_ALLOWED = 4;

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
let score = 0;
let resetScoreOnNext = false;

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

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => toastEl.classList.remove("show"), 900);
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
      mistakesUsed = 0;
      gameOver = false;
      won = false;
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
    score,
    mistakes_allowed: MISTAKES_ALLOWED,
    mistakes_used: mistakesUsed,
    remaining_lives: MISTAKES_ALLOWED - mistakesUsed,
    game_over: gameOver,
    won,
    solved_groups: solvedBars,
    reveal_groups: revealBars,
  };
}

function applyScore(delta) {
  score += delta;

  if (score < 0) {
    score = 0;
  }
}

function toggleSelect(index) {
  if (gameOver || index < 0 || index >= board.length) {
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
    solved_group: null,
    flash: null,
    shake: false,
    score_delta: 0,
    selected_idxs: [...selected],
  };

  if (gameOver) {
    result.status = "game_over";
    result.message = "Game is over.";
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
    result.message = "You already tried that group.";
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
      clearSelection();

      const tier = currentTiers[groupName] || 0;
      result.status = "correct";
      result.solved_group = groupName;
      result.flash = TIER_COLORS[tier] || "#63a7ff";
      result.score_delta = 250;
      result.message = solvedGroups.length === 4 ? "Solved the last group. You win." : "Correct.";

      applyScore(result.score_delta);

      if (solvedGroups.length === 4) {
        gameOver = true;
        won = true;
      }

      return result;
    }
  }

  mistakesUsed += 1;
  clearSelection();

  result.status = Object.values(counts).some((count) => count === 3) ? "one_away" : "incorrect";
  result.message = result.status === "one_away" ? "One away." : "Incorrect.";
  result.flash = "#ff3b30";
  result.shake = true;
  result.score_delta = -25;

  applyScore(result.score_delta);

  if (mistakesUsed >= MISTAKES_ALLOWED) {
    gameOver = true;
    won = false;
    resetScoreOnNext = true;
    result.status = "game_over";
    result.message = result.message === "One away." ? "One away, but you are out of lives." : "Incorrect. Out of lives.";
  }

  return result;
}

function renderHearts(state) {
  livesEl.innerHTML = "";

  for (let i = 0; i < state.mistakes_allowed; i++) {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.textContent = i < state.remaining_lives ? "❤️" : "🖤";
    livesEl.appendChild(heart);
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

    if (state.game_over || isSolvedWord) {
      tile.classList.add("disabled");
    }

    if (isSolvedWord) {
      tile.style.borderColor = tierColorByWord[word];
    }
  }

  submitBtn.disabled = state.game_over || (state.selected || []).length !== 4;
  clearBtn.disabled = state.game_over || (state.selected || []).length === 0;
  nextBtn.disabled = !state.game_over;
}

function render(lastResult = null) {
  const state = publicState();

  statusEl.textContent = state.game_over
    ? (state.won ? "You win. Hit Next to keep going." : "Out of lives. Categories revealed below.")
    : "Select 4 tiles and submit.";

  scoreEl.textContent = `Score: ${state.score}`;

  renderHearts(state);
  renderSolvedBars(state);
  renderBoard(state);

  if (lastResult) {
    showToast(lastResult.message || "...");

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

function onTileClick(index) {
  toggleSelect(index);
  render();
}

function onSubmit() {
  const result = submitGuess();
  render(result);
}

function onClear() {
  clearSelection();
  render();
}

function onNext() {
  if (resetScoreOnNext) {
    score = 0;
    resetScoreOnNext = false;
  }

  puzzlePointer = (puzzlePointer + 1) % puzzleOrder.length;
  loadPuzzleByPointer();
}

async function boot() {
  ensureTiles();

  const logoImg = document.getElementById("logoImg");

  logoImg.addEventListener("error", () => {
    logoImg.style.display = "none";
  });

  submitBtn.disabled = true;
  clearBtn.disabled = true;
  nextBtn.disabled = true;

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

    loadPuzzleByPointer();
  } catch (error) {
    statusEl.textContent = error.message;
    showToast(error.message);
    submitBtn.disabled = true;
    clearBtn.disabled = true;
    nextBtn.disabled = true;
  }
}

submitBtn.addEventListener("click", onSubmit);
clearBtn.addEventListener("click", onClear);
nextBtn.addEventListener("click", onNext);

boot();
