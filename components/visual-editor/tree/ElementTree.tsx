"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/store/editor-store";
import { parseHtmlToTree } from "@/lib/editor/html-utils";
import TreeNode from "./TreeNode";

export default function ElementTree() {
  const { html, selectedPath, selectElement } = useEditorStore();

  const tree = useMemo(() => {
    if (!html) return null;
    return parseHtmlToTree(html);
  }, [html]);

  if (!html) {
    return (
      <div className="p-3 text-xs text-gray-400 text-center">
        No HTML loaded.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
        <h3 className="text-xs font-semibold text-gray-700">DOM Tree</h3>
      </div>
      <div className="py-1">
        {tree && (
          <TreeNode
            node={tree}
            selectedPath={selectedPath}
            onSelect={(path) => {
              // When clicking in tree, also need to get element data
              // We pass the path and let PreviewPane sync
              selectElement(path);
            }}
            depth={0}
          />
        )}
      </div>
    </div>
  );
}
