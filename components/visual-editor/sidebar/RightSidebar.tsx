"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/store/editor-store";
import { parseHtml } from "@/lib/editor/html-utils";
import ClassEditor from "./ClassEditor";
import TextEditor from "./TextEditor";
import AttributeEditor from "./AttributeEditor";
import { cn } from "@/lib/utils";
import { useRenderTrace } from "@/lib/hooks/useRenderTrace";

export default function RightSidebar() {
  const selectedPath = useEditorStore((state) => state.selectedPath);
  const selectedTag = useEditorStore((state) => state.selectedTag);
  const selectedClasses = useEditorStore((state) => state.selectedClasses);
  const selectedText = useEditorStore((state) => state.selectedText);
  const selectedAttrs = useEditorStore((state) => state.selectedAttrs);
  const html = useEditorStore((state) => state.html);
  const selectElement = useEditorStore((state) => state.selectElement);
  const applyClassChange = useEditorStore((state) => state.applyClassChange);
  const applyTextChange = useEditorStore((state) => state.applyTextChange);
  const applyAttrChange = useEditorStore((state) => state.applyAttrChange);
  const removeAttr = useEditorStore((state) => state.removeAttr);
  const duplicateElement = useEditorStore((state) => state.duplicateElement);
  const moveElement = useEditorStore((state) => state.moveElement);
  const setShowConfirmDelete = useEditorStore((state) => state.setShowConfirmDelete);

  useRenderTrace("RightSidebar", { hasSelection: !!selectedPath, selectedTag });

  if (!selectedPath) {
    return (
      <div className="w-64 bg-white border-l border-gray-200 flex items-center justify-center text-gray-400 text-xs text-center p-4">
        Click an element in the preview to select and edit it.
      </div>
    );
  }

  // Check move capability
  const el = useMemo(() => {
    if (!html) return null;
    const doc = parseHtml(html);
    const parts = selectedPath.split(">");
    let cur: Element = doc.documentElement;
    for (const part of parts) {
      const child = cur.children[parseInt(part, 10)];
      if (!child) return null;
      cur = child;
    }
    return cur;
  }, [html, selectedPath]);

  const canMoveUp = !!(el?.previousElementSibling);
  const canMoveDown = !!(el?.nextElementSibling);

  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-3 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              &lt;{selectedTag}&gt;
            </span>
            <span className="text-xs text-gray-400 truncate" title={selectedPath}>
              {selectedPath}
            </span>
          </div>
          <button
            onClick={() => selectElement(null)}
            className="text-gray-400 hover:text-gray-600 text-xs"
            title="Deselect (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Element Actions */}
        <div className="flex gap-1 mt-2 flex-wrap">
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="px-2 py-0.5 text-red-600 hover:bg-red-50 rounded text-xs border border-red-200"
            title="Delete element (Del)"
          >
            🗑 Delete
          </button>
          <button
            onClick={duplicateElement}
            className="px-2 py-0.5 text-gray-700 hover:bg-gray-100 rounded text-xs border border-gray-200"
            title="Duplicate (Ctrl+D)"
          >
            📋 Dup
          </button>
          <button
            onClick={() => moveElement("up")}
            disabled={!canMoveUp}
            className={cn(
              "px-2 py-0.5 rounded text-xs border",
              canMoveUp ? "text-gray-700 hover:bg-gray-100 border-gray-200" : "text-gray-300 border-gray-100 cursor-not-allowed"
            )}
          >
            ⬆
          </button>
          <button
            onClick={() => moveElement("down")}
            disabled={!canMoveDown}
            className={cn(
              "px-2 py-0.5 rounded text-xs border",
              canMoveDown ? "text-gray-700 hover:bg-gray-100 border-gray-200" : "text-gray-300 border-gray-100 cursor-not-allowed"
            )}
          >
            ⬇
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Text Editor */}
        <TextEditor
          selectedText={selectedText}
          onTextChange={applyTextChange}
        />

        {/* Class Editor */}
        <div className="border-t pt-3">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Classes</h3>
          <ClassEditor
            classes={selectedClasses}
            onChange={applyClassChange}
          />
        </div>

        {/* Attribute Editor */}
        <div className="border-t pt-3">
          <AttributeEditor
            selectedTag={selectedTag}
            selectedAttrs={selectedAttrs}
            onAttrChange={applyAttrChange}
            onAttrRemove={removeAttr}
          />
        </div>
      </div>
    </div>
  );
}
