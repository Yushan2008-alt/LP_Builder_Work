"use client";

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useEditorStore } from "@/store/editor-store";
import Toolbar from "./Toolbar";
import PreviewPane from "./PreviewPane";
import CodePane from "./CodePane";
import RightSidebar from "./sidebar/RightSidebar";
import ElementTree from "./tree/ElementTree";
import AddElementPanel from "./add/AddElementPanel";
import PasteHtmlModal from "./modals/PasteHtmlModal";
import ConfirmModal from "./modals/ConfirmModal";

export default function VisualEditor() {
  const {
    view, leftPanel,
    undo, redo,
    duplicateElement,
    selectElement,
    setShowConfirmDelete,
    selectedPath,
  } = useEditorStore();

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = tag === "input" || tag === "textarea" || tag === "select";
      if (isInput) return;

      if (e.key === "Escape") {
        selectElement(null);
      }
      if (e.ctrlKey && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && e.shiftKey && e.key === "Z") {
        e.preventDefault();
        redo();
      }
      if (e.ctrlKey && e.key === "d" && selectedPath) {
        e.preventDefault();
        duplicateElement();
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedPath) {
        // Only if not in an input
        setShowConfirmDelete(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, duplicateElement, selectElement, setShowConfirmDelete, selectedPath]);

  return (
    <div className="flex flex-col h-full bg-gray-950">
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      {/* Toolbar */}
      <Toolbar />

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        {leftPanel !== "none" && (
          <div className="w-56 border-r border-gray-700 bg-white flex-shrink-0 overflow-hidden flex flex-col">
            {leftPanel === "tree" && <ElementTree />}
            {leftPanel === "add" && <AddElementPanel />}
          </div>
        )}

        {/* Preview / Code Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {view === "preview" ? <PreviewPane /> : <CodePane />}
        </div>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>

      {/* Modals */}
      <PasteHtmlModal />
      <ConfirmModal />
    </div>
  );
}
