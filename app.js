const STORAGE_KEY = "ifr-zero-conditional-state-v1";
const SECTION_IDS = ["mind-map", "matching", "quiz"];
const MIND_MAP_LAYOUT_SCALE = 0.76;
const MIND_MAP_ZOOM_MIN = 0.55;
const MIND_MAP_ZOOM_MAX = 1.35;
const MIND_MAP_ZOOM_STEP = 0.15;
const SECTION_META = {
  "mind-map": {
    title: "Mapa mental interactivo",
    caption:
      "Recorre los conceptos esenciales del tema y abre cada explicación en inglés y español.",
  },
  matching: {
    title: "Relación de conceptos",
    caption:
      "Selecciona un concepto y luego su definición. Cada error resta un punto y cada acierto suma uno.",
  },
  quiz: {
    title: "Evaluación",
    caption:
      "Resuelve 15 reactivos, revisa tu avance y consulta el resumen final cuando completes la sección.",
  },
};

const dom = {};
const uiState = {
  toastTimer: null,
  lastFocusedElement: null,
  lastScrollY: 0,
  headerScrollFrame: null,
  speechPlayback: {
    isPlaying: false,
    text: "",
    rate: 1,
    utterance: null,
    playbackId: 0,
  },
  matchingFeedback: {
    type: "info",
    message: "Selecciona un concepto y luego toca la definición que le corresponde.",
  },
  matchingErrorPair: null,
  matchingLocked: false,
  quizFeedback: null,
  shouldCenterMindMap: true,
  mindMapPanCleanup: null,
};

let state;
let quizItems = [];
let mindMapNodeById = new Map();
let matchingItemById = new Map();

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  if (!window.appData) {
    return;
  }

  cacheDom();
  prepareData();
  state = hydrateState(loadState());
  recalculateStats();
  bindStaticEvents();
  renderHeaderStats();
  renderSection(state.currentSection);
  saveState();
}

function cacheDom() {
  dom.appHeader = document.querySelector(".app-header");
  dom.statTotal = document.getElementById("stat-total");
  dom.statCorrect = document.getElementById("stat-correct");
  dom.statErrors = document.getElementById("stat-errors");
  dom.statScore = document.getElementById("stat-score");
  dom.resetProgressBtn = document.getElementById("reset-progress-btn");
  dom.prevSectionBtn = document.getElementById("prev-section-btn");
  dom.nextSectionBtn = document.getElementById("next-section-btn");
  dom.currentSectionTitle = document.getElementById("current-section-title");
  dom.currentSectionCaption = document.getElementById("current-section-caption");
  dom.sectionPanels = {
    "mind-map": document.getElementById("section-mind-map"),
    matching: document.getElementById("section-matching"),
    quiz: document.getElementById("section-quiz"),
  };
  dom.tabButtons = Array.from(document.querySelectorAll("[data-section-target]"));
  dom.toast = document.getElementById("feedback-toast");
  dom.srStatus = document.getElementById("sr-status");
  dom.modal = document.getElementById("concept-modal");
  dom.modalTitle = document.getElementById("concept-modal-title");
  dom.modalSummaryEn = document.getElementById("concept-summary-en");
  dom.modalSummaryEs = document.getElementById("concept-summary-es");
  dom.modalExampleEn = document.getElementById("concept-example-en");
  dom.modalExampleEs = document.getElementById("concept-example-es");
  dom.modalExampleEnWrap = document.getElementById("concept-example-en-wrap");
  dom.modalExampleEsWrap = document.getElementById("concept-example-es-wrap");
  dom.playExampleBtn = document.getElementById("play-example-btn");
  dom.playExampleSlowBtn = document.getElementById("play-example-slow-btn");
  dom.conceptAudioControls = document.getElementById("concept-audio-controls");
  dom.modalCloseBtn = document.getElementById("close-modal-btn");
}

function prepareData() {
  const rootNode = window.appData.mindMap.root;
  const nodes = window.appData.mindMap.nodes;

  mindMapNodeById = new Map([[rootNode.id, rootNode]]);
  nodes.forEach((node) => {
    mindMapNodeById.set(node.id, node);
  });

  matchingItemById = new Map();
  window.appData.matching.forEach((item) => {
    matchingItemById.set(item.id, item);
  });

  quizItems = [
    ...window.appData.quiz.trueFalse.map((item) => ({
      ...item,
      type: "trueFalse",
      typeLabel: "Verdadero o falso",
    })),
    ...window.appData.quiz.multipleChoice.map((item) => ({
      ...item,
      type: "multipleChoice",
      typeLabel: "Opción múltiple",
    })),
    ...window.appData.quiz.completeSentence.map((item) => ({
      ...item,
      type: "completeSentence",
      typeLabel: "Completa la frase",
    })),
  ];
}

function createDefaultState() {
  return {
    currentSection: "mind-map",
    currentQuizIndex: 0,
    score: 0,
    correctCount: 0,
    errorCount: 0,
    completedMatchingPairs: [],
    completedQuizItems: [],
    selectedMatchingItem: null,
    resolvedQuestionIds: [],
    appCompleted: false,
    matchingAttempts: {},
    quizAttempts: {},
    matchingDefinitionOrder: shuffleArray(window.appData.matching.map((item) => item.id)),
    expandedNodeIds: [],
    mindMapZoom: getDefaultMindMapZoom(),
  };
}

function hydrateState(savedState) {
  const defaults = createDefaultState();

  if (!savedState) {
    return defaults;
  }

  const matchingIds = new Set(window.appData.matching.map((item) => item.id));
  const quizIds = new Set(quizItems.map((item) => item.id));
  const expandableIds = getExpandableNodeIds();
  const hydrated = {
    ...defaults,
    ...savedState,
  };

  hydrated.currentSection = SECTION_IDS.includes(savedState.currentSection)
    ? savedState.currentSection
    : defaults.currentSection;
  hydrated.currentQuizIndex = clampNumber(savedState.currentQuizIndex, 0, quizItems.length - 1);
  hydrated.completedMatchingPairs = Array.isArray(savedState.completedMatchingPairs)
    ? Array.from(new Set(savedState.completedMatchingPairs.filter((id) => matchingIds.has(id))))
    : [];
  hydrated.completedQuizItems = Array.isArray(savedState.completedQuizItems)
    ? savedState.completedQuizItems.filter((id) => quizIds.has(id))
    : [];
  hydrated.resolvedQuestionIds = Array.isArray(savedState.resolvedQuestionIds)
    ? Array.from(new Set(savedState.resolvedQuestionIds.filter((id) => quizIds.has(id))))
    : hydrated.completedQuizItems;
  hydrated.completedQuizItems = hydrated.resolvedQuestionIds.slice();
  hydrated.selectedMatchingItem =
    matchingIds.has(savedState.selectedMatchingItem) &&
    !hydrated.completedMatchingPairs.includes(savedState.selectedMatchingItem)
      ? savedState.selectedMatchingItem
      : null;
  hydrated.matchingAttempts = sanitizeCounterMap(savedState.matchingAttempts, matchingIds);
  hydrated.quizAttempts = sanitizeCounterMap(savedState.quizAttempts, quizIds);
  hydrated.matchingDefinitionOrder = ensureMatchingOrder(savedState.matchingDefinitionOrder);
  hydrated.expandedNodeIds = Array.isArray(savedState.expandedNodeIds)
    ? Array.from(new Set(savedState.expandedNodeIds.filter((id) => expandableIds.has(id))))
    : defaults.expandedNodeIds;
  hydrated.mindMapZoom = clampMindMapZoom(
    Number.isFinite(Number(savedState.mindMapZoom)) ? Number(savedState.mindMapZoom) : defaults.mindMapZoom
  );

  return hydrated;
}

function sanitizeCounterMap(counterMap, validIds) {
  if (!counterMap || typeof counterMap !== "object") {
    return {};
  }

  return Object.entries(counterMap).reduce((accumulator, [key, value]) => {
    if (validIds.has(key) && Number.isFinite(Number(value)) && Number(value) >= 0) {
      accumulator[key] = Number(value);
    }
    return accumulator;
  }, {});
}

function ensureMatchingOrder(order) {
  const ids = window.appData.matching.map((item) => item.id);
  const validIds = new Set(ids);

  if (!Array.isArray(order)) {
    return shuffleArray(ids.slice());
  }

  const filtered = Array.from(new Set(order.filter((id) => validIds.has(id))));
  const missing = ids.filter((id) => !filtered.includes(id));
  return filtered.concat(shuffleArray(missing));
}

function bindStaticEvents() {
  dom.tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      renderSection(button.dataset.sectionTarget);
    });
  });

  dom.prevSectionBtn.addEventListener("click", () => changeSection(-1));
  dom.nextSectionBtn.addEventListener("click", () => changeSection(1));
  dom.resetProgressBtn.addEventListener("click", () => resetProgress());

  dom.sectionPanels["mind-map"].addEventListener("click", handleMindMapPanelClick);
  dom.sectionPanels.matching.addEventListener("click", handleMatchingPanelClick);
  dom.sectionPanels.quiz.addEventListener("click", handleQuizPanelClick);

  dom.modal.addEventListener("click", (event) => {
    if (event.target.dataset.closeModal === "true") {
      closeConceptModal();
    }
  });

  dom.modalCloseBtn.addEventListener("click", () => closeConceptModal());
  dom.playExampleBtn.addEventListener("click", () => playConceptExampleAudio(1));
  dom.playExampleSlowBtn.addEventListener("click", () => playConceptExampleAudio(0.5));
  window.addEventListener("keydown", handleGlobalKeydown);
  window.addEventListener("resize", handleResponsiveRedraw);
  window.addEventListener("scroll", handleWindowScroll, { passive: true });
  updateHeaderVisibility(true);
}

function handleGlobalKeydown(event) {
  if (event.key === "Escape" && dom.modal.classList.contains("is-open")) {
    closeConceptModal();
  }
}

function handleResponsiveRedraw() {
  updateHeaderVisibility(true);

  if (state.currentSection === "matching") {
    drawMatchingConnectors();
  }
}

function handleWindowScroll() {
  if (uiState.headerScrollFrame) {
    return;
  }

  uiState.headerScrollFrame = window.requestAnimationFrame(() => {
    updateHeaderVisibility();
    uiState.headerScrollFrame = null;
  });
}

function updateHeaderVisibility(forceSync = false) {
  if (!dom.appHeader) {
    return;
  }

  const isDesktopHeader = window.innerWidth > 768;
  const currentScrollY = Math.max(window.scrollY || 0, 0);

  if (!isDesktopHeader) {
    dom.appHeader.classList.remove("is-compact", "is-stats-hidden");
    uiState.lastScrollY = currentScrollY;
    return;
  }

  const shouldCompactHeader = forceSync ? currentScrollY > 28 : currentScrollY > 36;
  dom.appHeader.classList.toggle("is-compact", shouldCompactHeader);
  dom.appHeader.classList.toggle("is-stats-hidden", shouldCompactHeader);

  uiState.lastScrollY = currentScrollY;
}

function changeSection(direction) {
  const currentIndex = SECTION_IDS.indexOf(state.currentSection);
  const nextIndex = clampNumber(currentIndex + direction, 0, SECTION_IDS.length - 1);
  renderSection(SECTION_IDS[nextIndex]);
}

function renderHeaderStats() {
  dom.statTotal.textContent = String(window.appData.meta.totalExercises);
  dom.statCorrect.textContent = String(state.correctCount);
  dom.statErrors.textContent = String(state.errorCount);
  dom.statScore.textContent = String(state.score);
}

function renderSection(sectionId) {
  const nextSection = SECTION_IDS.includes(sectionId) ? sectionId : SECTION_IDS[0];
  state.currentSection = nextSection;

  const meta = SECTION_META[nextSection];
  dom.currentSectionTitle.textContent = meta.title;
  dom.currentSectionCaption.textContent = meta.caption;

  dom.tabButtons.forEach((button) => {
    const isActive = button.dataset.sectionTarget === nextSection;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });

  Object.entries(dom.sectionPanels).forEach(([panelId, panel]) => {
    const isActive = panelId === nextSection;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
  });

  dom.prevSectionBtn.disabled = SECTION_IDS.indexOf(nextSection) === 0;
  dom.nextSectionBtn.disabled = SECTION_IDS.indexOf(nextSection) === SECTION_IDS.length - 1;

  if (nextSection === "mind-map") {
    renderMindMap();
  } else if (nextSection === "matching") {
    renderMatchingGame();
  } else {
    renderQuiz();
  }

  saveState();
}

function renderMindMap() {
  const layout = getMindMapLayout();
  const rootNode = layout.root;
  const visibleNodes = getVisibleMindMapNodes().map((node) => layout.nodesById.get(node.id)).filter(Boolean);
  const connectorsMarkup = renderMindMapConnectorsMarkup(layout.nodesById, rootNode, visibleNodes);
  const expandableCount = getExpandableNodeIds().size;
  const expandAllActive = expandableCount > 0 && state.expandedNodeIds.length === expandableCount;
  const zoom = clampMindMapZoom(state.mindMapZoom);
  const zoomPercent = Math.round(zoom * 100);
  const defaultZoom = getDefaultMindMapZoom();

  dom.sectionPanels["mind-map"].innerHTML = `
    <div class="panel-header">
      <div>
        <h3>Zero Conditional en una sola vista</h3>
        <p class="panel-copy">
          Arrastra el lienzo, usa las barras de desplazamiento y abre cada nodo para revisar explicación breve y ejemplo.
        </p>
        <p class="panel-meta">Nodos visibles ahora: <strong>${visibleNodes.length + 1}</strong></p>
      </div>
    </div>
    <div class="mind-toolbar">
      <div class="mind-toolbar-group">
        <button type="button" class="surface-button" data-action="expand-all" ${expandAllActive ? "disabled" : ""}>
          Expandir todo
        </button>
        <button type="button" class="surface-button" data-action="collapse-all" ${state.expandedNodeIds.length === 0 ? "disabled" : ""}>
          Cerrar todo
        </button>
        <button type="button" class="surface-button" data-action="center-root">
          Centrar tema principal
        </button>
      </div>
      <div class="mind-toolbar-group mind-toolbar-group--zoom" role="group" aria-label="Controles de zoom del mapa mental">
        <button type="button" class="surface-button mind-zoom-button" data-action="zoom-out" ${zoom <= MIND_MAP_ZOOM_MIN ? "disabled" : ""} aria-label="Alejar mapa mental">
          −
        </button>
        <span class="zoom-indicator" aria-live="polite">${zoomPercent}%</span>
        <button type="button" class="surface-button mind-zoom-button" data-action="zoom-in" ${zoom >= MIND_MAP_ZOOM_MAX ? "disabled" : ""} aria-label="Acercar mapa mental">
          +
        </button>
        <button type="button" class="surface-button" data-action="zoom-reset" ${Math.abs(zoom - defaultZoom) < 0.01 ? "disabled" : ""}>
          Restablecer zoom
        </button>
      </div>
    </div>
    <div class="mind-viewport" id="mind-map-viewport" tabindex="0" aria-label="Mapa mental navegable">
      <div class="mind-scale-frame" style="width:${Math.round(layout.width * zoom)}px; height:${Math.round(layout.height * zoom)}px;">
        <div class="mind-canvas" id="mind-map-canvas" style="width:${layout.width}px; height:${layout.height}px; transform: scale(${zoom});">
          <svg class="mind-connectors" id="mind-map-connectors" viewBox="0 0 ${layout.width} ${layout.height}" aria-hidden="true">
            ${connectorsMarkup}
          </svg>
          ${renderMindNode(rootNode)}
          ${visibleNodes.map((node) => renderMindNode(node)).join("")}
        </div>
      </div>
    </div>
  `;

  bindMindMapPan();

  if (uiState.shouldCenterMindMap) {
    requestAnimationFrame(() => {
      centerMindMap();
      uiState.shouldCenterMindMap = false;
    });
  }
}

function renderMindNode(node) {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const isExpanded = state.expandedNodeIds.includes(node.id);
  const levelClass =
    node.level === 0 ? "mind-node--root" : node.level === 1 ? "mind-node--level1" : "mind-node--level2";
  const metaText =
    node.level === 0 ? "Tema principal" : hasChildren ? `${node.children.length} subtemas` : "Detalle";

  return `
    <div class="mind-node ${levelClass}" style="left:${node.x}px; top:${node.y}px;">
      <button type="button" class="mind-node__button" data-node-id="${node.id}" aria-label="Abrir ${escapeHtml(node.title)}">
        <span>${escapeHtml(node.title)}</span>
        <span class="mind-node__meta">${metaText}</span>
      </button>
      ${
        hasChildren
          ? `<button type="button" class="node-toggle" data-toggle-node="${node.id}" aria-expanded="${String(isExpanded)}" aria-label="${isExpanded ? "Ocultar subtemas" : "Mostrar subtemas"}">${isExpanded ? "−" : "+"}</button>`
          : ""
      }
    </div>
  `;
}

function renderMindMapConnectorsMarkup(nodesById, rootNode, visibleNodes) {
  return visibleNodes
    .map((node) => {
      const parentNode = nodesById.get(node.parentId) || rootNode;
      return `<path class="mind-connector" d="${buildCurvedPath(parentNode, node, node.curveSeed)}"></path>`;
    })
    .join("");
}

function buildCurvedPath(startNode, endNode, curveSeed) {
  const dx = endNode.x - startNode.x;
  const dy = endNode.y - startNode.y;
  const distance = Math.hypot(dx, dy) || 1;
  const normalX = -dy / distance;
  const normalY = dx / distance;
  const bend = curveSeed * 88;
  const controlOne = {
    x: startNode.x + dx * 0.28 + normalX * bend,
    y: startNode.y + dy * 0.18 + normalY * bend,
  };
  const controlTwo = {
    x: startNode.x + dx * 0.72 + normalX * bend,
    y: startNode.y + dy * 0.82 + normalY * bend,
  };

  return `M ${startNode.x} ${startNode.y} C ${controlOne.x} ${controlOne.y}, ${controlTwo.x} ${controlTwo.y}, ${endNode.x} ${endNode.y}`;
}

function bindMindMapPan() {
  const viewport = dom.sectionPanels["mind-map"].querySelector("#mind-map-viewport");

  if (!viewport) {
    return;
  }

  if (typeof uiState.mindMapPanCleanup === "function") {
    uiState.mindMapPanCleanup();
  }

  const dragState = {
    isPointerDown: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  };

  const onPointerDown = (event) => {
    if (event.target.closest(".mind-node__button") || event.target.closest(".node-toggle")) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    dragState.isPointerDown = true;
    dragState.startX = event.clientX;
    dragState.startY = event.clientY;
    dragState.scrollLeft = viewport.scrollLeft;
    dragState.scrollTop = viewport.scrollTop;
    viewport.classList.add("is-dragging");
  };

  const onPointerMove = (event) => {
    if (!dragState.isPointerDown) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    viewport.scrollLeft = dragState.scrollLeft - deltaX;
    viewport.scrollTop = dragState.scrollTop - deltaY;
  };

  const releasePointer = () => {
    dragState.isPointerDown = false;
    viewport.classList.remove("is-dragging");
  };

  const onWheel = (event) => {
    if (!event.ctrlKey && !event.metaKey) {
      return;
    }

    event.preventDefault();
    adjustMindMapZoom(event.deltaY < 0 ? "in" : "out");
  };

  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointermove", onPointerMove);
  viewport.addEventListener("pointerup", releasePointer);
  viewport.addEventListener("pointercancel", releasePointer);
  viewport.addEventListener("pointerleave", releasePointer);
  viewport.addEventListener("wheel", onWheel, { passive: false });

  uiState.mindMapPanCleanup = () => {
    viewport.removeEventListener("pointerdown", onPointerDown);
    viewport.removeEventListener("pointermove", onPointerMove);
    viewport.removeEventListener("pointerup", releasePointer);
    viewport.removeEventListener("pointercancel", releasePointer);
    viewport.removeEventListener("pointerleave", releasePointer);
    viewport.removeEventListener("wheel", onWheel);
  };
}

function centerMindMap() {
  const viewport = dom.sectionPanels["mind-map"].querySelector("#mind-map-viewport");
  const layout = getMindMapLayout();
  const rootNode = layout.root;
  const zoom = clampMindMapZoom(state.mindMapZoom);

  if (!viewport || !rootNode) {
    return;
  }

  const targetLeft = Math.max(0, rootNode.x * zoom - viewport.clientWidth / 2);
  const targetTop = Math.max(0, rootNode.y * zoom - viewport.clientHeight / 2);

  viewport.scrollTo({
    left: targetLeft,
    top: targetTop,
    behavior: "smooth",
  });
}

function expandAllNodes() {
  state.expandedNodeIds = Array.from(getExpandableNodeIds());
  saveState();
  renderMindMap();
}

function collapseAllNodes() {
  state.expandedNodeIds = [];
  saveState();
  renderMindMap();
}

function adjustMindMapZoom(direction) {
  const currentZoom = clampMindMapZoom(state.mindMapZoom);
  const nextZoom =
    direction === "in"
      ? clampMindMapZoom(currentZoom + MIND_MAP_ZOOM_STEP)
      : clampMindMapZoom(currentZoom - MIND_MAP_ZOOM_STEP);

  setMindMapZoom(nextZoom);
}

function resetMindMapZoom() {
  state.mindMapZoom = getDefaultMindMapZoom();
  uiState.shouldCenterMindMap = true;
  saveState();
  renderMindMap();
}

function setMindMapZoom(nextZoom) {
  const viewport = dom.sectionPanels["mind-map"]?.querySelector("#mind-map-viewport");
  const previousZoom = clampMindMapZoom(state.mindMapZoom);
  const clampedZoom = clampMindMapZoom(nextZoom);

  if (Math.abs(previousZoom - clampedZoom) < 0.01) {
    return;
  }

  let anchorX = null;
  let anchorY = null;

  if (viewport) {
    anchorX = (viewport.scrollLeft + viewport.clientWidth / 2) / previousZoom;
    anchorY = (viewport.scrollTop + viewport.clientHeight / 2) / previousZoom;
  }

  state.mindMapZoom = clampedZoom;
  saveState();
  renderMindMap();

  if (anchorX !== null && anchorY !== null) {
    requestAnimationFrame(() => {
      const refreshedViewport = dom.sectionPanels["mind-map"]?.querySelector("#mind-map-viewport");
      if (!refreshedViewport) {
        return;
      }

      refreshedViewport.scrollLeft = Math.max(0, anchorX * clampedZoom - refreshedViewport.clientWidth / 2);
      refreshedViewport.scrollTop = Math.max(0, anchorY * clampedZoom - refreshedViewport.clientHeight / 2);
    });
  }
}

function toggleNodeExpansion(nodeId) {
  const expandableIds = getExpandableNodeIds();
  if (!expandableIds.has(nodeId)) {
    return;
  }

  if (state.expandedNodeIds.includes(nodeId)) {
    state.expandedNodeIds = state.expandedNodeIds.filter((id) => id !== nodeId);
  } else {
    state.expandedNodeIds = state.expandedNodeIds.concat(nodeId);
  }

  saveState();
  renderMindMap();
}

function openConceptModal(nodeId) {
  const node = mindMapNodeById.get(nodeId);
  if (!node) {
    return;
  }

  stopConceptExampleAudio();
  uiState.lastFocusedElement = document.activeElement;
  dom.modal.dataset.nodeId = node.id;
  dom.modalTitle.textContent = node.title;
  dom.modalSummaryEn.textContent = node.summaryEn || "";
  dom.modalSummaryEs.textContent = node.summaryEs || "";
  dom.modalExampleEn.textContent = node.exampleEn || "";
  dom.modalExampleEs.textContent = node.exampleEs || "";
  dom.modalExampleEnWrap.classList.toggle("is-hidden", !node.exampleEn);
  dom.modalExampleEsWrap.classList.toggle("is-hidden", !node.exampleEs);
  dom.playExampleBtn.disabled = !node.exampleEn;
  dom.playExampleSlowBtn.disabled = !node.exampleEn;
  dom.playExampleBtn.setAttribute("aria-pressed", "false");
  dom.playExampleSlowBtn.setAttribute("aria-pressed", "false");
  dom.modal.classList.add("is-open");
  dom.modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  dom.modalCloseBtn.focus();
}

function closeConceptModal() {
  stopConceptExampleAudio();
  dom.modal.classList.remove("is-open");
  dom.modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (uiState.lastFocusedElement && typeof uiState.lastFocusedElement.focus === "function") {
    uiState.lastFocusedElement.focus();
  }
}

function playConceptExampleAudio(rate) {
  const exampleText = dom.modalExampleEn ? dom.modalExampleEn.textContent.trim() : "";
  if (!exampleText) {
    return;
  }

  if (!("speechSynthesis" in window) || typeof window.SpeechSynthesisUtterance === "undefined") {
    showToast("La pronunciación no está disponible en este navegador.");
    announceStatus("La pronunciación no está disponible en este navegador.");
    return;
  }

  const alreadyPlayingSameClip =
    uiState.speechPlayback.isPlaying &&
    uiState.speechPlayback.text === exampleText &&
    uiState.speechPlayback.rate === rate;

  if (alreadyPlayingSameClip) {
    stopConceptExampleAudio();
    return;
  }

  stopConceptExampleAudio();

  const utterance = new SpeechSynthesisUtterance(exampleText);
  const playbackId = Date.now() + Math.random();
  utterance.lang = "en-US";
  utterance.rate = rate;
  utterance.pitch = 1.08;
  utterance.volume = 1;

  const preferredVoice = getPreferredEnglishVoice();
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  uiState.speechPlayback = {
    isPlaying: true,
    text: exampleText,
    rate,
    utterance,
    playbackId,
  };

  updateConceptAudioButtons(rate);

  utterance.onend = () => {
    if (uiState.speechPlayback.playbackId !== playbackId) {
      return;
    }
    stopConceptExampleAudio(false);
  };

  utterance.onerror = (event) => {
    if (uiState.speechPlayback.playbackId !== playbackId) {
      return;
    }

    const errorType = typeof event?.error === "string" ? event.error.toLowerCase() : "";
    if (errorType === "canceled" || errorType === "cancelled" || errorType === "interrupted") {
      stopConceptExampleAudio(false);
      return;
    }

    stopConceptExampleAudio(false);
    showToast("No se pudo reproducir el ejemplo en este momento.");
    announceStatus("No se pudo reproducir el ejemplo en este momento.");
  };

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  announceStatus(rate === 0.5 ? "Reproducción lenta del ejemplo en inglés." : "Reproducción del ejemplo en inglés.");
}

function stopConceptExampleAudio(cancelSpeech = true) {
  if (cancelSpeech && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  uiState.speechPlayback = {
    isPlaying: false,
    text: "",
    rate: 1,
    utterance: null,
    playbackId: 0,
  };

  updateConceptAudioButtons(null);
}

function updateConceptAudioButtons(activeRate) {
  const buttons = [
    { element: dom.playExampleBtn, rate: 1 },
    { element: dom.playExampleSlowBtn, rate: 0.5 },
  ];

  buttons.forEach(({ element, rate }) => {
    if (!element) {
      return;
    }

    const isPlaying = activeRate === rate;
    element.classList.toggle("is-playing", isPlaying);
    element.setAttribute("aria-pressed", String(isPlaying));
  });
}

function getPreferredEnglishVoice() {
  const availableVoices =
    "speechSynthesis" in window && typeof window.speechSynthesis.getVoices === "function"
      ? window.speechSynthesis.getVoices()
      : [];

  if (!availableVoices.length) {
    return null;
  }

  const preferredNameFragments = [
    "Jenny",
    "Samantha",
    "Ava",
    "Aria",
    "Michelle",
    "Zira",
    "Emma",
    "Kimberly",
    "Kendra",
    "Joanna",
    "Salli",
    "Ivy",
    "Google US English",
  ];

  const englishVoices = availableVoices.filter((voice) => /^en(-|_)/i.test(voice.lang || ""));
  const americanVoices = englishVoices.filter((voice) => /en[-_]US/i.test(voice.lang || ""));
  const preferredPool = americanVoices.length ? americanVoices : englishVoices;

  for (const fragment of preferredNameFragments) {
    const match = preferredPool.find((voice) => voice.name.includes(fragment));
    if (match) {
      return match;
    }
  }

  return preferredPool[0] || null;
}

function renderMatchingGame() {
  const completedCount = state.completedMatchingPairs.length;
  const definitions = state.matchingDefinitionOrder
    .map((id) => matchingItemById.get(id))
    .filter(Boolean);
  const statusClass =
    uiState.matchingFeedback.type === "correct"
      ? "is-correct"
      : uiState.matchingFeedback.type === "error"
      ? "is-error"
      : "";

  dom.sectionPanels.matching.innerHTML = `
    <div class="panel-header">
      <div>
        <h3>Relaciona concepto y definición</h3>
        <p class="panel-copy">
          Elige primero un concepto. Después toca la definición correcta. Cada par correcto queda bloqueado.
        </p>
        <p class="panel-meta">Pares resueltos: <strong>${completedCount}</strong> de ${window.appData.matching.length}</p>
      </div>
    </div>
    <div class="matching-status ${statusClass}">
      ${escapeHtml(uiState.matchingFeedback.message)}
    </div>
    <div class="matching-board-scroller">
      <div class="matching-board" id="matching-board">
        <svg class="matching-connectors" id="matching-connectors" aria-hidden="true"></svg>
        <div class="matching-grid">
          <div class="matching-column">
            <h4>Conceptos</h4>
            ${window.appData.matching.map((item) => renderMatchingItem(item, "term")).join("")}
          </div>
          <div class="matching-column">
            <h4>Definiciones</h4>
            ${definitions.map((item) => renderMatchingItem(item, "definition")).join("")}
          </div>
        </div>
      </div>
    </div>
    ${
      completedCount === window.appData.matching.length
        ? `<div class="completion-banner">
            <h4>Actividad completada</h4>
            <p>Los 15 pares quedaron resueltos correctamente. Puedes pasar a la evaluación cuando quieras.</p>
          </div>`
        : ""
    }
  `;

  requestAnimationFrame(() => {
    drawMatchingConnectors();
  });
}

function renderMatchingItem(item, side) {
  const isResolved = state.completedMatchingPairs.includes(item.id);
  const isSelected = side === "term" && state.selectedMatchingItem === item.id;
  const isError =
    uiState.matchingErrorPair &&
    ((side === "term" && uiState.matchingErrorPair.termId === item.id) ||
      (side === "definition" && uiState.matchingErrorPair.definitionId === item.id));
  const classes = [
    "match-item",
    isResolved ? "is-correct" : "",
    isSelected ? "is-selected" : "",
    isError ? "is-error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `
    <button
      type="button"
      class="${classes}"
      data-match-side="${side}"
      data-match-id="${item.id}"
      ${isResolved ? "disabled" : ""}
      aria-pressed="${side === "term" ? String(isSelected) : "false"}"
    >
      ${side === "term" ? escapeHtml(item.term) : escapeHtml(item.definition)}
      ${side === "term" && item.bilingualNote ? `<small>${escapeHtml(item.bilingualNote)}</small>` : ""}
    </button>
  `;
}

function handleMatchingSelection(itemId, side) {
  if (uiState.matchingLocked) {
    return;
  }

  if (side === "term") {
    if (state.completedMatchingPairs.includes(itemId)) {
      return;
    }

    state.selectedMatchingItem = state.selectedMatchingItem === itemId ? null : itemId;
    uiState.matchingFeedback = {
      type: "info",
      message: state.selectedMatchingItem
        ? "Concepto seleccionado. Ahora toca la definición correcta."
        : "Selecciona un concepto y luego toca la definición que le corresponde.",
    };
    saveState();
    renderMatchingGame();
    return;
  }

  if (!state.selectedMatchingItem) {
    showToast("Primero elige un concepto.");
    announceStatus("Primero elige un concepto.");
    return;
  }

  validateMatchingPair(state.selectedMatchingItem, itemId);
}

function validateMatchingPair(leftId, rightId) {
  if (leftId === rightId) {
    if (!state.completedMatchingPairs.includes(leftId)) {
      state.completedMatchingPairs = state.completedMatchingPairs.concat(leftId);
    }

    state.selectedMatchingItem = null;
    uiState.matchingFeedback = {
      type: "correct",
      message: "Relación correcta. El par quedó bloqueado y sumó un punto.",
    };
    uiState.matchingErrorPair = null;
    updateScore(true);
    renderMatchingGame();
    showToast("¡Par correcto!");
    announceStatus("Par correcto.");
    return;
  }

  state.matchingAttempts[leftId] = (state.matchingAttempts[leftId] || 0) + 1;
  uiState.matchingFeedback = {
    type: "error",
    message: "No coincide. Revisa el concepto y vuelve a intentar.",
  };
  uiState.matchingErrorPair = {
    termId: leftId,
    definitionId: rightId,
  };
  uiState.matchingLocked = true;
  updateScore(false);
  renderMatchingGame();
  showToast("Relación incorrecta");
  announceStatus("Relación incorrecta.");

  window.setTimeout(() => {
    uiState.matchingErrorPair = null;
    uiState.matchingLocked = false;
    renderMatchingGame();
  }, 850);
}

function drawMatchingConnectors() {
  const board = dom.sectionPanels.matching.querySelector("#matching-board");
  const svg = dom.sectionPanels.matching.querySelector("#matching-connectors");

  if (!board || !svg) {
    return;
  }

  const boardRect = board.getBoundingClientRect();
  svg.setAttribute("viewBox", `0 0 ${boardRect.width} ${boardRect.height}`);
  svg.setAttribute("width", String(boardRect.width));
  svg.setAttribute("height", String(boardRect.height));

  const paths = state.completedMatchingPairs
    .map((pairId) => {
      const termEl = board.querySelector(`[data-match-side="term"][data-match-id="${pairId}"]`);
      const defEl = board.querySelector(`[data-match-side="definition"][data-match-id="${pairId}"]`);

      if (!termEl || !defEl) {
        return "";
      }

      const termRect = termEl.getBoundingClientRect();
      const defRect = defEl.getBoundingClientRect();
      const start = {
        x: termRect.right - boardRect.left,
        y: termRect.top - boardRect.top + termRect.height / 2,
      };
      const end = {
        x: defRect.left - boardRect.left,
        y: defRect.top - boardRect.top + defRect.height / 2,
      };
      const gap = Math.max(70, (end.x - start.x) * 0.38);
      const d = `M ${start.x} ${start.y} C ${start.x + gap} ${start.y}, ${end.x - gap} ${end.y}, ${end.x} ${end.y}`;

      return `<path class="matching-path" d="${d}"></path>`;
    })
    .join("");

  svg.innerHTML = paths;
}

function renderQuiz() {
  const totalQuestions = quizItems.length;
  const currentIndex = clampNumber(state.currentQuizIndex, 0, totalQuestions - 1);
  state.currentQuizIndex = currentIndex;
  const question = quizItems[currentIndex];
  const completedCount = state.resolvedQuestionIds.length;

  dom.sectionPanels.quiz.innerHTML = `
    <div class="panel-header">
      <div>
        <h3>Reactivo ${currentIndex + 1} de ${totalQuestions}</h3>
        <p class="panel-copy">
          Contesta hasta acertar. Cada intento incorrecto resta un punto y se acumula en el contador de errores.
        </p>
        <p class="panel-meta">Tipo: <strong>${escapeHtml(question.typeLabel)}</strong>. Resueltos: <strong>${completedCount}</strong> de ${totalQuestions}</p>
      </div>
    </div>
    <div class="question-card">
      <h3>${escapeHtml(question.prompt)}</h3>
      <p class="question-support">Aplica la estructura del zero conditional y el presente simple en ambas cláusulas.</p>
      <div class="quiz-options">
        ${renderQuizOptions(question)}
      </div>
      ${renderQuizFeedback(question)}
    </div>
    <div class="quiz-navigation">
      <button type="button" class="surface-button" data-quiz-nav="prev" ${
        currentIndex === 0 ? "disabled" : ""
      }>
        Reactivo anterior
      </button>
      <button type="button" class="surface-button" data-quiz-nav="next" ${
        currentIndex === totalQuestions - 1 ? "disabled" : ""
      }>
        Reactivo siguiente
      </button>
    </div>
    ${renderFinalSummary()}
  `;
}

function renderQuizOptions(question) {
  const isResolved = state.resolvedQuestionIds.includes(question.id);
  const feedback = uiState.quizFeedback;
  const wrongSelection =
    feedback && feedback.id === question.id && feedback.status === "error"
      ? feedback.selection
      : null;

  if (question.type === "trueFalse") {
    return [
      { label: "Verdadero", value: true },
      { label: "Falso", value: false },
    ]
      .map((option) => {
        const isCorrectSelection = isResolved && question.answer === option.value;
        const isWrongSelection = !isResolved && wrongSelection === option.value;
        return `
          <button
            type="button"
            class="quiz-option ${isCorrectSelection ? "is-correct" : ""} ${
          isWrongSelection ? "is-error" : ""
        }"
            data-quiz-answer-type="trueFalse"
            data-quiz-id="${question.id}"
            data-quiz-value="${String(option.value)}"
            ${isResolved ? "disabled" : ""}
          >
            <span class="quiz-option__key">${option.value ? "V" : "F"}</span>
            <span>${option.label}</span>
          </button>
        `;
      })
      .join("");
  }

  if (question.type === "multipleChoice") {
    return question.options
      .map((option) => {
        const isCorrectSelection = isResolved && question.answer === option.key;
        const isWrongSelection = !isResolved && wrongSelection === option.key;
        return `
          <button
            type="button"
            class="quiz-option ${isCorrectSelection ? "is-correct" : ""} ${
          isWrongSelection ? "is-error" : ""
        }"
            data-quiz-answer-type="multipleChoice"
            data-quiz-id="${question.id}"
            data-quiz-option-key="${option.key}"
            ${isResolved ? "disabled" : ""}
          >
            <span class="quiz-option__key">${escapeHtml(option.key)})</span>
            <span>${escapeHtml(option.text)}</span>
          </button>
        `;
      })
      .join("");
  }

  return question.options
    .map((option, index) => {
      const isCorrectSelection = isResolved && question.answer === index;
      const isWrongSelection = !isResolved && wrongSelection === index;
      return `
        <button
          type="button"
          class="quiz-option ${isCorrectSelection ? "is-correct" : ""} ${
        isWrongSelection ? "is-error" : ""
      }"
          data-quiz-answer-type="completeSentence"
          data-quiz-id="${question.id}"
          data-quiz-option-index="${index}"
          ${isResolved ? "disabled" : ""}
        >
          <span class="quiz-option__key">${index + 1}</span>
          <span>${escapeHtml(option)}</span>
        </button>
      `;
    })
    .join("");
}

function renderQuizFeedback(question) {
  const isResolved = state.resolvedQuestionIds.includes(question.id);
  const feedback = uiState.quizFeedback;

  if (isResolved) {
    return `
      <div class="feedback-card is-correct">
        <h4>Respuesta correcta</h4>
        <div class="feedback-grid">
          <p>${escapeHtml(question.explanationEn)}</p>
          <p>${escapeHtml(question.explanationEs)}</p>
        </div>
      </div>
    `;
  }

  if (feedback && feedback.id === question.id && feedback.status === "error") {
    return `
      <div class="feedback-card is-error">
        <h4>Respuesta incorrecta</h4>
        <p>La opción elegida no corresponde. Revisa la estructura y vuelve a intentar.</p>
      </div>
    `;
  }

  return "";
}

function submitTrueFalseAnswer(id, value) {
  const question = quizItems.find((item) => item.id === id);
  if (!question || state.resolvedQuestionIds.includes(id)) {
    return;
  }

  const normalizedValue = value === true || value === "true";
  applyQuizResult(question, question.answer === normalizedValue, normalizedValue);
}

function submitMultipleChoiceAnswer(id, optionKey) {
  const question = quizItems.find((item) => item.id === id);
  if (!question || state.resolvedQuestionIds.includes(id)) {
    return;
  }

  applyQuizResult(question, question.answer === optionKey, optionKey);
}

function submitCompleteSentenceAnswer(id, optionIndex) {
  const question = quizItems.find((item) => item.id === id);
  if (!question || state.resolvedQuestionIds.includes(id)) {
    return;
  }

  const normalizedIndex = Number(optionIndex);
  applyQuizResult(question, question.answer === normalizedIndex, normalizedIndex);
}

function applyQuizResult(question, isCorrect, selection) {
  if (isCorrect) {
    if (!state.resolvedQuestionIds.includes(question.id)) {
      state.resolvedQuestionIds = state.resolvedQuestionIds.concat(question.id);
    }
    state.completedQuizItems = state.resolvedQuestionIds.slice();
    uiState.quizFeedback = {
      id: question.id,
      status: "correct",
      selection,
    };
    updateScore(true);
    renderQuiz();
    showToast("Respuesta correcta");
    announceStatus("Respuesta correcta.");
    return;
  }

  state.quizAttempts[question.id] = (state.quizAttempts[question.id] || 0) + 1;
  uiState.quizFeedback = {
    id: question.id,
    status: "error",
    selection,
  };
  updateScore(false);
  renderQuiz();
  showToast("Respuesta incorrecta");
  announceStatus("Respuesta incorrecta.");
}

function updateScore(isCorrect) {
  void isCorrect;
  recalculateStats();
  renderHeaderStats();
  saveState();
}

function recalculateStats() {
  const matchingErrors = Object.values(state.matchingAttempts).reduce(
    (sum, value) => sum + value,
    0
  );
  const quizErrors = Object.values(state.quizAttempts).reduce(
    (sum, value) => sum + value,
    0
  );

  state.correctCount = state.completedMatchingPairs.length + state.resolvedQuestionIds.length;
  state.errorCount = matchingErrors + quizErrors;
  state.score = state.correctCount - state.errorCount;
  state.completedQuizItems = state.resolvedQuestionIds.slice();
  state.appCompleted =
    state.completedMatchingPairs.length === window.appData.matching.length &&
    state.resolvedQuestionIds.length === quizItems.length;
}

function renderFinalSummary() {
  if (state.resolvedQuestionIds.length !== quizItems.length) {
    return "";
  }

  const mastery = Math.round((state.correctCount / window.appData.meta.totalExercises) * 100);
  const message =
    mastery >= 90
      ? "Dominio sobresaliente. Mantienes la estructura con seguridad."
      : mastery >= 75
      ? "Buen manejo del tema. Solo conviene reforzar detalles finos."
      : mastery >= 60
      ? "Base funcional. Repasa conectores, puntuación y presente simple."
      : "Necesitas reforzar la base. Revisa el mapa mental y vuelve a intentar.";
  const pendingMatching = window.appData.matching.length - state.completedMatchingPairs.length;
  const pendingNote =
    pendingMatching > 0
      ? `<p class="completion-note">Aún faltan ${pendingMatching} pares de relación para llegar al dominio total de 30 ejercicios.</p>`
      : "";

  return `
    <div class="summary-card">
      <h3>Resumen final</h3>
      <p>${message}</p>
      <div class="summary-grid">
        <div class="summary-metric">
          <span>Total de aciertos</span>
          <strong>${state.correctCount}</strong>
        </div>
        <div class="summary-metric">
          <span>Total de errores</span>
          <strong>${state.errorCount}</strong>
        </div>
        <div class="summary-metric">
          <span>Puntuación final</span>
          <strong>${state.score}</strong>
        </div>
        <div class="summary-metric">
          <span>Dominio</span>
          <strong>${mastery}%</strong>
        </div>
      </div>
      ${pendingNote}
      <div class="summary-actions">
        <button type="button" class="ghost-button" data-summary-action="retry-quiz">
          Reintentar evaluación
        </button>
        <button type="button" class="surface-button" data-summary-action="reset-all">
          Reiniciar toda la app
        </button>
      </div>
    </div>
  `;
}

function resetQuizProgress() {
  state.resolvedQuestionIds = [];
  state.completedQuizItems = [];
  state.quizAttempts = {};
  state.currentQuizIndex = 0;
  state.appCompleted = false;
  uiState.quizFeedback = null;
  recalculateStats();
  renderHeaderStats();
  saveState();
  renderSection("quiz");
  showToast("Evaluación reiniciada");
}

function resetProgress() {
  state = createDefaultState();
  uiState.matchingFeedback = {
    type: "info",
    message: "Selecciona un concepto y luego toca la definición que le corresponde.",
  };
  uiState.matchingErrorPair = null;
  uiState.matchingLocked = false;
  uiState.quizFeedback = null;
  uiState.shouldCenterMindMap = true;
  recalculateStats();
  renderHeaderStats();
  saveState();
  renderSection("mind-map");
  closeConceptModal();
  showToast("Progreso reiniciado");
  announceStatus("Progreso reiniciado.");
}

function saveState() {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentSection: state.currentSection,
        currentQuizIndex: state.currentQuizIndex,
        score: state.score,
        correctCount: state.correctCount,
        errorCount: state.errorCount,
        completedMatchingPairs: state.completedMatchingPairs,
        completedQuizItems: state.completedQuizItems,
        selectedMatchingItem: state.selectedMatchingItem,
        resolvedQuestionIds: state.resolvedQuestionIds,
        appCompleted: state.appCompleted,
        matchingAttempts: state.matchingAttempts,
        quizAttempts: state.quizAttempts,
        matchingDefinitionOrder: state.matchingDefinitionOrder,
        expandedNodeIds: state.expandedNodeIds,
        mindMapZoom: state.mindMapZoom,
      })
    );
  } catch (error) {
    console.error("No se pudo guardar el estado.", error);
  }
}

function loadState() {
  try {
    const rawState = sessionStorage.getItem(STORAGE_KEY);
    return rawState ? JSON.parse(rawState) : null;
  } catch (error) {
    console.warn("No se pudo leer el estado guardado.", error);
    return null;
  }
}

function handleMindMapPanelClick(event) {
  const actionButton = event.target.closest("[data-action]");
  if (actionButton) {
    const action = actionButton.dataset.action;
    if (action === "expand-all") {
      expandAllNodes();
    } else if (action === "collapse-all") {
      collapseAllNodes();
    } else if (action === "center-root") {
      centerMindMap();
    } else if (action === "zoom-in") {
      adjustMindMapZoom("in");
    } else if (action === "zoom-out") {
      adjustMindMapZoom("out");
    } else if (action === "zoom-reset") {
      resetMindMapZoom();
    }
    return;
  }

  const toggleButton = event.target.closest("[data-toggle-node]");
  if (toggleButton) {
    toggleNodeExpansion(toggleButton.dataset.toggleNode);
    return;
  }

  const nodeButton = event.target.closest("[data-node-id]");
  if (nodeButton) {
    openConceptModal(nodeButton.dataset.nodeId);
  }
}

function handleMatchingPanelClick(event) {
  const target = event.target.closest("[data-match-side]");
  if (!target) {
    return;
  }

  handleMatchingSelection(target.dataset.matchId, target.dataset.matchSide);
}

function handleQuizPanelClick(event) {
  const navigationButton = event.target.closest("[data-quiz-nav]");
  if (navigationButton) {
    const direction = navigationButton.dataset.quizNav === "next" ? 1 : -1;
    state.currentQuizIndex = clampNumber(state.currentQuizIndex + direction, 0, quizItems.length - 1);
    renderQuiz();
    saveState();
    return;
  }

  const summaryButton = event.target.closest("[data-summary-action]");
  if (summaryButton) {
    if (summaryButton.dataset.summaryAction === "retry-quiz") {
      resetQuizProgress();
    } else {
      resetProgress();
    }
    return;
  }

  const answerButton = event.target.closest("[data-quiz-answer-type]");
  if (!answerButton) {
    return;
  }

  const answerType = answerButton.dataset.quizAnswerType;
  const questionId = answerButton.dataset.quizId;

  if (answerType === "trueFalse") {
    submitTrueFalseAnswer(questionId, answerButton.dataset.quizValue);
  } else if (answerType === "multipleChoice") {
    submitMultipleChoiceAnswer(questionId, answerButton.dataset.quizOptionKey);
  } else {
    submitCompleteSentenceAnswer(questionId, answerButton.dataset.quizOptionIndex);
  }
}

function getVisibleMindMapNodes() {
  return window.appData.mindMap.nodes.filter((node) => {
    if (node.level === 1) {
      return true;
    }

    return state.expandedNodeIds.includes(node.parentId);
  });
}

function getExpandableNodeIds() {
  return new Set(
    window.appData.mindMap.nodes
      .filter((node) => Array.isArray(node.children) && node.children.length > 0)
      .map((node) => node.id)
  );
}

function getMindMapLayout() {
  const root = scaleMindMapNode(window.appData.mindMap.root);
  const nodes = window.appData.mindMap.nodes.map((node) => scaleMindMapNode(node));
  return {
    width: Math.round(window.appData.mindMap.width * MIND_MAP_LAYOUT_SCALE),
    height: Math.round(window.appData.mindMap.height * MIND_MAP_LAYOUT_SCALE),
    root,
    nodesById: new Map([ [root.id, root], ...nodes.map((node) => [node.id, node]) ]),
  };
}

function scaleMindMapNode(node) {
  return {
    ...node,
    x: Math.round(node.x * MIND_MAP_LAYOUT_SCALE),
    y: Math.round(node.y * MIND_MAP_LAYOUT_SCALE),
  };
}

function clampMindMapZoom(value) {
  return Math.min(MIND_MAP_ZOOM_MAX, Math.max(MIND_MAP_ZOOM_MIN, Number(value) || 1));
}

function getDefaultMindMapZoom() {
  if (window.innerWidth <= 560) {
    return 0.78;
  }

  if (window.innerWidth <= 900) {
    return 0.9;
  }

  return 1;
}

function showToast(message) {
  if (!dom.toast) {
    return;
  }

  dom.toast.textContent = message;
  dom.toast.classList.add("is-visible");
  window.clearTimeout(uiState.toastTimer);
  uiState.toastTimer = window.setTimeout(() => {
    dom.toast.classList.remove("is-visible");
  }, 1800);
}

function announceStatus(message) {
  if (dom.srStatus) {
    dom.srStatus.textContent = message;
  }
}

function shuffleArray(items) {
  const array = items.slice();

  for (let index = array.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }

  return array;
}

function clampNumber(value, min, max) {
  const normalized = Number.isFinite(Number(value)) ? Number(value) : min;
  return Math.min(max, Math.max(min, normalized));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const escapeMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return escapeMap[character] || character;
  });
}
