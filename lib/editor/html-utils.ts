// ============================================================================
// HTML Utils — DOMParser-based manipulation, path resolution, serialization
// ============================================================================

/**
 * Parse raw HTML string into a Document.
 */
export function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

/**
 * Serialize a Document back to a full HTML string.
 */
export function serializeHtml(doc: Document): string {
  return "<!DOCTYPE html>" + doc.documentElement.outerHTML;
}

/**
 * Resolve a path like "0>1>2" to an Element in the document.
 * Root path "" resolves to documentElement (html).
 */
export function resolvePathToElement(doc: Document, path: string | null): Element | null {
  if (path === null) return null;
  if (path === "") return doc.documentElement;

  const indices = path.split(">").map(Number);
  let current: Element = doc.documentElement;

  for (const index of indices) {
    const child = current.children[index];
    if (!child) return null;
    current = child;
  }

  return current;
}

/**
 * Assign data-editor-path to every element in the document tree.
 * Called before computing injected preview HTML.
 */
export function assignEditorPaths(doc: Document): void {
  function walk(el: Element, path: string) {
    el.setAttribute("data-editor-path", path);
    let childIndex = 0;
    for (const child of Array.from(el.children)) {
      walk(child, path ? `${path}>${childIndex}` : `${childIndex}`);
      childIndex++;
    }
  }
  walk(doc.documentElement, "");
}

/**
 * Check if Tailwind CDN is already in the HTML.
 */
export function hasTailwindCdn(html: string): boolean {
  return /cdn\.tailwindcss\.com/.test(html);
}

/**
 * Build the full injected HTML for the iframe srcDoc.
 * Injects: Tailwind CDN (if missing), editor paths, bridge script.
 */
export function buildInjectedHtml(rawHtml: string, bridgeScript: string): string {
  const doc = parseHtml(rawHtml);

  // Assign paths
  assignEditorPaths(doc);

  // Inject Tailwind CDN if missing
  if (!hasTailwindCdn(rawHtml)) {
    const script = doc.createElement("script");
    script.src = "https://cdn.tailwindcss.com";
    // Insert before first body child or at end of head
    if (doc.head) {
      doc.head.insertBefore(script, doc.head.firstChild);
    }
  }

  // Inject bridge script at end of body
  const bridgeEl = doc.createElement("script");
  bridgeEl.textContent = bridgeScript;
  doc.body.appendChild(bridgeEl);

  return "<!DOCTYPE html>" + doc.documentElement.outerHTML;
}

/**
 * Clean HTML for export: remove editor artifacts.
 */
export function cleanHtmlForExport(html: string, tailwindAutoInjected: boolean): string {
  const doc = parseHtml(html);

  // Remove all data-editor-* attributes
  doc.querySelectorAll("[data-editor-path]").forEach((el) => {
    el.removeAttribute("data-editor-path");
  });

  // Remove bridge script (contains 'element-selected')
  doc.querySelectorAll("script").forEach((script) => {
    if (script.textContent?.includes("element-selected")) {
      script.remove();
    }
  });

  // Remove auto-injected Tailwind CDN
  if (tailwindAutoInjected) {
    doc.querySelectorAll("script").forEach((script) => {
      if (script.getAttribute("src")?.includes("cdn.tailwindcss.com")) {
        script.remove();
      }
    });
  }

  return serializeHtml(doc);
}

// ============================================================================
// DOM Tree Parsing (for ElementTree navigator)
// ============================================================================

export interface HtmlTreeNode {
  tag: string;
  classes: string[];
  text: string;
  children: HtmlTreeNode[];
  path: string;
}

function elementToTreeNode(el: Element, path: string): HtmlTreeNode {
  return {
    tag: el.tagName.toLowerCase(),
    classes: Array.from(el.classList),
    text: Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent ?? "")
      .join("")
      .trim(),
    path,
    children: Array.from(el.children).map((child, i) =>
      elementToTreeNode(child, path ? `${path}>${i}` : `${i}`)
    ),
  };
}

export function parseHtmlToTree(html: string): HtmlTreeNode {
  const doc = parseHtml(html);
  return elementToTreeNode(doc.documentElement, "");
}

/**
 * Get the direct text content of an element (text nodes only, not nested elements).
 */
export function getDirectText(el: Element): string {
  return Array.from(el.childNodes)
    .filter((n) => n.nodeType === 3)
    .map((n) => n.textContent ?? "")
    .join("");
}

/**
 * Check if element has a previous or next element sibling.
 */
export function canMoveUp(doc: Document, path: string | null): boolean {
  if (!path) return false;
  const el = resolvePathToElement(doc, path);
  return !!el?.previousElementSibling;
}

export function canMoveDown(doc: Document, path: string | null): boolean {
  if (!path) return false;
  const el = resolvePathToElement(doc, path);
  return !!el?.nextElementSibling;
}
