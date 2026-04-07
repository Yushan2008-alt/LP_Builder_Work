"use client";

import { useState } from "react";
import { copyToClipboard, downloadHtml, downloadText } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface OutputPanelProps {
  output: string;
  outputMode: "html" | "copy";
  isGenerating?: boolean;
}

export default function OutputPanel({ output, outputMode, isGenerating }: OutputPanelProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  async function handleCopy() {
    const ok = await copyToClipboard(output);
    if (ok) {
      setCopied(true);
      showToast("Output berhasil dicopy!", "success");
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast("Gagal copy output", "error");
    }
  }

  function handleDownload() {
    if (outputMode === "html") {
      downloadHtml(output, "landing-page.html");
    } else {
      downloadText(output, "copywriting.txt");
    }
    showToast("File berhasil didownload", "success");
  }

  const isEmpty = !output && !isGenerating;

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-800">Output</h3>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              outputMode === "html"
                ? "bg-purple-100 text-purple-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {outputMode === "html" ? "HTML" : "Copywriting"}
          </span>
        </div>

        {output && (
          <div className="flex items-center gap-2">
            {outputMode === "html" && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {showPreview ? "Lihat Kode" : "Preview"}
              </button>
            )}
            <button
              onClick={handleCopy}
              className={`text-xs px-2 py-1 rounded border transition-colors ${
                copied
                  ? "border-green-400 text-green-600 bg-green-50"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Download
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden relative">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Memproses prompt di AI...</p>
            <p className="text-xs text-gray-400">Paste prompt ke Claude/ChatGPT untuk generate</p>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 px-6 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">Belum ada output</p>
            <p className="text-xs text-gray-400">
              Klik &ldquo;Generate Prompt&rdquo; untuk membuat prompt LP, lalu paste ke Claude atau ChatGPT.
            </p>
          </div>
        ) : showPreview && outputMode === "html" ? (
          <iframe
            srcDoc={output}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="HTML Preview"
          />
        ) : (
          <textarea
            readOnly
            value={output}
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            className="w-full h-full resize-none p-4 text-xs font-mono text-gray-700 bg-gray-950 text-green-400 focus:outline-none"
            spellCheck={false}
          />
        )}
      </div>

      {/* Footer hint */}
      {output && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-xs text-amber-700">
          Tip: Copy prompt di atas lalu paste ke{" "}
          <strong>Claude</strong> atau <strong>ChatGPT</strong> untuk generate landing page.
        </div>
      )}
    </div>
  );
}
