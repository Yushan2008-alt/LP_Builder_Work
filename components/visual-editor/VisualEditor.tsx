"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { useEditorStore } from "@/store/editor-store";
import { useRenderTrace } from "@/lib/hooks/useRenderTrace";
import PasteHtmlModal from "./modals/PasteHtmlModal";
import ConfirmModal from "./modals/ConfirmModal";

const Toolbar = dynamic(() => import("./Toolbar"));
const PreviewPane = dynamic(() => import("./PreviewPane"));
const CodePane = dynamic(() => import("./CodePane"));
const RightSidebar = dynamic(() => import("./sidebar/RightSidebar"));
const ElementTree = dynamic(() => import("./tree/ElementTree"));
const AddElementPanel = dynamic(() => import("./add/AddElementPanel"));

export default function VisualEditor() {
  const view = useEditorStore((state) => state.view);
  const setView = useEditorStore((state) => state.setView);
  const setDevice = useEditorStore((state) => state.setDevice);
  const leftPanel = useEditorStore((state) => state.leftPanel);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const duplicateElement = useEditorStore((state) => state.duplicateElement);
  const selectElement = useEditorStore((state) => state.selectElement);
  const setShowConfirmDelete = useEditorStore((state) => state.setShowConfirmDelete);
  const selectedPath = useEditorStore((state) => state.selectedPath);
  const copyCleanHtml = useEditorStore((state) => state.copyCleanHtml);

  useRenderTrace("VisualEditor", { view, leftPanel, hasSelection: !!selectedPath });

  // Global keyboard shortcuts
  useEffect(() => {
    async function handleCopyShortcut() {
      try {
        await copyCleanHtml();
        toast.success("HTML copied to clipboard!");
      } catch {
        toast.error("Failed to copy HTML");
      }
    }

    function shouldHandleCopyShortcut(opts: {
      withMod: boolean;
      key: string;
      hasMainSelection: boolean;
      hasIframeSelection: boolean;
      isIframeFocused: boolean;
    }) {
      return (
        opts.withMod &&
        opts.key === "c" &&
        !opts.hasMainSelection &&
        !opts.hasIframeSelection &&
        !opts.isIframeFocused
      );
    }

    function handleKeyDown(e: KeyboardEvent) {
      const targetEl = e.target as HTMLElement | null;
      const tag = targetEl?.tagName?.toLowerCase();
      const isInput = tag === "input" || tag === "textarea" || tag === "select";
      const isContentEditable = !!targetEl?.isContentEditable;
      const isCodeMirror = !!targetEl?.closest(".cm-editor");
      if (isInput || isContentEditable || isCodeMirror) return;
      const key = e.key.toLowerCase();
      const withMod = e.ctrlKey || e.metaKey;
      const isIframeFocused = document.activeElement?.tagName?.toLowerCase() === "iframe";
      let hasIframeSelection = false;
      if (isIframeFocused && document.activeElement instanceof HTMLIFrameElement) {
        try {
          hasIframeSelection = !!document.activeElement.contentWindow?.getSelection()?.toString();
        } catch {
          hasIframeSelection = false;
        }
      }

      if (e.key === "Escape") {
        selectElement(null);
      }
      if (withMod && key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if (withMod && key === "d" && selectedPath) {
        e.preventDefault();
        duplicateElement();
      }
      if (
        shouldHandleCopyShortcut({
          withMod,
          key,
          hasMainSelection: !!window.getSelection()?.toString(),
          hasIframeSelection,
          isIframeFocused,
        })
      ) {
        e.preventDefault();
        void handleCopyShortcut();
      }
      if (withMod && key === "e") {
        e.preventDefault();
        setView(view === "preview" ? "code" : "preview");
      }
      if (withMod && key === "1") {
        e.preventDefault();
        setDevice("mobile");
      }
      if (withMod && key === "2") {
        e.preventDefault();
        setDevice("tablet");
      }
      if (withMod && key === "3") {
        e.preventDefault();
        setDevice("desktop");
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedPath) {
        e.preventDefault();
        // Show delete confirmation for selected element
        setShowConfirmDelete(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    copyCleanHtml,
    duplicateElement,
    redo,
    selectElement,
    selectedPath,
    setDevice,
    setShowConfirmDelete,
    setView,
    undo,
    view,
  ]);

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
