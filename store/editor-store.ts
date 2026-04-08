"use client";

import { create } from "zustand";
import {
  parseHtml,
  serializeHtml,
  resolvePathToElement,
  cleanHtmlForExport,
} from "@/lib/editor/html-utils";

export interface EditorState {
  // ---- Content ----
  html: string;
  history: string[];
  historyIndex: number;
  tailwindAutoInjected: boolean;

  // ---- Selection ----
  selectedPath: string | null;
  selectedTag: string;
  selectedClasses: string[];
  selectedText: string;
  selectedAttrs: Record<string, string>;

  // ---- UI State ----
  view: "preview" | "code";
  leftPanel: "none" | "tree" | "add";
  device: "mobile" | "tablet" | "desktop";

  // ---- Modals ----
  showPasteModal: boolean;
  showConfirmDelete: boolean;

  // ---- Actions ----
  setHtml: (html: string, addHistory?: boolean) => void;
  loadHtml: (html: string) => void;
  selectElement: (
    path: string | null,
    tag?: string,
    classes?: string[],
    text?: string,
    attrs?: Record<string, string>
  ) => void;
  applyClassChange: (classes: string[]) => void;
  applyTextChange: (text: string) => void;
  applyAttrChange: (name: string, value: string) => void;
  removeAttr: (name: string) => void;
  deleteElement: () => void;
  duplicateElement: () => void;
  moveElement: (direction: "up" | "down") => void;
  addElement: (html: string, position: "inside" | "before" | "after") => void;
  undo: () => void;
  redo: () => void;
  setView: (view: "preview" | "code") => void;
  setLeftPanel: (panel: "none" | "tree" | "add") => void;
  setDevice: (device: "mobile" | "tablet" | "desktop") => void;
  setShowPasteModal: (show: boolean) => void;
  setShowConfirmDelete: (show: boolean) => void;
  copyCleanHtml: () => Promise<void>;
}

function pushHistory(state: Pick<EditorState, "history" | "historyIndex">, html: string) {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(html);
  if (newHistory.length > 100) newHistory.shift();
  return { history: newHistory, historyIndex: newHistory.length - 1 };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  html: "",
  history: [],
  historyIndex: -1,
  tailwindAutoInjected: false,

  selectedPath: null,
  selectedTag: "",
  selectedClasses: [],
  selectedText: "",
  selectedAttrs: {},

  view: "preview",
  leftPanel: "none",
  device: "desktop",

  showPasteModal: true,
  showConfirmDelete: false,

  // ---- setHtml: core mutation + history ----
  setHtml: (html: string, addHistory = true) => {
    set((state) => {
      if (addHistory) {
        return {
          html,
          ...pushHistory(state, html),
          selectedPath: null,
          selectedTag: "",
          selectedClasses: [],
          selectedText: "",
          selectedAttrs: {},
        };
      }
      return {
        html,
        selectedPath: null,
        selectedTag: "",
        selectedClasses: [],
        selectedText: "",
        selectedAttrs: {},
      };
    });
  },

  // ---- loadHtml: first load or paste ----
  loadHtml: (html: string) => {
    // Check if Tailwind CDN is present
    const hasTailwind = /cdn\.tailwindcss\.com/.test(html);
    set({
      html,
      tailwindAutoInjected: !hasTailwind,
      history: [html],
      historyIndex: 0,
      selectedPath: null,
      selectedTag: "",
      selectedClasses: [],
      selectedText: "",
      selectedAttrs: {},
      showPasteModal: false,
    });
  },

  // ---- selectElement ----
  selectElement: (path, tag = "", classes = [], text = "", attrs = {}) => {
    set({
      selectedPath: path,
      selectedTag: tag,
      selectedClasses: classes,
      selectedText: text,
      selectedAttrs: attrs,
    });
  },

  // ---- applyClassChange ----
  applyClassChange: (classes: string[]) => {
    const { html, selectedPath, history, historyIndex } = get();
    if (!selectedPath) return;
    const doc = parseHtml(html);
    const el = resolvePathToElement(doc, selectedPath);
    if (!el) return;
    el.className = classes.join(" ");
    const newHtml = serializeHtml(doc);
    set({ html: newHtml, selectedClasses: classes, ...pushHistory({ history, historyIndex }, html) });
  },

  // ---- applyTextChange ----
  applyTextChange: (text: string) => {
    const { html, selectedPath, history, historyIndex } = get();
    if (!selectedPath) return;
    const doc = parseHtml(html);
    const el = resolvePathToElement(doc, selectedPath);
    if (!el) return;
    // Replace direct text nodes only
    const textNodes = Array.from(el.childNodes).filter((n) => n.nodeType === 3);
    if (textNodes.length > 0) {
      textNodes.forEach((n, i) => {
        if (i === 0) n.textContent = text;
        else n.textContent = "";
      });
    } else {
      // No existing text node — prepend one
      el.insertBefore(doc.createTextNode(text), el.firstChild);
    }
    const newHtml = serializeHtml(doc);
    set({ html: newHtml, selectedText: text, ...pushHistory({ history, historyIndex }, html) });
  },

  // ---- applyAttrChange ----
  applyAttrChange: (name: string, value: string) => {
    const { html, selectedPath, selectedAttrs, history, historyIndex } = get();
    if (!selectedPath) return;
    const doc = parseHtml(html);
    const el = resolvePathToElement(doc, selectedPath);
    if (!el) return;
    el.setAttribute(name, value);
    const newHtml = serializeHtml(doc);
    const newAttrs = { ...selectedAttrs, [name]: value };
    set({ html: newHtml, selectedAttrs: newAttrs, ...pushHistory({ history, historyIndex }, html) });
  },

  // ---- removeAttr ----
  removeAttr: (name: string) => {
    const { html, selectedPath, selectedAttrs, history, historyIndex } = get();
    if (!selectedPath) return;
    const doc = parseHtml(html);
    const el = resolvePathToElement(doc, selectedPath);
    if (!el) return;
    el.removeAttribute(name);
    const newHtml = serializeHtml(doc);
    const newAttrs = { ...selectedAttrs };
    delete newAttrs[name];
    set({ html: newHtml, selectedAttrs: newAttrs, ...pushHistory({ history, historyIndex }, html) });
  },

  // ---- deleteElement ----
  deleteElement: () => {
    const { html, selectedPath, history, historyIndex } = get();
    if (!selectedPath) return;
    const doc = parseHtml(html);
    const el = resolvePathToElement(doc, selectedPath);
    if (!el?.parentElement) return;
    el.parentElement.removeChild(el);
    const newHtml = serializeHtml(doc);
    set({
      html: newHtml,
      selectedPath: null,
      selectedTag: "",
      selectedClasses: [],
      selectedText: "",
      selectedAttrs: {},
      showConfirmDelete: false,
      ...pushHistory({ history, historyIndex }, html),
    });
  },

  // ---- duplicateElement ----
  duplicateElement: () => {
    const { html, selectedPath, history, historyIndex } = get();
    if (!selectedPath) return;
    const doc = parseHtml(html);
    const el = resolvePathToElement(doc, selectedPath);
    if (!el?.parentElement) return;
    const clone = el.cloneNode(true) as Element;
    el.parentElement.insertBefore(clone, el.nextSibling);
    const newHtml = serializeHtml(doc);
    // New path: last sibling index + 1
    const parts = selectedPath.split(">");
    const lastIndex = parseInt(parts[parts.length - 1], 10);
    const newPath = [...parts.slice(0, -1), lastIndex + 1].join(">");
    set({ html: newHtml, selectedPath: newPath, ...pushHistory({ history, historyIndex }, html) });
  },

  // ---- moveElement ----
  moveElement: (direction: "up" | "down") => {
    const { html, selectedPath, history, historyIndex } = get();
    if (!selectedPath) return;
    const doc = parseHtml(html);
    const el = resolvePathToElement(doc, selectedPath);
    if (!el?.parentElement) return;

    if (direction === "up" && el.previousElementSibling) {
      el.parentElement.insertBefore(el, el.previousElementSibling);
    } else if (direction === "down" && el.nextElementSibling) {
      el.parentElement.insertBefore(el.nextElementSibling, el);
    } else {
      return;
    }

    const newHtml = serializeHtml(doc);
    const parts = selectedPath.split(">");
    const lastIndex = parseInt(parts[parts.length - 1], 10);
    const delta = direction === "up" ? -1 : 1;
    const newPath = [...parts.slice(0, -1), lastIndex + delta].join(">");
    set({ html: newHtml, selectedPath: newPath, ...pushHistory({ history, historyIndex }, html) });
  },

  // ---- addElement ----
  addElement: (elementHtml: string, position: "inside" | "before" | "after") => {
    const { html, selectedPath, history, historyIndex } = get();
    const doc = parseHtml(html);
    const parser = new DOMParser();
    const fragmentDoc = parser.parseFromString(`<div>${elementHtml}</div>`, "text/html");
    const newEl = fragmentDoc.body.firstElementChild?.firstElementChild;
    if (!newEl) return;

    let targetEl: Element | null = null;
    if (selectedPath) {
      targetEl = resolvePathToElement(doc, selectedPath);
    } else {
      targetEl = doc.body;
      position = "inside";
    }
    if (!targetEl) return;

    const imported = doc.importNode(newEl, true);
    if (position === "inside") {
      targetEl.appendChild(imported);
    } else if (position === "before" && targetEl.parentElement) {
      targetEl.parentElement.insertBefore(imported, targetEl);
    } else if (position === "after" && targetEl.parentElement) {
      targetEl.parentElement.insertBefore(imported, targetEl.nextSibling);
    }

    const newHtml = serializeHtml(doc);
    set({ html: newHtml, ...pushHistory({ history, historyIndex }, html) });
  },

  // ---- undo ----
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        historyIndex: newIndex,
        html: history[newIndex],
        selectedPath: null,
        selectedTag: "",
        selectedClasses: [],
        selectedText: "",
        selectedAttrs: {},
      });
    }
  },

  // ---- redo ----
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        historyIndex: newIndex,
        html: history[newIndex],
        selectedPath: null,
        selectedTag: "",
        selectedClasses: [],
        selectedText: "",
        selectedAttrs: {},
      });
    }
  },

  setView: (view) => set({ view }),
  setLeftPanel: (leftPanel) => set({ leftPanel }),
  setDevice: (device) => set({ device }),
  setShowPasteModal: (showPasteModal) => set({ showPasteModal }),
  setShowConfirmDelete: (showConfirmDelete) => set({ showConfirmDelete }),

  // ---- copyCleanHtml ----
  copyCleanHtml: async () => {
    const { html, tailwindAutoInjected } = get();
    const clean = cleanHtmlForExport(html, tailwindAutoInjected);
    await navigator.clipboard.writeText(clean);
  },
}));
