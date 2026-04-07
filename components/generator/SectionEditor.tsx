"use client";

import { useState } from "react";
import { Section, UpdateSectionInput } from "@/lib/types";
import { getLayoutById } from "@/lib/config/layouts";
import FormatGalleryModal from "./FormatGalleryModal";
import { cn } from "@/lib/utils";

interface SectionEditorProps {
  section: Section;
  onUpdate: (id: string, updates: UpdateSectionInput) => void;
}

export default function SectionEditor({ section, onUpdate }: SectionEditorProps) {
  const [showFormatGallery, setShowFormatGallery] = useState(false);

  const currentLayout = getLayoutById(section.layout_format);

  function handleField(field: keyof UpdateSectionInput, value: string) {
    onUpdate(section.id, { [field]: value });
  }

  function handleFormatSelect(formatId: string) {
    onUpdate(section.id, { layout_format: formatId });
  }

  function handleStyleModeToggle(mode: "default" | "custom") {
    onUpdate(section.id, {
      style_mode: mode,
      style_custom: mode === "default" ? undefined : section.style_custom,
    });
  }

  return (
    <div className="p-4 space-y-4">
      {/* Section Title */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Judul Seksi
        </label>
        <input
          type="text"
          value={section.section_title}
          onChange={(e) => handleField("section_title", e.target.value)}
          placeholder="Contoh: Hero — Headline Utama"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Section Goals */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Tujuan Seksi
          <span className="ml-1 text-gray-400 font-normal">
            (apa yang ingin dicapai oleh seksi ini?)
          </span>
        </label>
        <textarea
          value={section.section_goals}
          onChange={(e) => handleField("section_goals", e.target.value)}
          placeholder="Contoh: Menarik perhatian visitor dengan headline yang kuat dan sub-headline yang memperjelas value proposition produk."
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Layout Format */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Format Layout
        </label>
        <button
          type="button"
          onClick={() => setShowFormatGallery(true)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
        >
          <div>
            <span className="font-medium text-gray-800">
              {currentLayout?.label ?? section.layout_format}
            </span>
            {currentLayout && (
              <span className="ml-2 text-gray-400 text-xs">{currentLayout.description}</span>
            )}
          </div>
          <span className="text-gray-400 text-xs ml-2 flex-shrink-0">Ganti →</span>
        </button>

        <FormatGalleryModal
          isOpen={showFormatGallery}
          onClose={() => setShowFormatGallery(false)}
          currentFormatId={section.layout_format}
          onSelect={handleFormatSelect}
        />
      </div>

      {/* Style Mode */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Style Seksi
        </label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => handleStyleModeToggle("default")}
            className={cn(
              "px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors",
              section.style_mode === "default"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            )}
          >
            Default Brand
          </button>
          <button
            type="button"
            onClick={() => handleStyleModeToggle("custom")}
            className={cn(
              "px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors",
              section.style_mode === "custom"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            )}
          >
            Custom
          </button>
        </div>

        {section.style_mode === "custom" && (
          <textarea
            value={section.style_custom ?? ""}
            onChange={(e) => handleField("style_custom", e.target.value)}
            placeholder="Deskripsikan style yang diinginkan. Contoh: Gunakan dark background (#1a1a1a) dengan teks putih, aksen warna emas untuk CTA, dan typography serif untuk headline."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}

        {section.style_mode === "default" && (
          <p className="text-xs text-gray-400">
            Akan mengikuti brand guidelines yang sudah dikonfigurasi.
          </p>
        )}
      </div>

      {/* Framework Position (read-only if set by formula) */}
      {section.framework_position && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Posisi Framework
          </label>
          <div className="px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
            <span className="text-xs font-medium text-purple-700 capitalize">
              {section.framework_position}
            </span>
            <p className="text-xs text-purple-500 mt-0.5">
              Otomatis dari formula copywriting yang dipilih.
            </p>
          </div>
        </div>
      )}

      {/* Additional Context */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Konteks Tambahan
          <span className="ml-1 text-gray-400 font-normal">(opsional)</span>
        </label>
        <textarea
          value={section.additional_context ?? ""}
          onChange={(e) => handleField("additional_context", e.target.value)}
          placeholder="Instruksi spesifik untuk AI. Contoh: Sertakan social proof berupa angka pengguna, gunakan bahasa kasual, tonjolkan fitur X sebagai poin utama."
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
