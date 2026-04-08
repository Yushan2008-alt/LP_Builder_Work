"use client";

import { useEditorStore } from "@/store/editor-store";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function Toolbar() {
  const {
    view, setView,
    device, setDevice,
    leftPanel, setLeftPanel,
    historyIndex, history,
    undo, redo,
    setShowPasteModal,
    copyCleanHtml,
  } = useEditorStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  async function handleCopy() {
    try {
      await copyCleanHtml();
      toast.success("HTML copied to clipboard!");
    } catch {
      toast.error("Failed to copy HTML");
    }
  }

  const devices: { id: "mobile" | "tablet" | "desktop"; icon: string; label: string }[] = [
    { id: "mobile", icon: "📱", label: "375px" },
    { id: "tablet", icon: "📟", label: "768px" },
    { id: "desktop", icon: "🖥️", label: "100%" },
  ];

  return (
    <div className="flex-shrink-0 h-12 bg-gray-900 border-b border-gray-700 flex items-center gap-2 px-3">
      {/* Logo */}
      <div className="flex items-center gap-1.5 mr-2">
        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">V</div>
        <span className="text-white text-xs font-semibold hidden sm:block">Visual Editor</span>
      </div>

      <div className="w-px h-6 bg-gray-700" />

      {/* Paste HTML */}
      <button
        onClick={() => setShowPasteModal(true)}
        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium transition-colors"
      >
        📋 Paste HTML
      </button>

      <div className="w-px h-6 bg-gray-700" />

      {/* Undo / Redo */}
      <button
        onClick={undo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className={cn(
          "px-2 py-1 rounded text-xs transition-colors",
          canUndo ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 cursor-not-allowed"
        )}
      >
        ↩ Undo
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
        className={cn(
          "px-2 py-1 rounded text-xs transition-colors",
          canRedo ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 cursor-not-allowed"
        )}
      >
        ↪ Redo
      </button>

      <div className="w-px h-6 bg-gray-700" />

      {/* Left panel toggles */}
      <button
        onClick={() => setLeftPanel(leftPanel === "tree" ? "none" : "tree")}
        className={cn(
          "px-2 py-1 rounded text-xs transition-colors",
          leftPanel === "tree" ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"
        )}
        title="DOM Tree"
      >
        🌳 Tree
      </button>
      <button
        onClick={() => setLeftPanel(leftPanel === "add" ? "none" : "add")}
        className={cn(
          "px-2 py-1 rounded text-xs transition-colors",
          leftPanel === "add" ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"
        )}
        title="Add Element"
      >
        ➕ Add
      </button>

      <div className="flex-1" />

      {/* View Toggle */}
      <div className="flex bg-gray-800 rounded overflow-hidden">
        <button
          onClick={() => setView("preview")}
          className={cn(
            "px-3 py-1 text-xs font-medium transition-colors",
            view === "preview" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
          )}
        >
          Preview
        </button>
        <button
          onClick={() => setView("code")}
          className={cn(
            "px-3 py-1 text-xs font-medium transition-colors",
            view === "code" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
          )}
        >
          Code
        </button>
      </div>

      <div className="w-px h-6 bg-gray-700" />

      {/* Device Switcher */}
      <div className="flex bg-gray-800 rounded overflow-hidden">
        {devices.map((d) => (
          <button
            key={d.id}
            onClick={() => setDevice(d.id)}
            title={d.label}
            className={cn(
              "px-2 py-1 text-xs transition-colors",
              device === d.id ? "bg-gray-600 text-white" : "text-gray-400 hover:text-white"
            )}
          >
            {d.icon}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-700" />

      {/* Copy HTML */}
      <button
        onClick={handleCopy}
        className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white text-xs rounded font-medium transition-colors"
        title="Copy clean HTML to clipboard"
      >
        📤 Copy HTML
      </button>
    </div>
  );
}
