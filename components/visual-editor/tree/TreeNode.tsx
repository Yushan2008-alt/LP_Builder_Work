"use client";

import { useState } from "react";
import { HtmlTreeNode } from "@/lib/editor/html-utils";
import { cn } from "@/lib/utils";

interface TreeNodeProps {
  node: HtmlTreeNode;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  depth?: number;
}

export default function TreeNode({ node, selectedPath, onSelect, depth = 0 }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isSelected = node.path === selectedPath;
  const hasChildren = node.children.length > 0;

  const label = `<${node.tag}>${
    node.classes.length > 0 ? ` .${node.classes.slice(0, 2).join(".")}${node.classes.length > 2 ? "…" : ""}` : ""
  }${node.text ? ` "${node.text.substring(0, 20)}${node.text.length > 20 ? "…" : ""}"` : ""}`;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-0.5 px-2 rounded cursor-pointer select-none text-xs font-mono",
          isSelected
            ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
            : "hover:bg-gray-100 text-gray-700"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onSelect(node.path)}
      >
        {hasChildren ? (
          <button
            className="text-gray-400 hover:text-gray-600 w-4 text-center flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          >
            {expanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}
        <span className="truncate" title={label}>{label}</span>
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children.map((child, i) => (
            <TreeNode
              key={`${child.path}-${i}`}
              node={child}
              selectedPath={selectedPath}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
