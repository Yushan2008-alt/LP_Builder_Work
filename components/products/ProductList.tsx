"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useBrandContext } from "@/contexts/BrandContext";
import { createClient } from "@/lib/supabase/client";
import { ProductForm } from "./ProductForm";
import type { Product, Brand } from "@/lib/types";
import { formatDate, getFriendlyDatabaseError, getLimitReachedMessage } from "@/lib/utils";

interface Props {
  brand: Brand;
  products: Product[];
}

const FALLBACK_PRODUCT_REFERENCE_CHECK_ERROR = "Gagal memeriksa referensi proyek produk ini.";

export function ProductList({ brand, products }: Props) {
  const { deleteProduct, products: allProducts, userLimits } = useBrandContext();
  const { showToast } = useToast();
  const supabase = createClient();
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; referenceCount: number } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isCheckingDelete, setIsCheckingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const maxProducts = userLimits?.max_products ?? 10;
  const canAddProduct = allProducts.length < maxProducts;

  const handleOpenCreateProduct = () => {
    if (!canAddProduct) {
      showToast(getLimitReachedMessage(maxProducts, "produk"), "error");
      return;
    }
    setEditProduct(null);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      showToast("Produk dihapus.", "success");
    } catch {
      showToast("Gagal menghapus produk.", "error");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleRequestDelete = async (product: Product) => {
    setIsCheckingDelete(true);
    try {
      const { count, error } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("product_id", product.id);

      if (error) throw new Error(getFriendlyDatabaseError(error.message));

      setDeleteTarget({
        id: product.id,
        name: product.name,
        referenceCount: count ?? 0,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? getFriendlyDatabaseError(err.message)
        : FALLBACK_PRODUCT_REFERENCE_CHECK_ERROR;
      showToast(msg, "error");
    } finally {
      setIsCheckingDelete(false);
    }
  };

  return (
    <div>
      {products.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-gray-400 mb-3">Belum ada produk di brand ini</p>
          <Button size="sm" variant="outline" onClick={handleOpenCreateProduct} disabled={!canAddProduct}>
            + Tambah Produk
          </Button>
          {!canAddProduct && (
            <p className="mt-2 text-xs text-red-500">
              Batas maksimal produk untuk akun tercapai ({allProducts.length}/{maxProducts}).
            </p>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {products.map((product) => (
            <div
              key={product.id}
              className="py-3 px-1 flex items-start justify-between gap-3 group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                    {product.price_normal}
                  </span>
                  {product.price_promo && (
                    <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      {product.price_promo}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{formatDate(product.updated_at)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{product.description}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => {
                    setEditProduct(product);
                    setShowForm(true);
                  }}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleRequestDelete(product)}
                  disabled={isCheckingDelete || isDeleting}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
          <div className="pt-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleOpenCreateProduct}
              disabled={!canAddProduct}
            >
              + Tambah Produk
            </Button>
            {!canAddProduct && (
              <p className="mt-1 text-xs text-red-500">
                Batas maksimal produk untuk akun tercapai ({allProducts.length}/{maxProducts}).
              </p>
            )}
          </div>
        </div>
      )}

      <ProductForm
        isOpen={showForm}
        brandId={brand.id}
        product={editProduct}
        onClose={() => {
          setShowForm(false);
          setEditProduct(null);
        }}
      />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Produk"
        message={
          deleteTarget
            ? deleteTarget.referenceCount > 0
              ? `Produk "${deleteTarget.name}" digunakan di ${deleteTarget.referenceCount} project. Yakin hapus?`
              : `Produk "${deleteTarget.name}" akan dihapus permanen. Yakin hapus?`
            : ""
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
