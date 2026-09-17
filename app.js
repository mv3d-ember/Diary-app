/*
 * My Diary — a simple date-organized diary app.
 *
 * Data model:
 *   Every page is one calendar day, keyed by its date string "YYYY-MM-DD".
 *   All pages live in one object and are saved to the browser's localStorage,
 *   so your diary stays on your own device.
 *
 *   entries = {
 *     "2026-09-17": { date, mood, body, updated },
 *     ...
 *   }
 */

const STORAGE_KEY = "my-diary-entries-v1";

// ---- Storage helpers ----------------------------------------------------

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("Could not read saved diary:", err);
    return {};
  }
}

function saveEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (err) {
    console.error("Could not save diary:", err);
    return false;
  }
}

// ---- Date helpers -------------------------------------------------------

// Returns "YYYY-MM-DD" for a given Date (in local time, not UTC).
function toKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayKey() {
  return toKey(new Date());
}

// Turn "2026-09-17" into a Date at local noon (noon avoids timezone edge cases).
function keyToDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function formatLongDate(key) {
  return keyToDate(key).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatMonth(key) {
  return keyToDate(key).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });
}

function formatShortDate(key) {
  return keyToDate(key).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ---- App state ----------------------------------------------------------

let entries = loadEntries();
let currentKey = null;
let saveTimer = null;

// ---- Element references -------------------------------------------------

const el = {
  pageList: document.getElementById("page-list"),
  entryCount: document.getElementById("entry-count"),
  search: document.getElementById("search"),
  newEntry: document.getElementById("new-entry"),
  pageView: document.getElementById("page-view"),
  emptyState: document.getElementById("empty-state"),
  openToday: document.getElementById("open-today"),
  pageDate: document.getElementById("page-date"),
  pageHeading: document.getElementById("page-heading"),
  mood: document.getElementById("mood"),
  editor: document.getElementById("editor"),
  saveStatus: document.getElementById("save-status"),
  deleteEntry: document.getElementById("delete-entry"),
};

// ---- Rendering the sidebar list ----------------------------------------

function renderList() {
  const query = el.search.value.trim().toLowerCase();

  // Newest date first.
  let keys = Object.keys(entries).sort().reverse();

  if (query) {
    keys = keys.filter((key) => {
      const e = entries[key];
      return (
        key.includes(query) ||
        (e.mood || "").toLowerCase().includes(query) ||
        (e.body || "").toLowerCase().includes(query)
      );
    });
  }

  el.pageList.innerHTML = "";

  let lastMonth = "";
  for (const key of keys) {
    const month = formatMonth(key);
    if (month !== lastMonth) {
      const label = document.createElement("div");
      label.className = "month-label";
      label.textContent = month;
      el.pageList.appendChild(label);
      lastMonth = month;
    }

    const entry = entries[key];
    const item = document.createElement("button");
    item.className = "page-item" + (key === currentKey ? " active" : "");
    item.dataset.key = key;

    const dateLine = document.createElement("div");
    dateLine.className = "pi-date";
    dateLine.textContent = formatShortDate(key);

    const preview = document.createElement("div");
    preview.className = "pi-preview";
    const previewText = entry.mood
      ? `${entry.mood} — ${entry.body || ""}`
      : entry.body || "(empty)";
    preview.textContent = previewText;

    item.appendChild(dateLine);
    item.appendChild(preview);
    item.addEventListener("click", () => openPage(key));
    el.pageList.appendChild(item);
  }

  const count = Object.keys(entries).length;
  el.entryCount.textContent = `${count} ${count === 1 ? "entry" : "entries"}`;
}

// ---- Opening / showing a page ------------------------------------------

function openPage(key) {
  // Save whatever is currently open before switching away.
  flushSave();

  currentKey = key;

  // Make sure an entry object exists for this date.
  if (!entries[key]) {
    entries[key] = { date: key, mood: "", body: "", updated: Date.now() };
  }

  const entry = entries[key];
  el.pageView.classList.remove("hidden");
  el.emptyState.classList.add("hidden");

  el.pageDate.value = key;
  el.pageHeading.textContent =
    key === todayKey() ? "Today" : formatLongDate(key);
  el.mood.value = entry.mood || "";
  el.editor.value = entry.body || "";
  el.saveStatus.textContent = "";

  renderList();
  el.editor.focus();
}

function showEmpty() {
  currentKey = null;
  el.pageView.classList.add("hidden");
  el.emptyState.classList.remove("hidden");
  renderList();
}

// ---- Saving the open page ----------------------------------------------

function scheduleSave() {
  el.saveStatus.textContent = "Saving...";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 500);
}

function flushSave() {
  clearTimeout(saveTimer);
  if (!currentKey) return;

  const entry = entries[currentKey];
  if (!entry) return;

  entry.mood = el.mood.value;
  entry.body = el.editor.value;
  entry.updated = Date.now();

  const ok = saveEntries(entries);
  el.saveStatus.textContent = ok ? "Saved" : "Save failed!";
  renderList();
}

// ---- Deleting a page ----------------------------------------------------

function deleteCurrent() {
  if (!currentKey) return;
  const nice = formatLongDate(currentKey);
  if (!confirm(`Delete the page for ${nice}? This can't be undone.`)) return;

  delete entries[currentKey];
  saveEntries(entries);

  const remaining = Object.keys(entries).sort().reverse();
  if (remaining.length) {
    openPage(remaining[0]);
  } else {
    showEmpty();
  }
}

// ---- Event wiring -------------------------------------------------------

el.newEntry.addEventListener("click", () => openPage(todayKey()));
el.openToday.addEventListener("click", () => openPage(todayKey()));
el.deleteEntry.addEventListener("click", deleteCurrent);

el.mood.addEventListener("input", scheduleSave);
el.editor.addEventListener("input", scheduleSave);
el.search.addEventListener("input", renderList);

// Change which day this page belongs to via the date picker.
el.pageDate.addEventListener("change", () => {
  const newKey = el.pageDate.value;
  if (!newKey || newKey === currentKey) return;

  // Move the current entry's content onto the newly chosen date.
  const moving = entries[currentKey];
  const isEmpty = !moving.mood && !moving.body;

  if (entries[newKey] && !isEmpty) {
    if (
      !confirm(
        `A page for ${formatLongDate(newKey)} already exists. Open it instead?`
      )
    ) {
      el.pageDate.value = currentKey; // revert picker
      return;
    }
    openPage(newKey);
    return;
  }

  delete entries[currentKey];
  moving.date = newKey;
  entries[newKey] = moving;
  saveEntries(entries);
  openPage(newKey);
});

// Save on the way out, just in case a debounce is pending.
window.addEventListener("beforeunload", flushSave);

// ---- Start up -----------------------------------------------------------

function init() {
  const keys = Object.keys(entries).sort().reverse();
  if (keys.length) {
    openPage(keys[0]); // open the most recent page
  } else {
    showEmpty();
  }
  renderList();
}

init();
