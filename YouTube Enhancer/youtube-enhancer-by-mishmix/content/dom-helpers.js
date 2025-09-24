/**
 * @param {string} selector
 * @param {ParentNode} [root=document]
 * @returns {Element[]}
 */
export function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/**
 * @param {Element} el
 * @returns {(HTMLElement|null)}
 */
export function closestEntry(el) {
  return el.closest(
    'ytd-guide-entry-renderer, ytd-guide-collapsible-section-entry-renderer, tp-yt-paper-item'
  );
}

/**
 * @param {string[]} patterns
 */
export function hideEntryByHref(patterns) {
  if (!patterns || !patterns.length) {
    return;
  }

  const anchors = $all('a.yt-simple-endpoint[href]');
  for (const anchor of anchors) {
    const href = anchor.getAttribute('href');
    if (!href) continue;
    if (patterns.some((pattern) => hrefMatchesPattern(href, pattern))) {
      const entry = closestEntry(anchor);
      if (entry) {
        entry.setAttribute('data-yte-hidden', '1');
      }
    }
  }
}

export function hideSubscriptionsChannelsList() {
  const headerLink = document.querySelector('a.yt-simple-endpoint[href="/feed/channels"]');
  if (!headerLink) return;
  const collapsible = headerLink.closest('ytd-guide-collapsible-section-entry-renderer');
  if (!collapsible) return;
  const sectionItems = collapsible.querySelector('#section-items');
  if (sectionItems) {
    sectionItems.setAttribute('data-yte-hidden', '1');
  }
}

/**
 * @param {string} sectionHeaderHref
 */
export function removeEmptySectionIfNoVisibleEntries(sectionHeaderHref) {
  if (!sectionHeaderHref) return;
  const headerLink = document.querySelector(
    `a.yt-simple-endpoint[href="${CSS.escape(sectionHeaderHref)}"]`
  );
  if (!headerLink) return;
  const section = headerLink.closest(
    'ytd-guide-section-renderer, ytd-guide-collapsible-section-entry-renderer'
  );
  if (!section) return;
  const sectionItems = section.querySelector('#section-items') || section;
  const items = Array.from(sectionItems.children).filter((node) => node instanceof HTMLElement);
  const hasVisibleEntry = items.some((item) => item.getAttribute('data-yte-hidden') !== '1');
  if (!hasVisibleEntry) {
    section.setAttribute('data-yte-hidden', '1');
  }
}

/**
 * @param {string[]} endpoints
 * @returns {(HTMLElement|null)}
 */
export function findSectionByAnyEndpoint(endpoints) {
  if (!endpoints || !endpoints.length) {
    return null;
  }
  const anchors = $all('a.yt-simple-endpoint[href]');
  for (const anchor of anchors) {
    const href = anchor.getAttribute('href');
    if (!href) continue;
    if (endpoints.some((endpoint) => hrefMatchesPattern(href, endpoint))) {
      const section = anchor.closest('ytd-guide-section-renderer');
      if (section) {
        return section;
      }
      const collapsible = anchor.closest('ytd-guide-collapsible-section-entry-renderer');
      if (collapsible) {
        return collapsible;
      }
    }
  }
  return null;
}

const pendingBatches = new Map();
const DEFAULT_DELAY = 220;

/**
 * @param {() => void} fn
 * @param {string} [key='default']
 */
export function deferApply(fn, key = 'default') {
  const existing = pendingBatches.get(key);
  if (existing) {
    clearTimeout(existing);
  }
  const timer = setTimeout(() => {
    pendingBatches.delete(key);
    try {
      fn();
    } catch (err) {
      console.error('[YouTube Enhancer] apply failed', err);
    }
  }, DEFAULT_DELAY);
  pendingBatches.set(key, timer);
}

function hrefMatchesPattern(href, pattern) {
  if (!pattern) return false;
  if (href === pattern) return true;
  if (href.startsWith(pattern)) return true;
  if (pattern.startsWith('/') && href.startsWith(window.location.origin + pattern)) {
    return true;
  }
  return false;
}
