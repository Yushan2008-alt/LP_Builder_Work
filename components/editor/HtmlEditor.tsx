"use client";

import { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLang } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";
import DOMPurify from "dompurify";
import { copyToClipboard, downloadHtml } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { LP_EDITOR_HTML_STORAGE_KEY } from "@/lib/constants/editor";

export default function HtmlEditor() {
  const { showToast } = useToast();
  const [html, setHtml] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [view, setView] = useState<"split" | "code" | "preview">("split");
  const [copied, setCopied] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LP_EDITOR_HTML_STORAGE_KEY);
    if (saved) {
      setHtml(saved);
      setPreviewHtml(DOMPurify.sanitize(saved));
    }
  }, []);

  // Auto-save to localStorage on change
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(LP_EDITOR_HTML_STORAGE_KEY, html);
      setPreviewHtml(DOMPurify.sanitize(html));
    }, 500);
    return () => clearTimeout(timer);
  }, [html]);

  async function handleCopy() {
    const ok = await copyToClipboard(html);
    if (ok) {
      setCopied(true);
      showToast("HTML berhasil dicopy!", "success");
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast("Gagal copy HTML", "error");
    }
  }

  function handleDownload() {
    downloadHtml(html, "landing-page.html");
    showToast("File HTML berhasil didownload", "success");
  }

  function handleClear() {
    if (!html) return;
    if (window.confirm("Yakin ingin menghapus semua HTML? Perubahan ini tidak bisa dibatalkan.")) {
      setHtml("");
      setPreviewHtml("");
      localStorage.removeItem(LP_EDITOR_HTML_STORAGE_KEY);
    }
  }

  function handlePaste() {
    showToast("Paste HTML di sini (Ctrl+V / Cmd+V)", "info");
  }

  const charCount = html.length;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-gray-900">HTML Editor</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Paste hasil generate dari Claude/ChatGPT, lalu edit dan preview di sini.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          {(["split", "code", "preview"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-all capitalize ${
                view === v
                  ? "bg-white shadow-sm text-gray-800"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {v === "split" ? "Split" : v === "code" ? "Kode" : "Preview"}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!html && (
            <button
              onClick={handlePaste}
              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Paste HTML
            </button>
          )}
          {html && (
            <>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                  copied
                    ? "border-green-400 text-green-600 bg-green-50"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 text-xs border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Download .html
              </button>
              <button
                onClick={handleClear}
                className="px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Bar */}
      {html && (
        <div className="flex-shrink-0 px-6 py-1.5 bg-gray-800 text-xs text-gray-400 flex items-center gap-4">
          <span>{charCount.toLocaleString()} karakter</span>
          <span>{html.split("\n").length} baris</span>
          <span className="text-green-400">● Auto-saved</span>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Panel */}
        {(view === "split" || view === "code") && (
          <div
            className={`flex flex-col overflow-hidden ${
              view === "split" ? "w-1/2 border-r border-gray-200" : "w-full"
            }`}
          >
            <div className="flex-shrink-0 px-4 py-2 bg-gray-900 text-xs text-gray-400 font-mono">
              HTML
            </div>
            <div className="flex-1 overflow-auto bg-gray-950">
              <CodeMirror
                value={html}
                height="100%"
                extensions={[htmlLang()]}
                theme={oneDark}
                basicSetup={{
                  autocompletion: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  lineNumbers: true,
                }}
                onChange={(value) => setHtml(value)}
              />
            </div>
          </div>
        )}

        {/* Preview Panel */}
        {(view === "split" || view === "preview") && (
          <div
            className={`flex flex-col overflow-hidden ${
              view === "split" ? "w-1/2" : "w-full"
            }`}
          >
            <div className="flex-shrink-0 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-medium">
              Preview
            </div>
            {!previewHtml ? (
              <div className="flex-1 flex items-center justify-center text-gray-300 text-sm bg-white">
                Preview akan muncul di sini
              </div>
            ) : (
              <iframe
                srcDoc={previewHtml}
                className="flex-1 w-full border-0"
                sandbox="allow-scripts allow-same-origin"
                title="HTML Preview"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
