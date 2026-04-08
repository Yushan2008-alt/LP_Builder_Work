"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/store/editor-store";

export default function CodePane() {
  const { html, setHtml } = useEditorStore();
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const htmlRef = useRef(html);
  const draftRef = useRef(html);
  const dirtyRef = useRef(false);

  // Keep refs in sync for closure use
  htmlRef.current = html;

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
                const addHistory = false;
                setHtml(draftRef.current, addHistory);
              }, 300);
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
        setHtml(draftRef.current);
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
