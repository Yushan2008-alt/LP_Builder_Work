"use client";
import React, { useState } from "react";
import { useBrandContext } from "@/contexts/BrandContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { BrandCard } from "./BrandCard";
import { BrandGuidelinesModal } from "./BrandGuidelinesModal";
import type { Brand } from "@/lib/types";
import { getLimitReachedMessage, isLimitExceededError } from "@/lib/utils";

const MAX_BRAND_NAME_DB_LIMIT = 100;

export function ProductDashboard() {
  const { brands, products, userLimits, createBrand, isLoading } = useBrandContext();
  const { showToast } = useToast();

  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newBrand, setNewBrand] = useState<Brand | null>(null);
  const [showGuidelinesForNew, setShowGuidelinesForNew] = useState(false);

  const maxBrands = userLimits?.max_brands ?? 3;
  const maxProducts = userLimits?.max_products ?? 10;
  const canAddBrand = brands.length < maxBrands;

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newBrandName.trim();
    if (!trimmedName) {
      showToast("Nama brand wajib diisi.", "error");
      return;
    }
    if (trimmedName.length > MAX_BRAND_NAME_DB_LIMIT) {
      showToast(`Nama brand maksimal ${MAX_BRAND_NAME_DB_LIMIT} karakter.`, "error");
      return;
    }
    setIsCreating(true);
    try {
      const brand = await createBrand({ name: trimmedName });
      if (!brand) {
        throw new Error("Brand gagal dibuat. Coba lagi.");
      }
      setNewBrandName("");
      setShowAddBrand(false);
      setNewBrand(brand);
      setShowGuidelinesForNew(true);
      showToast("Brand berhasil dibuat!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat brand";
      if (isLimitExceededError(msg)) {
        showToast(getLimitReachedMessage(maxBrands, "brand"), "error");
      } else {
        showToast(msg, "error");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Knowledge Database</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola brand dan produk kamu — data ini digunakan oleh LP Generator.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-xs text-gray-400">
              {brands.length}/{maxBrands} brand · {products.length}/{maxProducts} produk
            </p>
          </div>
          <Button
            onClick={() => setShowAddBrand(true)}
            disabled={!canAddBrand || isLoading}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Tambah Brand
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <svg
              className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-sm text-gray-400">Memuat data...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && brands.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Belum ada brand</h3>
          <p className="text-sm text-gray-500 max-w-sm mb-6">
            Mulai dengan membuat brand pertama kamu. Brand menyimpan visual guidelines yang otomatis
            diterapkan ke semua LP kamu.
          </p>
          <Button onClick={() => setShowAddBrand(true)}>Buat Brand Pertama</Button>
        </div>
      )}

      {/* Brand Grid */}
      {!isLoading && brands.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
          {canAddBrand && (
            <button
              onClick={() => setShowAddBrand(true)}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors min-h-[140px]"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium">Tambah Brand</span>
              <span className="text-xs">
                {brands.length}/{maxBrands} brand digunakan
              </span>
            </button>
          )}
        </div>
      )}

      {/* Add Brand Modal */}
      <Modal
        isOpen={showAddBrand}
        onClose={() => { setShowAddBrand(false); setNewBrandName(""); }}
        title="Tambah Brand Baru"
        size="sm"
      >
        <form onSubmit={handleCreateBrand} className="space-y-4">
          <Input
            label="Nama Brand"
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            placeholder="e.g. Kelas.co, Toko Keren, PT Maju Jaya"
            required
            autoFocus
          />
          <p className="text-xs text-gray-500">
            Setelah brand dibuat, kamu bisa atur font, warna, dan vibe-nya di Brand Guidelines.
          </p>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowAddBrand(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Buat Brand
            </Button>
          </div>
        </form>
      </Modal>

      {newBrand && (
        <BrandGuidelinesModal
          isOpen={showGuidelinesForNew}
          onClose={() => { setShowGuidelinesForNew(false); setNewBrand(null); }}
          brand={newBrand}
        />
      )}
    </div>
  );
}
