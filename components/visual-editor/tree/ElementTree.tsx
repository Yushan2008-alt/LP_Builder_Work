"use client";

import { useMemo, useCallback } from "react";
import { useEditorStore } from "@/store/editor-store";
import { parseHtmlToTree, parseHtml, resolvePathToElement, getDirectText } from "@/lib/editor/html-utils";
import TreeNode from "./TreeNode";

export default function ElementTree() {
  const { html, selectedPath, selectElement } = useEditorStore();

  const tree = useMemo(() => {
    if (!html) return null;
    return parseHtmlToTree(html);
  }, [html]);

  // When clicking a tree node, resolve the element to get tag/classes/text/attrs
  const handleSelect = useCallback((path: string) => {
    if (!html) return;
    const doc = parseHtml(html);
    const el = resolvePathToElement(doc, path);
    if (!el) {
      selectElement(path);
      return;
    }
    const tag = el.tagName.toLowerCase();
    const classes = Array.from(el.classList);
    const text = getDirectText(el);
    const attrs: Record<string, string> = {};
    for (const attr of Array.from(el.attributes)) {
      if (attr.name !== "class" && !attr.name.startsWith("data-editor-")) {
        attrs[attr.name] = attr.value;
      }
    }
    selectElement(path, tag, classes, text, attrs);
  }, [html, selectElement]);

  if (!html) {
    return (
      <div className="p-3 text-xs text-gray-400 text-center">
        No HTML loaded.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
        <h3 className="text-xs font-semibold text-gray-700">DOM Tree</h3>
      </div>
      <div className="py-1">
        {tree && (
          <TreeNode
            node={tree}
            selectedPath={selectedPath}
            onSelect={handleSelect}
            depth={0}
          />
        )}
      </div>
    </div>
  );
}
