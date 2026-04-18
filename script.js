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

const genreDefaultImages = {
  beam: {
    url: "https://images.pexels.com/photos/16587242/pexels-photo-16587242.jpeg?auto=compress&cs=tinysrgb&w=900",
    alt: "光線技や気功技をイメージした稲妻の写真",
    credit: "Laython Photos / Pexels",
    license: "Pexels License",
    source_url: "https://www.pexels.com/photo/lightning-on-sky-16587242/"
  },
  slash: {
    url: "https://images.pexels.com/photos/29332767/pexels-photo-29332767.jpeg?auto=compress&cs=tinysrgb&w=900",
    alt: "斬撃技をイメージした刀を構える武道家の写真",
    credit: "Alireza Heidarpour / Pexels",
    license: "Pexels License",
    source_url: "https://www.pexels.com/photo/martial-artist-posing-with-katana-sword-indoors-29332767/"
  },
  punch: {
    url: "https://images.pexels.com/photos/8810078/pexels-photo-8810078.jpeg?auto=compress&cs=tinysrgb&w=900",
    alt: "パンチ技をイメージしたボクサーの練習写真",
    credit: "Los Muertos Crew / Pexels",
    license: "Pexels License",
    source_url: "https://www.pexels.com/photo/a-man-punching-a-heavy-bag-8810078/"
  },
  kick: {
    url: "https://images.pexels.com/photos/14796247/pexels-photo-14796247.jpeg?auto=compress&cs=tinysrgb&w=900",
    alt: "キック技をイメージした格闘技トレーニングの写真",
    credit: "Duren Williams / Pexels",
    license: "Pexels License",
    source_url: "https://www.pexels.com/photo/a-man-kicking-the-kick-pad-14796247/"
  },
  transformation: {
    url: "https://images.pexels.com/photos/6642763/pexels-photo-6642763.jpeg?auto=compress&cs=tinysrgb&w=900",
    alt: "変身や高速移動をイメージしたネオンライトの写真",
    credit: "photoGraph / Pexels",
    license: "Pexels License",
    source_url: "https://www.pexels.com/photo/neon-light-trails-6642763/"
  },
  grappling: {
    url: "https://images.pexels.com/photos/5424663/pexels-photo-5424663.jpeg?auto=compress&cs=tinysrgb&w=900",
    alt: "組み技をイメージしたグラップリングの写真",
    credit: "Bruno Bueno / Pexels",
    license: "Pexels License",
    source_url: "https://www.pexels.com/photo/fighters-grappling-in-a-ring-5424663/"
  },
  throw: {
    url: "https://images.pexels.com/photos/5424663/pexels-photo-5424663.jpeg?auto=compress&cs=tinysrgb&w=900",
    alt: "投げ技をイメージしたグラップリングの写真",
    credit: "Bruno Bueno / Pexels",
    license: "Pexels License",
    source_url: "https://www.pexels.com/photo/fighters-grappling-in-a-ring-5424663/"
  },
  special: {
    url: "https://images.pexels.com/photos/6642763/pexels-photo-6642763.jpeg?auto=compress&cs=tinysrgb&w=900",
    alt: "特殊技をイメージしたネオンライトの写真",
    credit: "photoGraph / Pexels",
    license: "Pexels License",
    source_url: "https://www.pexels.com/photo/neon-light-trails-6642763/"
  }
};

const DEFAULTS = {
  searchText: "",
  category: "all",
  genre: "all",
  sort: "score-desc",
  tag: ""
};

const state = {
  finishers: [],
  ...DEFAULTS,
  detailId: null
};

const elements = {};
let suppressHashUpdate = false;

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
  elements.randomButton = document.querySelector("#random-button");
  elements.tagChip = document.querySelector("#tag-chip");
  elements.tagChipLabel = document.querySelector("#tag-chip-label");
  elements.tagChipClear = document.querySelector("#tag-chip-clear");
  elements.rankingList = document.querySelector("#ranking-list");
  elements.emptyState = document.querySelector("#empty-state");
  elements.resultSummary = document.querySelector("#result-summary");
  elements.listView = document.querySelector("#list-view");
  elements.detailView = document.querySelector("#detail-view");
}

function bindEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.searchText = event.target.value;
    render();
    updateHash(true);
  });

  elements.categoryFilter.addEventListener("change", (event) => {
    state.category = event.target.value;
    render();
    updateHash();
  });

  elements.genreFilter.addEventListener("change", (event) => {
    state.genre = event.target.value;
    render();
    updateHash();
  });

  elements.sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    render();
    updateHash();
  });

  elements.form.addEventListener("reset", () => {
    window.setTimeout(() => {
      Object.assign(state, DEFAULTS);
      syncControls();
      render();
      updateHash();
    }, 0);
  });

  elements.randomButton.addEventListener("click", () => {
    pickRandom();
  });

  elements.tagChipClear.addEventListener("click", () => {
    state.tag = "";
    render();
    updateHash();
  });

  window.addEventListener("hashchange", () => {
    if (suppressHashUpdate) return;
    applyHashToState();
    syncControls();
    render();
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
    applyHashToState();
    syncControls();
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
      image: normalizeImage(finisher.image),
      tags: Array.isArray(finisher.tags) ? finisher.tags : []
    }));
}

function normalizeImage(image) {
  if (!image || !image.url) {
    return null;
  }

  return {
    url: String(image.url),
    alt: String(image.alt || ""),
    credit: String(image.credit || ""),
    license: String(image.license || ""),
    source_url: String(image.source_url || image.url)
  };
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

function applyHashToState() {
  const hash = window.location.hash.replace(/^#/, "");

  if (hash.startsWith("/f/")) {
    state.detailId = decodeURIComponent(hash.slice(3));
    return;
  }

  state.detailId = null;
  const params = new URLSearchParams(hash);
  state.searchText = params.get("q") || DEFAULTS.searchText;
  state.category = params.get("cat") || DEFAULTS.category;
  state.genre = params.get("genre") || DEFAULTS.genre;
  state.sort = params.get("sort") || DEFAULTS.sort;
  state.tag = params.get("tag") || DEFAULTS.tag;
}

function serializeHash() {
  if (state.detailId) {
    return `#/f/${encodeURIComponent(state.detailId)}`;
  }

  const params = new URLSearchParams();
  if (state.searchText) params.set("q", state.searchText);
  if (state.category !== DEFAULTS.category) params.set("cat", state.category);
  if (state.genre !== DEFAULTS.genre) params.set("genre", state.genre);
  if (state.sort !== DEFAULTS.sort) params.set("sort", state.sort);
  if (state.tag) params.set("tag", state.tag);

  const str = params.toString();
  return str ? `#${str}` : "";
}

function updateHash(replace = false) {
  const newHash = serializeHash();
  const currentHash = window.location.hash;
  if (newHash === currentHash || (newHash === "" && currentHash === "")) return;

  suppressHashUpdate = true;
  const url = newHash || window.location.pathname + window.location.search;
  if (replace) {
    window.history.replaceState(null, "", url);
  } else {
    window.history.pushState(null, "", url);
  }
  window.setTimeout(() => { suppressHashUpdate = false; }, 0);
}

function syncControls() {
  if (elements.searchInput.value !== state.searchText) {
    elements.searchInput.value = state.searchText;
  }
  elements.categoryFilter.value = state.category;
  elements.genreFilter.value = state.genre;
  elements.sortSelect.value = state.sort;

  if (state.tag) {
    elements.tagChip.hidden = false;
    elements.tagChipLabel.textContent = state.tag;
  } else {
    elements.tagChip.hidden = true;
  }
}

function render() {
  if (state.detailId) {
    renderDetail();
    return;
  }

  elements.detailView.hidden = true;
  elements.listView.hidden = false;

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
    const matchesTag = !state.tag || (finisher.tags && finisher.tags.includes(state.tag));
    const matchesSearch =
      !normalizedSearch ||
      [finisher.name, finisher.series, finisher.character]
        .map(normalizeText)
        .some((value) => value.includes(normalizedSearch));

    return matchesCategory && matchesGenre && matchesTag && matchesSearch;
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
  article.dataset.id = finisher.id;

  article.innerHTML = `
    ${createFinisherMedia(finisher)}
    <div class="card-top">
      <div class="rank-badge"><span>RANK</span>${escapeHtml(finisher.rank)}</div>
      <div class="score-badge"><span>SCORE</span>${escapeHtml(finisher.score)}</div>
    </div>
    <h3 class="finisher-name"><a href="#/f/${encodeURIComponent(finisher.id)}" class="finisher-link">${escapeHtml(finisher.name)}</a></h3>
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
    <div class="score-panel">
      ${createRadarChart(finisher, 120)}
      <div class="score-breakdown" aria-label="スコア内訳">
        ${createScoreRow("かっこよさ", finisher.coolness_score)}
        ${createScoreRow("衝撃", finisher.impact_score)}
        ${createScoreRow("象徴性", finisher.iconic_score)}
      </div>
    </div>
    <div class="tags">
      ${finisher.tags.map((tag) => `<button type="button" class="tag" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`).join("")}
    </div>
  `;

  article.querySelectorAll(".tag").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      state.tag = btn.dataset.tag;
      render();
      updateHash();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  return article;
}

function createFinisherMedia(finisher) {
  const media = finisher.image || genreDefaultImages[finisher.genre];

  if (media) {
    const creditText = [media.credit, media.license].filter(Boolean).join(" / ");
    const mediaClass = finisher.image ? "has-image" : "has-image default-image";

    return `
      <figure class="card-media ${mediaClass}">
        <a href="#/f/${encodeURIComponent(finisher.id)}" class="media-link" aria-label="${escapeHtml(finisher.name)}の詳細を開く">
          <img src="${escapeHtml(media.url)}" alt="${escapeHtml(media.alt)}" loading="lazy">
        </a>
        <figcaption>
          <a href="${escapeHtml(media.source_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(creditText)}</a>
        </figcaption>
      </figure>
    `;
  }

  return `
    <div class="card-media fallback-media genre-${escapeHtml(getSafeClassName(finisher.genre))}" aria-hidden="true">
      <span class="fallback-symbol">${escapeHtml(getGenreSymbol(finisher.genre))}</span>
      <span class="fallback-text">${escapeHtml(genreLabels[finisher.genre] || finisher.genre)}</span>
    </div>
  `;
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

function createRadarChart(finisher, size = 140) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 14;
  const axes = [
    { key: "coolness_score", label: "COOL" },
    { key: "impact_score", label: "IMPACT" },
    { key: "iconic_score", label: "ICON" }
  ];
  const anglePoints = axes.map((_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;
    return { angle };
  });

  const gridLevels = [0.33, 0.66, 1];
  const gridPolys = gridLevels.map((lvl) => {
    return anglePoints
      .map(({ angle }) => {
        const x = cx + Math.cos(angle) * radius * lvl;
        const y = cy + Math.sin(angle) * radius * lvl;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  });

  const axisLines = anglePoints
    .map(({ angle }) => {
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="radar-axis"/>`;
    })
    .join("");

  const dataPoints = axes.map((ax, i) => {
    const val = Math.max(0, Math.min(100, Number(finisher[ax.key]) || 0));
    const t = val / 100;
    const { angle } = anglePoints[i];
    const x = cx + Math.cos(angle) * radius * t;
    const y = cy + Math.sin(angle) * radius * t;
    return { x, y, val, label: ax.label, angle };
  });

  const dataPoly = dataPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const labels = dataPoints
    .map((p) => {
      const lx = cx + Math.cos(p.angle) * (radius + 10);
      const ly = cy + Math.sin(p.angle) * (radius + 10);
      return `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" class="radar-label" text-anchor="middle" dominant-baseline="middle">${escapeHtml(p.label)}</text>`;
    })
    .join("");

  const dots = dataPoints
    .map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.5" class="radar-dot"/>`)
    .join("");

  return `
    <svg class="radar-chart" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
      ${gridPolys.map((pts) => `<polygon points="${pts}" class="radar-grid"/>`).join("")}
      ${axisLines}
      <polygon points="${dataPoly}" class="radar-data"/>
      ${dots}
      ${labels}
    </svg>
  `;
}

function pickRandom() {
  const filtered = sortFinishers(getFilteredFinishers());
  if (!filtered.length) return;

  const pick = filtered[Math.floor(Math.random() * filtered.length)];
  const card = elements.rankingList.querySelector(`[data-id="${CSS.escape(pick.id)}"]`);
  if (!card) return;

  card.scrollIntoView({ behavior: "smooth", block: "center" });
  card.classList.remove("highlight");
  void card.offsetWidth;
  card.classList.add("highlight");
  window.setTimeout(() => card.classList.remove("highlight"), 2600);
}

function renderDetail() {
  const finisher = state.finishers.find((f) => f.id === state.detailId);

  if (!finisher) {
    elements.listView.hidden = true;
    elements.detailView.hidden = false;
    elements.detailView.innerHTML = `
      <div class="detail-inner">
        <a class="detail-back" href="#" data-back="true">← 一覧に戻る</a>
        <p class="detail-missing">該当する技が見つかりませんでした。</p>
      </div>
    `;
    return;
  }

  elements.listView.hidden = true;
  elements.detailView.hidden = false;

  const media = finisher.image || genreDefaultImages[finisher.genre];
  const creditText = media ? [media.credit, media.license].filter(Boolean).join(" / ") : "";

  const relatedSeries = state.finishers
    .filter((f) => f.id !== finisher.id && f.series === finisher.series)
    .slice(0, 4);
  const relatedGenre = state.finishers
    .filter((f) => f.id !== finisher.id && f.genre === finisher.genre && f.series !== finisher.series)
    .slice(0, 4);

  elements.detailView.innerHTML = `
    <div class="detail-inner">
      <a class="detail-back" href="#" data-back="true">← 一覧に戻る</a>

      <div class="detail-hero">
        ${media ? `
          <figure class="detail-media">
            <img src="${escapeHtml(media.url)}" alt="${escapeHtml(media.alt)}">
            <figcaption>
              <a href="${escapeHtml(media.source_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(creditText)}</a>
            </figcaption>
          </figure>
        ` : ""}

        <div class="detail-head">
          <div class="detail-badges">
            <div class="rank-badge"><span>RANK</span>${escapeHtml(finisher.rank)}</div>
            <div class="score-badge"><span>SCORE</span>${escapeHtml(finisher.score)}</div>
          </div>
          <h2 class="detail-name">${escapeHtml(finisher.name)}</h2>
          <dl class="meta-list detail-meta">
            <div class="meta-row"><dt class="meta-label">作品</dt><dd>${escapeHtml(finisher.series)}</dd></div>
            <div class="meta-row"><dt class="meta-label">使用者</dt><dd>${escapeHtml(finisher.character)}</dd></div>
            <div class="meta-row"><dt class="meta-label">カテゴリ</dt><dd>${escapeHtml(categoryLabels[finisher.category] || finisher.category)}</dd></div>
            <div class="meta-row"><dt class="meta-label">ジャンル</dt><dd>${escapeHtml(genreLabels[finisher.genre] || finisher.genre)}</dd></div>
          </dl>
        </div>
      </div>

      <p class="detail-description">${escapeHtml(finisher.description)}</p>

      <div class="detail-scores">
        ${createRadarChart(finisher, 220)}
        <div class="score-breakdown">
          ${createScoreRow("かっこよさ", finisher.coolness_score)}
          ${createScoreRow("衝撃", finisher.impact_score)}
          ${createScoreRow("象徴性", finisher.iconic_score)}
        </div>
      </div>

      <div class="detail-tags tags">
        ${finisher.tags.map((tag) => `<button type="button" class="tag" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`).join("")}
      </div>

      ${renderRelatedBlock("同じ作品の技", relatedSeries)}
      ${renderRelatedBlock("同じジャンルの技", relatedGenre)}
    </div>
  `;

  const backLink = elements.detailView.querySelector('[data-back="true"]');
  if (backLink) {
    backLink.addEventListener("click", (event) => {
      if (window.history.length > 1) {
        event.preventDefault();
        window.history.back();
      }
    });
  }

  elements.detailView.querySelectorAll(".tag").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.tag = btn.dataset.tag;
      state.detailId = null;
      render();
      updateHash();
      window.scrollTo({ top: 0 });
    });
  });

  window.scrollTo({ top: 0 });
}

function renderRelatedBlock(title, items) {
  if (!items.length) return "";
  return `
    <section class="related-block">
      <h3 class="related-title">${escapeHtml(title)}</h3>
      <div class="related-list">
        ${items.map((item) => `
          <a class="related-item" href="#/f/${encodeURIComponent(item.id)}">
            ${item.image ? `<img src="${escapeHtml(item.image.url)}" alt="${escapeHtml(item.image.alt)}" loading="lazy">` : `<div class="related-item-fallback">${escapeHtml(getGenreSymbol(item.genre))}</div>`}
            <div class="related-item-body">
              <span class="related-item-rank">#${escapeHtml(item.rank)}</span>
              <span class="related-item-name">${escapeHtml(item.name)}</span>
              <span class="related-item-series">${escapeHtml(item.series)}</span>
            </div>
          </a>
        `).join("")}
      </div>
    </section>
  `;
}

function normalizeText(value) {
  return String(value || "").trim().toLocaleLowerCase("ja");
}

function getDisplayLabel(value) {
  return categoryLabels[value] || genreLabels[value] || value;
}

function getGenreSymbol(genre) {
  const symbols = {
    beam: "BEAM",
    slash: "SLASH",
    punch: "PUNCH",
    kick: "KICK",
    transformation: "FORM",
    grappling: "LOCK",
    throw: "THROW",
    special: "SPECIAL"
  };

  return symbols[genre] || "FINISH";
}

function getSafeClassName(value) {
  return String(value || "unknown").replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
