const DATA_URL = "data/finishers.json";

const categoryLabels = {
  anime: "アニメ",
  game: "ゲーム",
  tokusatsu: "特撮",
  combat_sports: "プロレス / 格闘技"
};

const genreLabels = {
  beam: "光線 / 気功",
  slash: "斬撃",
  punch: "パンチ",
  kick: "キック",
  transformation: "変身 / 強化",
  grappling: "組み技",
  throw: "投げ",
  special: "特殊技"
};

const state = {
  finishers: [],
  searchText: "",
  category: "all",
  genre: "all",
  sort: "score-desc"
};

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  bindEvents();
  loadFinishers();
});

function bindElements() {
  elements.form = document.querySelector("#filters-form");
  elements.searchInput = document.querySelector("#search-input");
  elements.categoryFilter = document.querySelector("#category-filter");
  elements.genreFilter = document.querySelector("#genre-filter");
  elements.sortSelect = document.querySelector("#sort-select");
  elements.rankingList = document.querySelector("#ranking-list");
  elements.emptyState = document.querySelector("#empty-state");
  elements.resultSummary = document.querySelector("#result-summary");
}

function bindEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.searchText = event.target.value;
    render();
  });

  elements.categoryFilter.addEventListener("change", (event) => {
    state.category = event.target.value;
    render();
  });

  elements.genreFilter.addEventListener("change", (event) => {
    state.genre = event.target.value;
    render();
  });

  elements.sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    render();
  });

  elements.form.addEventListener("reset", () => {
    window.setTimeout(() => {
      state.searchText = "";
      state.category = "all";
      state.genre = "all";
      state.sort = "score-desc";
      render();
    }, 0);
  });
}

async function loadFinishers() {
  try {
    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.status}`);
    }

    const finishers = await response.json();
    state.finishers = normalizeFinishers(finishers);
    populateFilters(state.finishers);
    render();
  } catch (error) {
    console.error(error);
    elements.resultSummary.textContent = "データの読み込みに失敗しました。";
    elements.rankingList.innerHTML = "";
    elements.emptyState.hidden = false;
    elements.emptyState.querySelector("p").textContent = "finishers.jsonを読み込めませんでした。";
  }
}

function normalizeFinishers(finishers) {
  return finishers
    .filter((finisher) => finisher && finisher.id && finisher.name)
    .map((finisher) => ({
      ...finisher,
      rank: Number(finisher.rank) || 9999,
      score: Number(finisher.score) || 0,
      coolness_score: Number(finisher.coolness_score) || 0,
      impact_score: Number(finisher.impact_score) || 0,
      iconic_score: Number(finisher.iconic_score) || 0,
      tags: Array.isArray(finisher.tags) ? finisher.tags : []
    }));
}

function populateFilters(finishers) {
  const categories = uniqueSorted(finishers.map((item) => item.category));
  const genres = uniqueSorted(finishers.map((item) => item.genre));

  appendOptions(elements.categoryFilter, categories, categoryLabels);
  appendOptions(elements.genreFilter, genres, genreLabels);
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => {
    return getDisplayLabel(a).localeCompare(getDisplayLabel(b), "ja");
  });
}

function appendOptions(selectElement, values, labels) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = labels[value] || value;
    selectElement.append(option);
  });
}

function render() {
  const filtered = getFilteredFinishers();
  const sorted = sortFinishers(filtered);

  elements.resultSummary.textContent = `${sorted.length} / ${state.finishers.length} 件を表示中`;
  elements.rankingList.innerHTML = "";
  elements.emptyState.hidden = sorted.length > 0;

  const fragment = document.createDocumentFragment();
  sorted.forEach((finisher) => {
    fragment.append(createFinisherCard(finisher));
  });
  elements.rankingList.append(fragment);
}

function getFilteredFinishers() {
  const normalizedSearch = normalizeText(state.searchText);

  return state.finishers.filter((finisher) => {
    const matchesCategory = state.category === "all" || finisher.category === state.category;
    const matchesGenre = state.genre === "all" || finisher.genre === state.genre;
    const matchesSearch =
      !normalizedSearch ||
      [finisher.name, finisher.series, finisher.character]
        .map(normalizeText)
        .some((value) => value.includes(normalizedSearch));

    return matchesCategory && matchesGenre && matchesSearch;
  });
}

function sortFinishers(finishers) {
  const sorted = [...finishers];

  sorted.sort((a, b) => {
    if (state.sort === "score-asc") {
      return a.score - b.score || a.rank - b.rank;
    }

    if (state.sort === "name-asc") {
      return a.name.localeCompare(b.name, "ja") || b.score - a.score;
    }

    if (state.sort === "rank-asc") {
      return a.rank - b.rank || b.score - a.score;
    }

    return b.score - a.score || a.rank - b.rank;
  });

  return sorted;
}

function createFinisherCard(finisher) {
  const article = document.createElement("article");
  article.className = "finisher-card";

  article.innerHTML = `
    <div class="card-top">
      <div class="rank-badge"><span>RANK</span>${escapeHtml(finisher.rank)}</div>
      <div class="score-badge"><span>SCORE</span>${escapeHtml(finisher.score)}</div>
    </div>
    <h3 class="finisher-name">${escapeHtml(finisher.name)}</h3>
    <dl class="meta-list">
      <div class="meta-row">
        <dt class="meta-label">作品</dt>
        <dd>${escapeHtml(finisher.series)}</dd>
      </div>
      <div class="meta-row">
        <dt class="meta-label">使用者</dt>
        <dd>${escapeHtml(finisher.character)}</dd>
      </div>
      <div class="meta-row">
        <dt class="meta-label">カテゴリ</dt>
        <dd>${escapeHtml(categoryLabels[finisher.category] || finisher.category)}</dd>
      </div>
      <div class="meta-row">
        <dt class="meta-label">ジャンル</dt>
        <dd>${escapeHtml(genreLabels[finisher.genre] || finisher.genre)}</dd>
      </div>
    </dl>
    <p class="description">${escapeHtml(finisher.description)}</p>
    <div class="score-breakdown" aria-label="スコア内訳">
      ${createScoreRow("かっこよさ", finisher.coolness_score)}
      ${createScoreRow("衝撃", finisher.impact_score)}
      ${createScoreRow("象徴性", finisher.iconic_score)}
    </div>
    <div class="tags">
      ${finisher.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
    </div>
  `;

  return article;
}

function createScoreRow(label, score) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));

  return `
    <div class="score-row">
      <span>${escapeHtml(label)}</span>
      <span class="score-track"><span class="score-fill" style="width: ${safeScore}%"></span></span>
      <span>${safeScore}</span>
    </div>
  `;
}

function normalizeText(value) {
  return String(value || "").trim().toLocaleLowerCase("ja");
}

function getDisplayLabel(value) {
  return categoryLabels[value] || genreLabels[value] || value;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
