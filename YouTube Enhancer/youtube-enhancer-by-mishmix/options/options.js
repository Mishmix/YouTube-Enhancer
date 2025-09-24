import { GROUPS, TWEAKS } from '../content/tweaks.js';

const STORAGE_KEYS = ['flags', 'groups'];
const DEFAULT_FLAGS = Object.fromEntries(
  Object.keys(TWEAKS).map((id) => [id, Boolean(TWEAKS[id].defaultEnabled)])
);
const DEFAULT_GROUP_STATE = Object.fromEntries(
  Object.keys(GROUPS).map((groupId) => [groupId, true])
);
const SAVE_DEBOUNCE = 220;

const elements = {
  title: document.getElementById('app-title'),
  description: document.getElementById('app-desc'),
  about: document.getElementById('about'),
  enableAll: document.getElementById('enable-all'),
  reset: document.getElementById('reset'),
  export: document.getElementById('export'),
  import: document.getElementById('import'),
  search: document.getElementById('search'),
  searchLabel: document.getElementById('search-text'),
  searchWrapper: document.getElementById('search-label'),
  groups: document.getElementById('groups'),
  emptyState: document.getElementById('no-results'),
  toast: document.getElementById('toast'),
  fileInput: document.getElementById('import-input'),
  main: document.getElementById('main')
};

const groupOrder = Object.keys(GROUPS);
const tweakInputs = new Map();
const groupPanels = new Map();
const groupToggles = new Map();
const accordionButtons = new Map();

let flagsState = { ...DEFAULT_FLAGS };
let groupState = { ...DEFAULT_GROUP_STATE };
let saveTimer = null;
let toastTimer = null;

init().catch((error) => console.error('[YouTube Enhancer] options init failed', error));

async function init() {
  applyStaticText();
  const stored = await loadState();
  flagsState = normalizeFlags(stored.flags);
  groupState = normalizeGroups(stored.groups);
  renderGroups();
  bindEvents();
  updateAllInputs();
  applySearch('');
}

function applyStaticText() {
  elements.title.textContent = chrome.i18n.getMessage('appName');
  elements.description.textContent = chrome.i18n.getMessage('appDesc');
  elements.about.textContent = chrome.i18n.getMessage('about');
  elements.enableAll.textContent = chrome.i18n.getMessage('enableAll');
  elements.reset.textContent = chrome.i18n.getMessage('reset');
  elements.export.textContent = chrome.i18n.getMessage('export');
  elements.import.textContent = chrome.i18n.getMessage('import');
  const placeholder = chrome.i18n.getMessage('searchPlaceholder');
  elements.search.placeholder = placeholder;
  elements.searchLabel.textContent = placeholder;
  elements.search.setAttribute('aria-labelledby', 'search-text');
  elements.emptyState.textContent = chrome.i18n.getMessage('noResults');
}

function renderGroups() {
  elements.groups.innerHTML = '';
  for (const groupId of groupOrder) {
    const meta = GROUPS[groupId];
    const section = document.createElement('section');
    section.className = 'group';
    section.dataset.groupId = groupId;

    const header = document.createElement('div');
    header.className = 'group__header';

    const metaContainer = document.createElement('div');
    metaContainer.className = 'group__meta';
    const title = document.createElement('h2');
    title.className = 'group__title';
    title.id = `group-${groupId}-title`;
    title.textContent = chrome.i18n.getMessage(meta.titleKey);
    metaContainer.appendChild(title);
    if (meta.descriptionKey) {
      const descText = chrome.i18n.getMessage(meta.descriptionKey);
      if (descText) {
        const desc = document.createElement('p');
        desc.className = 'group__description';
        desc.textContent = descText;
        metaContainer.appendChild(desc);
      }
    }

    const controls = document.createElement('div');
    controls.className = 'group__controls';

    const accordion = document.createElement('button');
    accordion.type = 'button';
    accordion.className = 'group__accordion';
    accordion.setAttribute('aria-expanded', 'true');
    accordion.setAttribute('aria-controls', `group-${groupId}-panel`);
    accordion.innerHTML = `
      <span class="group__accordion-icon" aria-hidden="true">⌃</span>
      <span>${chrome.i18n.getMessage('toggleGroup')}</span>
    `;
    controls.appendChild(accordion);

    const groupSwitch = buildSwitch({
      id: `group-${groupId}-toggle`,
      checked: groupState[groupId],
      label: chrome.i18n.getMessage('groupToggle'),
      onChange: (checked) => {
        groupState[groupId] = checked;
        updateGroupState(groupId);
        queueSave();
      }
    });
    controls.appendChild(groupSwitch.container);

    header.append(metaContainer, controls);
    section.appendChild(header);

    const panel = document.createElement('div');
    panel.className = 'group__panel';
    panel.id = `group-${groupId}-panel`;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', title.id);

    const tweaks = meta.tweaks.map((id) => TWEAKS[id]).filter(Boolean);
    for (const tweak of tweaks) {
      const card = buildTweakCard(tweak);
      panel.appendChild(card);
    }

    section.appendChild(panel);
    elements.groups.appendChild(section);

    groupPanels.set(groupId, { panel, section });
    accordionButtons.set(groupId, accordion);
    groupToggles.set(groupId, groupSwitch.input);
  }
}

function buildSwitch({ id, checked, label, onChange, ariaLabel }) {
  const container = document.createElement('label');
  container.className = 'switch';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.className = 'switch__input';
  input.id = id;
  input.checked = Boolean(checked);
  input.setAttribute('role', 'switch');
  if (ariaLabel) {
    input.setAttribute('aria-label', ariaLabel);
  }
  input.setAttribute('aria-checked', input.checked ? 'true' : 'false');

  const track = document.createElement('span');
  track.className = 'switch__track';
  const thumb = document.createElement('span');
  thumb.className = 'switch__thumb';
  track.appendChild(thumb);

  const text = document.createElement('span');
  text.className = 'switch__label';
  text.textContent = label || '';

  container.append(input, track, text);
  input.addEventListener('change', () => {
    input.setAttribute('aria-checked', input.checked ? 'true' : 'false');
    onChange?.(input.checked);
  });

  return { container, input };
}

function buildTweakCard(tweak) {
  const card = document.createElement('article');
  card.className = 'tweak-card';
  card.dataset.tweakId = tweak.id;
  card.dataset.groupId = tweak.groupId;
  const titleText = chrome.i18n.getMessage(tweak.titleKey);
  const descText = chrome.i18n.getMessage(tweak.descKey);
  card.dataset.title = titleText.toLowerCase();
  card.dataset.description = descText.toLowerCase();

  const header = document.createElement('div');
  header.className = 'tweak-card__header';

  const title = document.createElement('h3');
  title.className = 'tweak-card__title';
  title.textContent = titleText;

  const tweakSwitch = buildSwitch({
    id: `tweak-${tweak.id}`,
    checked: flagsState[tweak.id],
    label: chrome.i18n.getMessage('tweakToggle'),
    ariaLabel: titleText,
    onChange: (checked) => {
      flagsState[tweak.id] = checked;
      queueSave();
    }
  });
  tweakSwitch.container.classList.add('tweak-card__switch');

  header.append(title, tweakSwitch.container);

  const description = document.createElement('p');
  description.className = 'tweak-card__description';
  description.textContent = descText;

  card.append(header, description);

  tweakInputs.set(tweak.id, {
    input: tweakSwitch.input,
    card,
    titleEl: title,
    descriptionEl: description,
    titleText,
    descText
  });

  return card;
}

function bindEvents() {
  elements.enableAll.addEventListener('click', () => {
    for (const key of Object.keys(flagsState)) {
      flagsState[key] = true;
    }
    for (const groupId of Object.keys(groupState)) {
      groupState[groupId] = true;
    }
    updateAllInputs();
    applySearch(elements.search.value || '');
    queueSave();
    focusMain();
  });

  elements.reset.addEventListener('click', () => {
    flagsState = { ...DEFAULT_FLAGS };
    groupState = { ...DEFAULT_GROUP_STATE };
    updateAllInputs();
    applySearch(elements.search.value || '');
    queueSave();
    focusMain();
  });

  elements.export.addEventListener('click', () => {
    const payload = { flags: flagsState, groups: groupState };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'youtube-enhancer-by-mishmix.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  });

  elements.import.addEventListener('click', () => {
    elements.fileInput.value = '';
    elements.fileInput.click();
  });

  elements.fileInput.addEventListener('change', async () => {
    const file = elements.fileInput.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      validateImportedState(parsed);
      flagsState = normalizeFlags(parsed.flags);
      groupState = normalizeGroups(parsed.groups);
      updateAllInputs();
      applySearch(elements.search.value || '');
      queueSave();
      showToast(chrome.i18n.getMessage('importSuccess'));
    } catch (err) {
      console.warn('[YouTube Enhancer] import failed', err);
      showToast(chrome.i18n.getMessage('importError'));
    }
  });

  elements.search.addEventListener('input', (event) => {
    const value = event.target.value || '';
    applySearch(value);
  });

  for (const [groupId, button] of accordionButtons.entries()) {
    button.addEventListener('click', () => toggleAccordion(groupId));
  }
}

function updateAllInputs() {
  for (const [groupId, toggle] of groupToggles.entries()) {
    toggle.checked = Boolean(groupState[groupId]);
    toggle.setAttribute('aria-checked', toggle.checked ? 'true' : 'false');
    updateGroupState(groupId);
  }
  for (const [tweakId, info] of tweakInputs.entries()) {
    info.input.checked = Boolean(flagsState[tweakId]);
    info.input.setAttribute('aria-checked', info.input.checked ? 'true' : 'false');
  }
}

function updateGroupState(groupId) {
  const enabled = groupState[groupId] !== false;
  const toggle = groupToggles.get(groupId);
  if (toggle) {
    toggle.checked = enabled;
    toggle.setAttribute('aria-checked', enabled ? 'true' : 'false');
  }
  const { panel, section } = groupPanels.get(groupId) || {};
  if (!panel || !section) return;
  const tweaks = GROUPS[groupId]?.tweaks || [];
  for (const tweakId of tweaks) {
    const info = tweakInputs.get(tweakId);
    if (!info) continue;
    info.input.disabled = !enabled;
    info.card.setAttribute('aria-disabled', enabled ? 'false' : 'true');
  }
}

function toggleAccordion(groupId) {
  const accordion = accordionButtons.get(groupId);
  const { panel } = groupPanels.get(groupId) || {};
  if (!accordion || !panel) return;
  const expanded = accordion.getAttribute('aria-expanded') === 'true';
  accordion.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (expanded) {
    panel.setAttribute('hidden', '');
  } else {
    panel.removeAttribute('hidden');
  }
}

function applySearch(rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  let visibleCards = 0;

  for (const info of tweakInputs.values()) {
    const match = !query || info.titleText.toLowerCase().includes(query) || info.descText.toLowerCase().includes(query);
    if (match) {
      info.card.removeAttribute('hidden');
      renderHighlight(info.titleEl, info.titleText, query);
      renderHighlight(info.descriptionEl, info.descText, query);
      visibleCards += 1;
    } else {
      info.card.setAttribute('hidden', '');
      renderHighlight(info.titleEl, info.titleText, '');
      renderHighlight(info.descriptionEl, info.descText, '');
    }
  }

  for (const [groupId, { panel, section }] of groupPanels.entries()) {
    const anyVisible = Array.from(panel.children).some((child) => !child.hasAttribute('hidden'));
    if (anyVisible) {
      section.removeAttribute('hidden');
    } else {
      section.setAttribute('hidden', '');
    }
  }

  if (visibleCards === 0) {
    elements.emptyState.hidden = false;
  } else {
    elements.emptyState.hidden = true;
  }
}

function renderHighlight(node, text, query) {
  if (!node) return;
  node.innerHTML = '';
  if (!query) {
    node.textContent = text;
    return;
  }
  const lower = text.toLowerCase();
  let index = lower.indexOf(query);
  let cursor = 0;
  while (index !== -1) {
    if (index > cursor) {
      node.append(document.createTextNode(text.slice(cursor, index)));
    }
    const mark = document.createElement('mark');
    mark.textContent = text.slice(index, index + query.length);
    node.append(mark);
    cursor = index + query.length;
    index = lower.indexOf(query, cursor);
  }
  if (cursor < text.length) {
    node.append(document.createTextNode(text.slice(cursor)));
  }
}

function queueSave() {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(() => {
    saveTimer = null;
    saveState().catch((error) => console.error('[YouTube Enhancer] save failed', error));
  }, SAVE_DEBOUNCE);
}

async function saveState() {
  const payload = { flags: flagsState, groups: groupState };
  const synced = await storageSet('sync', payload);
  if (!synced) {
    await storageSet('local', payload);
  } else {
    await storageSet('local', payload);
  }
  showToast(chrome.i18n.getMessage('savedToast'));
}

async function loadState() {
  const syncData = await storageGet('sync', STORAGE_KEYS);
  const localData = await storageGet('local', STORAGE_KEYS);
  return {
    flags: syncData?.flags ?? localData?.flags ?? { ...DEFAULT_FLAGS },
    groups: syncData?.groups ?? localData?.groups ?? { ...DEFAULT_GROUP_STATE }
  };
}

function normalizeFlags(raw) {
  const normalized = { ...DEFAULT_FLAGS };
  if (!raw || typeof raw !== 'object') {
    return normalized;
  }
  for (const key of Object.keys(DEFAULT_FLAGS)) {
    if (typeof raw[key] === 'boolean') {
      normalized[key] = raw[key];
    }
  }
  return normalized;
}

function normalizeGroups(raw) {
  const normalized = { ...DEFAULT_GROUP_STATE };
  if (!raw || typeof raw !== 'object') {
    return normalized;
  }
  for (const key of Object.keys(DEFAULT_GROUP_STATE)) {
    if (typeof raw[key] === 'boolean') {
      normalized[key] = raw[key];
    }
  }
  return normalized;
}

function validateImportedState(state) {
  if (!state || typeof state !== 'object') {
    throw new Error('Invalid state');
  }
  if (!state.flags || typeof state.flags !== 'object') {
    throw new Error('Invalid flags');
  }
  if (!state.groups || typeof state.groups !== 'object') {
    throw new Error('Invalid groups');
  }
}

function showToast(message) {
  if (!message) return;
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  elements.toast.dataset.visible = 'true';
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(() => {
    elements.toast.dataset.visible = 'false';
    toastTimer = setTimeout(() => {
      elements.toast.hidden = true;
      elements.toast.textContent = '';
    }, 250);
  }, 1600);
}

function focusMain() {
  elements.main?.focus?.();
}

async function storageGet(area, keys) {
  return new Promise((resolve) => {
    try {
      chrome.storage[area].get(keys, (result) => {
        if (chrome.runtime.lastError) {
          console.warn('[YouTube Enhancer] storage get failed', chrome.runtime.lastError);
          resolve(null);
          return;
        }
        resolve(result);
      });
    } catch (err) {
      console.warn('[YouTube Enhancer] storage get threw', err);
      resolve(null);
    }
  });
}

async function storageSet(area, payload) {
  return new Promise((resolve) => {
    try {
      chrome.storage[area].set(payload, () => {
        if (chrome.runtime.lastError) {
          console.warn('[YouTube Enhancer] storage set failed', chrome.runtime.lastError);
          resolve(false);
          return;
        }
        resolve(true);
      });
    } catch (err) {
      console.warn('[YouTube Enhancer] storage set threw', err);
      resolve(false);
    }
  });
}
