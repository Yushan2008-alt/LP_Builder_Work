"use client";

import { useState, useEffect } from "react";

interface TextEditorProps {
  selectedText: string;
  onTextChange: (text: string) => void;
}

export default function TextEditor({ selectedText, onTextChange }: TextEditorProps) {
  const [text, setText] = useState(selectedText);

  useEffect(() => {
    setText(selectedText);
  }, [selectedText]);

  function handleBlur() {
    if (text !== selectedText) {
      onTextChange(text);
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-700">Text Content</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === "Enter") handleBlur();
        }}
        rows={3}
        placeholder="Direct text of this element..."
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <p className="text-xs text-gray-400">Ctrl+Enter or click outside to apply.</p>
    </div>
  );
}
