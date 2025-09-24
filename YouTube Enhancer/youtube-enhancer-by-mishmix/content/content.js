import {
  $all,
  hideEntryByHref,
  hideSubscriptionsChannelsList,
  removeEmptySectionIfNoVisibleEntries,
  findSectionByAnyEndpoint,
  deferApply
} from './dom-helpers.js';
import { GROUPS, TWEAKS } from './tweaks.js';

const STORAGE_KEYS = ['flags', 'groups'];
const DEFAULT_FLAGS = Object.fromEntries(
  Object.keys(TWEAKS).map((id) => [id, Boolean(TWEAKS[id].defaultEnabled)])
);
const DEFAULT_GROUP_STATE = Object.fromEntries(
  Object.keys(GROUPS).map((groupId) => [groupId, true])
);
const APPLY_SEQUENCE = [
  'hideHome',
  'hideSubscriptionsMenuItem',
  'hideShortsMenuItem',
  'hideYouTubeMusicMenuItem',
  'hideDownloads',
  'hideYourVideos',
  'hideNavigatorBlock',
  'hideHistory',
  'hidePlaylists',
  'hideWatchLater',
  'hideLiked',
  'hideYourClips',
  'hideYouTubeStudio',
  'hideYouTubeKids',
  'hideReportHistory',
  'hideHelp',
  'hideSendFeedback',
  'hideGuidePrimarySecondaryLinks',
  'removeCopyrightNode',
  'hideSettings',
  'hideSubscriptionsChannelsList',
  'removeEmptySubscriptionsBlock',
  'hideMoreFromYouTubeBlockWhenEmpty'
];

const NAVIGATOR_ENDPOINTS = [
  '/feed/storefront',
  '/gaming',
  '/channel/UC-9-kyTW8ZkZNDHQJ6FgpwQ',
  '/channel/UCEgdi0XIXXZ-qJOFPf4JSKw',
  '/feed/courses_destination',
  '/playables'
];

const MORE_FROM_YOUTUBE_ENDPOINTS = [
  'https://studio.youtube.com',
  'https://www.youtubekids.com',
  '/channel/UCBR8-60-B28hp2BmDPdntcQ',
  '/channel/UClgRkhTL3_hImCAmdLfDE4g',
  '/channel/UCOpNcN46UbXVtpKMrmU4Abg',
  '/channel/UCR1IuLEqb6UEA_zQ81kwXfg',
  '/gaming',
  '/fashion',
  '/learning',
  '/news',
  '/live',
  '/feed/storefront'
];

let styleInjected = false;
let flagsCache = { ...DEFAULT_FLAGS };
let groupsCache = { ...DEFAULT_GROUP_STATE };

init().catch((error) => console.error('[YouTube Enhancer] init failed', error));

async function init() {
  await injectStyles();
  const stored = await loadState();
  flagsCache = normalizeFlags(stored.flags);
  groupsCache = normalizeGroups(stored.groups);
  applyCurrentState();
  setupListeners();
}

function applyCurrentState() {
  scheduleApply();
}

function scheduleApply() {
  deferApply(() => {
    const effectiveFlags = computeEffectiveFlags();
    applyAll(effectiveFlags);
  }, 'apply');
}

function computeEffectiveFlags() {
  const effective = { ...DEFAULT_FLAGS };
  for (const [id, value] of Object.entries(flagsCache)) {
    const groupId = TWEAKS[id]?.groupId;
    const groupEnabled = groupId ? groupsCache[groupId] !== false : true;
    effective[id] = Boolean(value) && groupEnabled;
  }
  return effective;
}

function applyAll(flags) {
  updateRootAttributes(flags);
  resetHiddenMarkers();
  for (const id of APPLY_SEQUENCE) {
    if (!flags[id]) continue;
    const action = ACTIONS[id];
    if (action) {
      action();
    }
  }
}

const ACTIONS = {
  hideHome() {
    hideEntryByHref(['/']);
  },
  hideSubscriptionsMenuItem() {
    hideEntryByHref(['/feed/subscriptions']);
  },
  hideSubscriptionsChannelsList() {
    hideSubscriptionsChannelsList();
  },
  removeEmptySubscriptionsBlock() {
    removeEmptySectionIfNoVisibleEntries('/feed/channels');
  },
  hideShortsMenuItem() {
    hideEntryByHref(['/shorts']);
  },
  hideYouTubeMusicMenuItem() {
    hideEntryByHref(['https://music.youtube.com']);
  },
  hideDownloads() {
    hideEntryByHref(['/feed/downloads']);
  },
  hideYourVideos() {
    applyHideYourVideos();
  },
  hideNavigatorBlock() {
    const section = findSectionByAnyEndpoint(NAVIGATOR_ENDPOINTS);
    if (section) {
      section.setAttribute('data-yte-hidden', '1');
    }
  },
  hideHistory() {
    hideEntryByHref(['/feed/history']);
  },
  hidePlaylists() {
    hideEntryByHref(['/feed/playlists']);
    hideCustomPlaylists();
  },
  hideWatchLater() {
    hideEntryByHref(['/playlist?list=WL']);
  },
  hideLiked() {
    hideEntryByHref(['/playlist?list=LL']);
  },
  hideYourClips() {
    hideEntryByHref(['/feed/clips']);
  },
  hideYouTubeStudio() {
    hideEntryByHref(['https://studio.youtube.com']);
  },
  hideYouTubeKids() {
    hideEntryByHref(['https://www.youtubekids.com']);
  },
  hideMoreFromYouTubeBlockWhenEmpty() {
    const section = findSectionByAnyEndpoint(MORE_FROM_YOUTUBE_ENDPOINTS);
    if (!section) return;
    const sectionItems = section.querySelector('#section-items') || section;
    const items = Array.from(sectionItems.children).filter((node) => node instanceof HTMLElement);
    const hasVisibleEntry = items.some((item) => item.getAttribute('data-yte-hidden') !== '1');
    if (!hasVisibleEntry) {
      section.setAttribute('data-yte-hidden', '1');
    }
  },
  hideReportHistory() {
    hideEntryByHref(['/reporthistory']);
  },
  hideHelp() {
    hideEntryByHref(['/help', '/t/']);
  },
  hideSendFeedback() {
    hideEntryByHref(['/feedback', '/send_feedback']);
  },
  hideGuidePrimarySecondaryLinks() {
    const guideLinks = [
      document.getElementById('guide-links-primary'),
      document.getElementById('guide-links-secondary')
    ];
    for (const el of guideLinks) {
      if (el) {
        el.setAttribute('data-yte-hidden', '1');
      }
    }
  },
  removeCopyrightNode() {
    const copyrightNode = document.getElementById('copyright');
    if (copyrightNode) {
      copyrightNode.remove();
    }
  },
  hideSettings() {
    hideEntryByHref(['/account']);
  }
};

function applyHideYourVideos() {
  const anchors = $all('a.yt-simple-endpoint[href]');
  for (const anchor of anchors) {
    const href = anchor.getAttribute('href');
    if (!href) continue;
    if (href.startsWith('/feed/library')) {
      const entry = anchor.closest('ytd-guide-entry-renderer, tp-yt-paper-item');
      if (entry) {
        entry.setAttribute('data-yte-hidden', '1');
      }
      continue;
    }
    if (href.endsWith('/videos') && (href.includes('/@') || href.includes('/channel/'))) {
      const entry = anchor.closest('ytd-guide-entry-renderer, tp-yt-paper-item');
      if (entry) {
        entry.setAttribute('data-yte-hidden', '1');
      }
    }
  }
}

function hideCustomPlaylists() {
  const anchors = $all('a.yt-simple-endpoint[href^="/playlist?list="]');
  for (const anchor of anchors) {
    const href = anchor.getAttribute('href');
    if (!href) continue;
    if (href.includes('list=WL') || href.includes('list=LL')) {
      continue;
    }
    const entry = anchor.closest('ytd-guide-entry-renderer, tp-yt-paper-item');
    if (entry) {
      entry.setAttribute('data-yte-hidden', '1');
    }
  }
}

function updateRootAttributes(flags) {
  const root = document.documentElement;
  for (const id of Object.keys(DEFAULT_FLAGS)) {
    const attr = toDataAttrName(id);
    root.setAttribute(attr, flags[id] ? '1' : '0');
  }
}

function resetHiddenMarkers() {
  const nodes = document.querySelectorAll('[data-yte-hidden]');
  for (const node of nodes) {
    node.removeAttribute('data-yte-hidden');
  }
}

function toDataAttrName(id) {
  return `data-yte-${id.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
}

function setupListeners() {
  document.addEventListener('yt-navigate-finish', scheduleApply);

  const observer = new MutationObserver(() => scheduleApply());
  waitForAppElement().then((app) => {
    if (app) {
      observer.observe(app, { childList: true, subtree: true });
    }
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'sync' && areaName !== 'local') {
      return;
    }
    if (changes.flags) {
      flagsCache = normalizeFlags(changes.flags.newValue);
    }
    if (changes.groups) {
      groupsCache = normalizeGroups(changes.groups.newValue);
    }
    scheduleApply();
  });
}

async function waitForAppElement() {
  const existing = document.querySelector('ytd-app');
  if (existing) {
    return existing;
  }
  return new Promise((resolve) => {
    const check = () => {
      const app = document.querySelector('ytd-app');
      if (app) {
        resolve(app);
      } else {
        requestAnimationFrame(check);
      }
    };
    check();
  });
}

async function loadState() {
  const defaults = { flags: { ...DEFAULT_FLAGS }, groups: { ...DEFAULT_GROUP_STATE } };
  const syncData = await storageGet('sync', STORAGE_KEYS);
  const localData = await storageGet('local', STORAGE_KEYS);

  const flags = syncData?.flags ?? localData?.flags ?? defaults.flags;
  const groups = syncData?.groups ?? localData?.groups ?? defaults.groups;

  return {
    flags,
    groups
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

async function injectStyles() {
  if (styleInjected) return;
  await waitForHead();
  const url = chrome.runtime.getURL('content/styles.css');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
  styleInjected = true;
}

async function waitForHead() {
  if (document.head) {
    return;
  }
  await new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (document.head) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.documentElement, { childList: true });
  });
}

function storageGet(area, keys) {
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
