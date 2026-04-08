"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { ELEMENT_TEMPLATES, ElementTemplate } from "@/lib/editor/element-templates";

type InsertPosition = "inside" | "before" | "after";

export default function AddElementPanel() {
  const { addElement, selectedPath } = useEditorStore();
  const [insertPosition, setInsertPosition] = useState<InsertPosition>("inside");

  function handleAdd(template: ElementTemplate) {
    addElement(template.html, insertPosition);
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <h3 className="text-xs font-semibold text-gray-700">Add Element</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Insert Position */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">Insert Position</p>
          {!selectedPath && (
            <p className="text-xs text-amber-600 mb-1">No element selected — will append to body.</p>
          )}
          <div className="flex gap-2">
            {(["inside", "before", "after"] as InsertPosition[]).map((pos) => (
              <label key={pos} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  value={pos}
                  checked={insertPosition === pos}
                  onChange={() => setInsertPosition(pos)}
                  className="w-3 h-3"
                />
                <span className="text-xs capitalize text-gray-700">{pos}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Element Templates by Category */}
        {Object.entries(ELEMENT_TEMPLATES).map(([category, templates]) => (
          <div key={category}>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{category}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleAdd(template)}
                  className="px-2 py-2 text-xs bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-300 rounded-lg text-left font-medium transition-colors"
                  title={template.html}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
