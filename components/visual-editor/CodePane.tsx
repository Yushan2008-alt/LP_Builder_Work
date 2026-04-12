"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/store/editor-store";
import { parseHtml, serializeHtml } from "@/lib/editor/html-utils";
import { useRenderTrace } from "@/lib/hooks/useRenderTrace";

const CODE_EDITOR_DEBOUNCE_MS = 200;

export default function CodePane() {
  const html = useEditorStore((state) => state.html);
  const setHtml = useEditorStore((state) => state.setHtml);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const htmlRef = useRef(html);
  const draftRef = useRef(html);
  const debouncedDraftRef = useRef(html);
  const dirtyRef = useRef(false);

  useRenderTrace("CodePane", { htmlLength: html.length });

  // Keep refs in sync for closure use
  htmlRef.current = html;

  // Sync CodeMirror when html changes externally (undo/redo/sidebar edits)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    if (currentDoc !== html) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: html },
      });
    }
  }, [html]);

  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;
    const initialHtml = htmlRef.current;

    async function init() {
      const [{ EditorView, basicSetup }, { html: htmlLang }, { oneDark }] = await Promise.all([
        import("@uiw/react-codemirror"),
        import("@codemirror/lang-html"),
        import("@codemirror/theme-one-dark"),
      ]);
      const { EditorState } = await import("@codemirror/state");

      if (destroyed || !containerRef.current) return;

      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }

      const startState = EditorState.create({
        doc: htmlRef.current,
        extensions: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        basicSetup as any,
          htmlLang(),
          oneDark,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          EditorView.updateListener.of((update: any) => {
            if (update.docChanged) {
              dirtyRef.current = true;
              draftRef.current = update.state.doc.toString();
              if (debounceRef.current) clearTimeout(debounceRef.current);
              debounceRef.current = setTimeout(() => {
                debouncedDraftRef.current = update.state.doc.toString();
              }, CODE_EDITOR_DEBOUNCE_MS);
            }
          }),
          EditorView.theme({
            "&": { height: "100%", fontSize: "12.5px" },
            ".cm-scroller": { overflow: "auto", fontFamily: "monospace" },
          }),
        ],
      });

      viewRef.current = new EditorView({
        state: startState,
        parent: containerRef.current!,
      });
    }

    init();

    return () => {
      destroyed = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (dirtyRef.current && draftRef.current !== initialHtml) {
        const parsed = parseHtml(draftRef.current);
        if (parsed.documentElement) {
          const normalized = serializeHtml(parsed);
          setHtml(normalized);
        } else {
          setHtml(draftRef.current);
        }
      }
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-950">
      <div ref={containerRef} style={{ height: "100%", overflow: "auto" }} />
    </div>
  );
}
