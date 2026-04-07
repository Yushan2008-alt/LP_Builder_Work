"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useBrandContext } from "@/contexts/BrandContext";
import { BrandGuidelinesModal } from "./BrandGuidelinesModal";
import { ProductList } from "./ProductList";
import type { Brand } from "@/lib/types";

interface Props {
  brand: Brand;
}

export function BrandCard({ brand }: Props) {
  const { products, deleteBrand } = useBrandContext();
  const { showToast } = useToast();
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const brandProducts = products.filter((p) => p.brand_id === brand.id);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBrand(brand.id);
      showToast(`Brand "${brand.name}" dihapus.`, "success");
    } catch {
      showToast("Gagal menghapus brand.", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const vibeLabel =
    brand.design_vibe === "custom"
      ? "Custom"
      : brand.design_vibe.replace(/_/g, " ");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Brand Header */}
      <div className="px-5 py-4 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm"
          style={{ backgroundColor: brand.color_primary }}
        >
          {brand.name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{brand.name}</h3>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <div className="flex gap-0.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: brand.color_primary }} />
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: brand.color_accent }} />
              <div
                className="w-3 h-3 rounded-sm border border-gray-200"
                style={{ backgroundColor: brand.color_neutral }}
              />
            </div>
            <span className="text-xs text-gray-400 capitalize">{vibeLabel}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">{brandProducts.length} produk</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowGuidelines(true)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Brand Guidelines"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Hapus Brand"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Products */}
      {isExpanded && (
        <div className="px-5 pb-4 border-t border-gray-50">
          <ProductList brand={brand} products={brandProducts} />
        </div>
      )}

      <BrandGuidelinesModal
        isOpen={showGuidelines}
        onClose={() => setShowGuidelines(false)}
        brand={brand}
      />
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Hapus Brand"
        message={`Brand "${brand.name}" dan semua produk di dalamnya (${brandProducts.length} produk) akan dihapus permanen.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
