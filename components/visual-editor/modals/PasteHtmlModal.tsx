"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { useRenderTrace } from "@/lib/hooks/useRenderTrace";

export default function PasteHtmlModal() {
  const showPasteModal = useEditorStore((state) => state.showPasteModal);
  const setShowPasteModal = useEditorStore((state) => state.setShowPasteModal);
  const loadHtml = useEditorStore((state) => state.loadHtml);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useRenderTrace("PasteHtmlModal", { showPasteModal, hasValue: !!value });

  if (!showPasteModal) return null;

  function handleLoad() {
    if (!value.trim()) {
      setError("Please paste some HTML first.");
      return;
    }
    setError("");
    loadHtml(value.trim());
    setValue("");
  }

  function handleCancel() {
    setShowPasteModal(false);
    setValue("");
    setError("");
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-bold text-gray-900">Load HTML</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Paste your Tailwind HTML below. Tailwind CDN will be auto-injected if missing.
            </p>
          </div>
          <button
            onClick={handleCancel}
            aria-label="Close paste HTML modal"
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Textarea */}
        <div className="flex-1 overflow-hidden p-4">
          <textarea
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(""); }}
            placeholder={`Paste your HTML here...\n\n<!DOCTYPE html>\n<html>\n  <head>...</head>\n  <body>...</body>\n</html>`}
            className="w-full h-full min-h-[280px] font-mono text-xs border border-gray-300 rounded-lg px-3 py-2 resize-y overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
            spellCheck={false}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <p className="text-xs text-gray-400">
            Supports single-file Tailwind HTML. No upload — paste only.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLoad}
              disabled={!value.trim()}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                value.trim()
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Load HTML →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
