"use client";

import { useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "@/store/editor-store";
import { buildInjectedHtml } from "@/lib/editor/html-utils";
import { IFRAME_BRIDGE_SCRIPT } from "@/lib/editor/iframe-bridge";

const DEVICE_WIDTHS = {
  mobile: "375px",
  tablet: "768px",
  desktop: "100%",
};

function getPostMessageTargetOrigin() {
  if (typeof window === "undefined") return "*";
  return window.location.origin;
}

function isValidEditorPath(path: string) {
  return path === "" || /^\d+(>\d+)*$/.test(path);
}

export default function PreviewPane() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { html, device, selectedPath, selectElement } = useEditorStore();

  // Inject selected path to iframe after render
  const sendSelectionToIframe = useCallback((path: string | null) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    const targetOrigin = getPostMessageTargetOrigin();
    if (path) {
      iframe.contentWindow.postMessage({ type: "select-element", path }, targetOrigin);
    } else {
      iframe.contentWindow.postMessage({ type: "deselect-element" }, targetOrigin);
    }
  }, []);

  // Listen for postMessage from iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const iframeWindow = iframeRef.current?.contentWindow;
      if (!iframeWindow || event.source !== iframeWindow) return;
      if (!event.data || event.data.type !== "element-selected") return;
      const { path, tag, classes, text, attrs } = event.data;
      if (typeof path !== "string") return;
      selectElement(path, tag, classes, text, attrs);
      // Re-send selection back to iframe for visual feedback
      iframeRef.current?.contentWindow?.postMessage(
        { type: "select-element", path },
        getPostMessageTargetOrigin()
      );
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [selectElement]);

  useEffect(() => {
    sendSelectionToIframe(selectedPath);
  }, [selectedPath, sendSelectionToIframe]);

  // Re-send selection after iframe reloads
  const handleIframeLoad = useCallback(() => {
    const iframeDoc = iframeRef.current?.contentDocument;
    if (selectedPath && iframeDoc) {
      if (!isValidEditorPath(selectedPath)) {
        selectElement(null);
        return;
      }
      const isPathValid = !!iframeDoc.querySelector(`[data-editor-path="${selectedPath}"]`);
      if (!isPathValid) {
        selectElement(null);
        return;
      }
    }
    // Small delay to let bridge script initialize
    setTimeout(() => {
      sendSelectionToIframe(selectedPath);
    }, 100);
  }, [selectedPath, selectElement, sendSelectionToIframe]);

  const injectedHtml = html ? buildInjectedHtml(html, IFRAME_BRIDGE_SCRIPT) : "";

  const wrapperWidth = DEVICE_WIDTHS[device];

  return (
    <div className="flex-1 overflow-auto bg-gray-100 flex justify-center p-4">
      <div
        style={{
          width: wrapperWidth,
          maxWidth: "100%",
          transition: "width 0.3s ease",
          background: "white",
          borderRadius: device !== "desktop" ? "0.5rem" : undefined,
          boxShadow: device !== "desktop" ? "0 4px 24px rgba(0,0,0,0.13)" : undefined,
          overflow: "hidden",
          minHeight: "100%",
        }}
      >
        {html ? (
          <iframe
            ref={iframeRef}
            srcDoc={injectedHtml}
            sandbox="allow-scripts allow-same-origin"
            onLoad={handleIframeLoad}
            style={{
              width: "100%",
              border: "none",
              minHeight: "100vh",
              display: "block",
            }}
            title="LP Preview"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-3">
            <div className="text-5xl">📄</div>
            <p className="text-sm">Belum ada HTML. Klik &ldquo;Paste HTML&rdquo; untuk memulai.</p>
          </div>
        )}
      </div>
    </div>
  );
}
