"use strict";

// ДЗ 3. Интерактивная коллекция «Архитектурные стили».

// ---------- Поиск элементов ----------
const cards = Array.from(document.querySelectorAll(".collection-card"));
const filterButtons = Array.from(document.querySelectorAll(".filter-button"));
const visibleCount = document.querySelector("#visible-count");

const panel = document.querySelector("#details-panel");
const panelNumber = panel.querySelector(".details-panel__number");
const panelTitle = document.querySelector("#details-title");
const panelDescription = document.querySelector("#details-description");

const randomButton = document.querySelector("#random-button");
const resetButton = document.querySelector("#reset-button");

const historyList = document.querySelector("#history-list");
const historyEmpty = document.querySelector("#history-empty");

// Исходное состояние панели берем из HTML, чтобы не дублировать тексты в JS.
const initialNumber = panelNumber.textContent;
const initialTitle = panelTitle.textContent;
const initialDescription = panelDescription.textContent;

const HISTORY_LIMIT = 3;

let selectedCard = null;
let history = []; // массив карточек, новые — в начале

// ---------- Вспомогательные функции ----------
function getVisibleCards() {
  return cards.filter((card) => !card.classList.contains("collection-card--hidden"));
}

function updateCounter() {
  visibleCount.textContent = getVisibleCards().length;
}

function formatNumber(card) {
  const index = cards.indexOf(card) + 1;
  return `DETAIL / ${String(index).padStart(2, "0")}`;
}

// Перезапуск CSS-анимации: снимаем класс, вызываем перерасчет, добавляем снова.
function playPulse() {
  panel.classList.remove("details-panel--pulse");
  void panel.offsetWidth;
  panel.classList.add("details-panel--pulse");
}

panel.addEventListener("animationend", () => {
  panel.classList.remove("details-panel--pulse");
});

// ---------- История выборов (бонус) ----------
function renderHistory() {
  historyList.innerHTML = "";

  history.forEach((card) => {
    const item = document.createElement("li");
    item.className = "history__item";
    item.textContent = card.dataset.title;
    historyList.append(item);
  });

  historyEmpty.hidden = history.length > 0;
}

function addToHistory(card) {
  history = history.filter((item) => item !== card);
  history.unshift(card);
  history = history.slice(0, HISTORY_LIMIT);
  renderHistory();
}

// ---------- Этап 2. Общая функция выбора ----------
function selectCard(card) {
  cards.forEach((item) => {
    item.classList.remove("collection-card--selected");
    item.setAttribute("aria-pressed", "false");
  });

  card.classList.add("collection-card--selected");
  card.setAttribute("aria-pressed", "true");
  selectedCard = card;

  panelNumber.textContent = formatNumber(card);
  panelTitle.textContent = card.dataset.title;
  panelDescription.textContent = card.dataset.description;

  addToHistory(card);
  playPulse();
}

function clearSelection() {
  cards.forEach((item) => {
    item.classList.remove("collection-card--selected");
    item.setAttribute("aria-pressed", "false");
  });
  selectedCard = null;

  panelNumber.textContent = initialNumber;
  panelTitle.textContent = initialTitle;
  panelDescription.textContent = initialDescription;
}

// Один делегированный обработчик на всю сетку:
// новые карточки в HTML работают без отдельного кода.
document.querySelector(".collection-grid").addEventListener("click", (event) => {
  const card = event.target.closest(".collection-card");
  if (card) {
    selectCard(card);
  }
});

// ---------- Этап 3. Фильтрация и счетчик ----------
function applyFilter(filter) {
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("filter-button--active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  cards.forEach((card) => {
    const isMatch = filter === "all" || card.dataset.category === filter;
    card.classList.toggle("collection-card--hidden", !isMatch);
  });

  if (selectedCard && selectedCard.classList.contains("collection-card--hidden")) {
    clearSelection();
  }

  updateCounter();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyFilter(button.dataset.filter);
  });
});

// ---------- Этап 4. Случайный выбор ----------
function selectRandomCard() {
  const visibleCards = getVisibleCards();
  if (visibleCards.length === 0) {
    return;
  }

  // Не повторяем текущую карточку, если есть другие варианты.
  const candidates =
    visibleCards.length > 1
      ? visibleCards.filter((card) => card !== selectedCard)
      : visibleCards;

  const randomIndex = Math.floor(Math.random() * candidates.length);
  selectCard(candidates[randomIndex]);
}

randomButton.addEventListener("click", selectRandomCard);

// ---------- Этап 5. Полный сброс ----------
function resetAll() {
  applyFilter("all");
  clearSelection();
  history = [];
  renderHistory();
  panel.classList.remove("details-panel--pulse");
}

resetButton.addEventListener("click", resetAll);

// ---------- Управление с клавиатуры (бонус) ----------
function moveSelection(step) {
  const visibleCards = getVisibleCards();
  if (visibleCards.length === 0) {
    return;
  }

  const currentIndex = visibleCards.indexOf(selectedCard);
  let nextIndex;

  if (currentIndex === -1) {
    nextIndex = step > 0 ? 0 : visibleCards.length - 1;
  } else {
    nextIndex = (currentIndex + step + visibleCards.length) % visibleCards.length;
  }

  const nextCard = visibleCards[nextIndex];
  selectCard(nextCard);
  nextCard.focus();
}

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return;
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    moveSelection(1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    moveSelection(-1);
  } else if (event.key === "Escape") {
    resetAll();
  }
});

// ---------- Начальное состояние ----------
updateCounter();
renderHistory();
