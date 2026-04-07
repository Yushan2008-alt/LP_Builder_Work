"use client";

import { useState } from "react";
import { LAYOUT_FORMATS, LayoutFormat } from "@/lib/config/layouts";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface FormatGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFormatId: string;
  onSelect: (formatId: string) => void;
}

type Category = "all" | "hero" | "content" | "proof" | "conversion" | "interactive";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "hero", label: "Hero" },
  { id: "content", label: "Konten" },
  { id: "proof", label: "Bukti Sosial" },
  { id: "conversion", label: "Konversi" },
  { id: "interactive", label: "Interaktif" },
];

function SkeletonPreview({ skeletonType }: { skeletonType: string }) {
  const base = "bg-gray-200 rounded";
  const sm = `${base} h-2`;
  const md = `${base} h-3`;

  switch (skeletonType) {
    case "split_image":
      return (
        <div className="flex gap-1 h-full">
          <div className="flex-1 bg-gray-200 rounded" />
          <div className="flex-1 flex flex-col gap-1 justify-center">
            <div className={`${md} w-4/5`} />
            <div className={`${sm} w-full`} />
            <div className={`${sm} w-3/4`} />
            <div className={`${base} h-4 w-1/2 mt-1`} />
          </div>
        </div>
      );
    case "video":
      return (
        <div className="flex flex-col gap-1 h-full">
          <div className={`${md} w-3/4 mx-auto`} />
          <div className="flex-1 bg-gray-300 rounded flex items-center justify-center">
            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-y-4 border-y-transparent border-l-6 border-l-gray-500 ml-1" />
            </div>
          </div>
          <div className={`${base} h-4 w-1/3 mx-auto`} />
        </div>
      );
    case "text_only":
      return (
        <div className="flex flex-col gap-1 justify-center h-full">
          <div className={`${md} w-2/3`} />
          <div className={`${sm} w-full`} />
          <div className={`${sm} w-full`} />
          <div className={`${sm} w-4/5`} />
          <div className={`${sm} w-3/4`} />
        </div>
      );
    case "split_equal":
    case "text_image_text":
      return (
        <div className="flex gap-1 h-full">
          <div className="flex-1 flex flex-col gap-1 justify-center">
            <div className={`${md} w-4/5`} />
            <div className={`${sm} w-full`} />
            <div className={`${sm} w-3/4`} />
          </div>
          <div className="flex-1 bg-gray-200 rounded" />
        </div>
      );
    case "stats_grid":
      return (
        <div className="grid grid-cols-3 gap-1 h-full items-center">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`${base} h-5 w-3/4`} />
              <div className={`${sm} w-1/2`} />
            </div>
          ))}
        </div>
      );
    case "before_after":
      return (
        <div className="flex gap-1 h-full">
          <div className="flex-1 bg-red-100 rounded flex flex-col gap-1 p-1">
            <div className="h-2 bg-red-200 rounded w-1/2" />
            <div className="h-1.5 bg-red-100 rounded w-full" />
            <div className="h-1.5 bg-red-100 rounded w-4/5" />
          </div>
          <div className="w-px bg-gray-300" />
          <div className="flex-1 bg-green-100 rounded flex flex-col gap-1 p-1">
            <div className="h-2 bg-green-200 rounded w-1/2" />
            <div className="h-1.5 bg-green-100 rounded w-full" />
            <div className="h-1.5 bg-green-100 rounded w-4/5" />
          </div>
        </div>
      );
    case "card_grid_3":
      return (
        <div className="grid grid-cols-3 gap-1 h-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded border border-gray-200 flex flex-col gap-1 p-1">
              <div className="h-3 bg-gray-200 rounded" />
              <div className="h-1.5 bg-gray-200 rounded w-full" />
              <div className="h-1.5 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      );
    case "icon_list":
      return (
        <div className="flex flex-col gap-1.5 justify-center h-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-1 items-center">
              <div className="w-3 h-3 bg-blue-200 rounded" />
              <div className={`${sm} flex-1`} />
            </div>
          ))}
        </div>
      );
    case "bento":
      return (
        <div className="grid grid-cols-3 grid-rows-2 gap-1 h-full">
          <div className="col-span-2 row-span-2 bg-gray-200 rounded" />
          <div className="bg-gray-100 rounded border border-gray-200" />
          <div className="bg-gray-100 rounded border border-gray-200" />
        </div>
      );
    case "testimonial":
      return (
        <div className="flex flex-col gap-1 justify-center h-full bg-gray-50 rounded p-1">
          <div className="text-gray-300 text-lg leading-none">&ldquo;</div>
          <div className={`${sm} w-full`} />
          <div className={`${sm} w-4/5`} />
          <div className="flex items-center gap-1 mt-1">
            <div className="w-4 h-4 bg-gray-300 rounded-full" />
            <div className={`${sm} w-1/3`} />
          </div>
        </div>
      );
    case "phone_mockup":
      return (
        <div className="flex justify-center items-center h-full">
          <div className="w-16 h-full border-2 border-gray-300 rounded-lg flex flex-col gap-1 p-1">
            <div className="h-1 bg-gray-200 rounded w-1/2 mx-auto" />
            <div className="flex gap-0.5">
              <div className="w-4 h-4 bg-gray-200 rounded-full" />
              <div className="flex-1 bg-gray-100 rounded h-4" />
            </div>
            <div className="flex gap-0.5 justify-end">
              <div className="flex-1 bg-blue-100 rounded h-4" />
            </div>
          </div>
        </div>
      );
    case "offer_card":
      return (
        <div className="flex justify-center items-center h-full">
          <div className="w-full border-2 border-blue-200 rounded-lg flex flex-col gap-1 p-1 bg-blue-50">
            <div className="h-2 bg-blue-200 rounded w-3/4" />
            <div className="h-4 bg-blue-300 rounded w-1/2" />
            <div className={`${sm} w-full`} />
            <div className={`${sm} w-4/5`} />
            <div className="h-3 bg-blue-400 rounded w-full mt-1" />
          </div>
        </div>
      );
    case "table":
      return (
        <div className="h-full flex flex-col gap-0.5">
          <div className="flex gap-0.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-3 bg-blue-300 rounded" />
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-0.5">
              {[1, 2, 3].map((j) => (
                <div key={j} className={`flex-1 h-2 rounded ${i % 2 === 0 ? "bg-gray-100" : "bg-gray-50"}`} />
              ))}
            </div>
          ))}
        </div>
      );
    case "tier_cards":
      return (
        <div className="grid grid-cols-3 gap-1 h-full">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "rounded border flex flex-col gap-0.5 p-1",
                i === 2 ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50"
              )}
            >
              <div className={`h-2 rounded w-3/4 ${i === 2 ? "bg-blue-200" : "bg-gray-200"}`} />
              <div className={`h-3 rounded w-1/2 ${i === 2 ? "bg-blue-300" : "bg-gray-300"}`} />
              <div className="h-1.5 bg-gray-200 rounded" />
              <div className="h-1.5 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      );
    case "marquee":
      return (
        <div className="flex flex-col gap-1 justify-center h-full">
          <div className="h-1.5 bg-gray-200 rounded w-1/2" />
          <div className="flex gap-2 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-5 w-8 bg-gray-200 rounded flex-shrink-0" />
            ))}
          </div>
        </div>
      );
    case "promo":
      return (
        <div className="flex flex-col gap-1 justify-center h-full items-center">
          <div className="h-2 bg-gray-300 rounded w-1/2 line-through opacity-50" />
          <div className="h-5 bg-blue-200 rounded w-2/3" />
          <div className="h-3 bg-red-200 rounded w-1/3" />
          <div className="h-3 bg-blue-400 rounded w-1/2 mt-1" />
        </div>
      );
    case "accordion":
      return (
        <div className="flex flex-col gap-1 h-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className={cn("rounded border border-gray-200 p-1", i === 1 ? "bg-gray-50" : "bg-white")}>
              <div className="flex items-center justify-between">
                <div className="h-2 bg-gray-300 rounded w-3/4" />
                <div className="h-2 w-2 bg-gray-300 rounded" />
              </div>
              {i === 1 && (
                <div className="mt-1 flex flex-col gap-0.5">
                  <div className="h-1.5 bg-gray-200 rounded" />
                  <div className="h-1.5 bg-gray-200 rounded w-4/5" />
                </div>
              )}
            </div>
          ))}
        </div>
      );
    case "timeline":
      return (
        <div className="flex flex-col gap-1 h-full justify-center relative">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-blue-200" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 pl-4 relative">
              <div className="absolute left-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full" />
              <div className="flex flex-col gap-0.5 flex-1">
                <div className="h-2 bg-gray-300 rounded w-2/3" />
                <div className="h-1.5 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      );
    case "logo_bar":
      return (
        <div className="flex flex-col gap-1 justify-center h-full">
          <div className="h-1.5 bg-gray-200 rounded w-1/3 mx-auto" />
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 w-8 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div className="flex flex-col gap-1 h-full justify-center">
          <div className={`${md} w-2/3`} />
          <div className={`${sm} w-full`} />
          <div className={`${sm} w-4/5`} />
        </div>
      );
  }
}

export default function FormatGalleryModal({
  isOpen,
  onClose,
  currentFormatId,
  onSelect,
}: FormatGalleryModalProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filtered =
    activeCategory === "all"
      ? LAYOUT_FORMATS
      : LAYOUT_FORMATS.filter((f) => f.category === activeCategory);

  function handleSelect(format: LayoutFormat) {
    onSelect(format.id);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pilih Format Layout" size="xl">
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-colors",
              activeCategory === cat.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
        {filtered.map((format) => {
          const isSelected = format.id === currentFormatId;
          return (
            <button
              key={format.id}
              onClick={() => handleSelect(format)}
              className={cn(
                "text-left rounded-lg border-2 p-3 transition-all hover:shadow-md group",
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-blue-300"
              )}
            >
              {/* Skeleton Preview */}
              <div
                className={cn(
                  "h-20 mb-2 rounded p-1.5 overflow-hidden",
                  isSelected ? "bg-blue-100" : "bg-gray-50 group-hover:bg-gray-100"
                )}
              >
                <SkeletonPreview skeletonType={format.skeletonType} />
              </div>

              {/* Info */}
              <div className="space-y-0.5">
                <p
                  className={cn(
                    "text-sm font-semibold leading-tight",
                    isSelected ? "text-blue-700" : "text-gray-800"
                  )}
                >
                  {format.label}
                </p>
                <p className="text-xs text-gray-500 leading-snug line-clamp-2">
                  {format.description}
                </p>
              </div>

              {isSelected && (
                <div className="mt-2 text-xs font-medium text-blue-600">✓ Dipilih</div>
              )}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
