"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Section, UpdateSectionInput } from "@/lib/types";
import { getLayoutById } from "@/lib/config/layouts";
import SectionEditor from "./SectionEditor";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  section: Section;
  index: number;
  onUpdate: (id: string, updates: UpdateSectionInput) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  validationErrors?: {
    section_title?: string;
    section_goals?: string;
    layout_format?: string;
    style_custom?: string;
  };
}

export default function SectionCard({
  section,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  validationErrors,
}: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const layout = getLayoutById(section.layout_format);

  const categoryColors: Record<string, string> = {
    hero: "bg-blue-100 text-blue-700",
    content: "bg-green-100 text-green-700",
    proof: "bg-amber-100 text-amber-700",
    conversion: "bg-red-100 text-red-700",
    interactive: "bg-purple-100 text-purple-700",
  };

  const layoutBadgeColor = layout
    ? categoryColors[layout.category] ?? "bg-gray-100 text-gray-600"
    : "bg-gray-100 text-gray-600";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white border rounded-lg overflow-hidden transition-shadow",
        isDragging
          ? "shadow-2xl border-blue-400 opacity-90 z-50"
          : validationErrors
            ? "border-red-300 shadow-sm hover:shadow-md"
            : "border-gray-200 shadow-sm hover:shadow-md"
      )}
    >
      {/* Card Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-200">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 touch-none"
          title="Drag untuk reorder"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
          </svg>
        </button>

        {/* Section Number */}
        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
          {index + 1}
        </span>

        {/* Title + Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-gray-800 truncate">
              {section.section_title || "Seksi tanpa judul"}
            </span>
            {layout && (
              <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium", layoutBadgeColor)}>
                {layout.label}
              </span>
            )}
            {section.style_mode === "custom" && (
              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                Custom Style
              </span>
            )}
            {section.framework_position && (
              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 capitalize">
                {section.framework_position}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onDuplicate(section.id)}
            title="Duplikasi seksi"
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          {showDeleteConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(section.id)}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              title="Hapus seksi"
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Tutup editor" : "Buka editor"}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
          >
            <svg
              className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-180")}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Goals preview (collapsed state) */}
      {!isExpanded && section.section_goals && (
        <div className="px-3 py-2 text-xs leading-relaxed text-gray-500 line-clamp-2 border-b border-gray-100">
          {section.section_goals}
        </div>
      )}

      {/* Expandable Editor */}
      {isExpanded && (
        <SectionEditor section={section} onUpdate={onUpdate} validationErrors={validationErrors} />
      )}
    </div>
  );
}
