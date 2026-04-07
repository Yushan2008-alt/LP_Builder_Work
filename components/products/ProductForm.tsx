"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useBrandContext } from "@/contexts/BrandContext";
import type { Product, CreateProductInput, UpdateProductInput } from "@/lib/types";
import { getLimitReachedMessage, isLimitExceededError } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  brandId: string;
  product?: Product | null;
}

const EMPTY_PRODUCT_FORM = {
  brand_id: "",
  name: "",
  description: "",
  price_normal: "",
  price_promo: "",
  target_audience: "",
  pain_points: "",
  objections: "",
  usp: "",
};

type ProductFieldErrors = Partial<Record<"brand_id" | "name" | "description" | "price_normal", string>>;

export function ProductForm({ isOpen, onClose, brandId, product }: Props) {
  const { createProduct, updateProduct, userLimits, brands } = useBrandContext();
  const { showToast } = useToast();
  const isEditing = !!product;
  const [isLoading, setIsLoading] = useState(false);
  const maxProducts = userLimits?.max_products ?? 10;
  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({});

  const [form, setForm] = useState(EMPTY_PRODUCT_FORM);

  useEffect(() => {
    if (product) {
      setForm({
        brand_id: product.brand_id,
        name: product.name,
        description: product.description,
        price_normal: product.price_normal,
        price_promo: product.price_promo ?? "",
        target_audience: product.target_audience ?? "",
        pain_points: product.pain_points ?? "",
        objections: product.objections ?? "",
        usp: product.usp ?? "",
      });
    } else {
      setForm({ ...EMPTY_PRODUCT_FORM, brand_id: brandId });
    }
    setFieldErrors({});
  }, [product, isOpen, brandId]);

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field as keyof ProductFieldErrors];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: ProductFieldErrors = {};
    if (!form.brand_id) nextErrors.brand_id = "Field ini wajib diisi";
    if (!form.name.trim()) nextErrors.name = "Field ini wajib diisi";
    if (!form.description.trim()) nextErrors.description = "Field ini wajib diisi";
    if (!form.price_normal.trim()) nextErrors.price_normal = "Field ini wajib diisi";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      showToast("Lengkapi field wajib sebelum menyimpan.", "warning");
      return;
    }
    setIsLoading(true);
    try {
      const nullify = (v: string) => v.trim() || null;
      if (isEditing && product) {
        const input: UpdateProductInput = {
          brand_id: form.brand_id,
          name: form.name, description: form.description,
          price_normal: form.price_normal, price_promo: nullify(form.price_promo),
          target_audience: nullify(form.target_audience), pain_points: nullify(form.pain_points),
          objections: nullify(form.objections), usp: nullify(form.usp),
        };
        await updateProduct(product.id, input);
        showToast("Produk diperbarui!", "success");
      } else {
        const input: CreateProductInput = {
          brand_id: form.brand_id, name: form.name, description: form.description,
          price_normal: form.price_normal, price_promo: nullify(form.price_promo),
          target_audience: nullify(form.target_audience), pain_points: nullify(form.pain_points),
          objections: nullify(form.objections), usp: nullify(form.usp),
        };
        await createProduct(input);
        showToast("Produk ditambahkan!", "success");
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      if (isLimitExceededError(msg)) {
        showToast(getLimitReachedMessage(maxProducts, "produk"), "error");
      } else {
        showToast(msg, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Produk" : "Tambah Produk Baru"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="product-brand" className="text-sm font-medium text-gray-700">
              Brand
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="product-brand"
              value={form.brand_id}
              onChange={(e) => set("brand_id", e.target.value)}
              className={`mt-1 w-full px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                fieldErrors.brand_id ? "border-red-400 focus:ring-red-500" : "border-gray-300"
              }`}
              required
            >
              <option value="">Pilih brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            {fieldErrors.brand_id && <p className="mt-1 text-xs text-red-600">{fieldErrors.brand_id}</p>}
          </div>
          <div className="col-span-2">
            <Input
              label="Nama Produk"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Kelas Online Marketing Digital"
              error={fieldErrors.name}
              required
            />
          </div>
          <div className="col-span-2">
            <Textarea
              label="Deskripsi Produk"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Jelaskan produk kamu secara lengkap — apa itu, bagaimana cara kerjanya, apa yang didapatkan..."
              rows={4}
              error={fieldErrors.description}
              required
            />
          </div>
          <Input
            label="Harga Normal"
            value={form.price_normal}
            onChange={(e) => set("price_normal", e.target.value)}
            placeholder="e.g. Rp 997.000"
            error={fieldErrors.price_normal}
            required
          />
          <Input label="Harga Promo (opsional)" value={form.price_promo} onChange={(e) => set("price_promo", e.target.value)} placeholder="e.g. Rp 497.000" />
        </div>

        <div className="border-t pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Market Positioning (Opsional)</p>
          <div className="space-y-3">
            <Textarea label="Target Audience" value={form.target_audience} onChange={(e) => set("target_audience", e.target.value)}
              placeholder="Siapa target pembeli ideal kamu? e.g. Pemilik UMKM berusia 25-40 tahun yang ingin scale bisnis..." rows={2} />
            <Textarea label="Pain Points" value={form.pain_points} onChange={(e) => set("pain_points", e.target.value)}
              placeholder="Masalah utama yang dirasakan target audience kamu..." rows={2} />
            <Textarea label="Common Objections" value={form.objections} onChange={(e) => set("objections", e.target.value)}
              placeholder="Keberatan umum calon pembeli sebelum membeli... e.g. 'Harganya terlalu mahal', 'Saya tidak punya waktu'" rows={2} />
            <Textarea label="USP (Unique Selling Proposition)" value={form.usp} onChange={(e) => set("usp", e.target.value)}
              placeholder="Apa yang membuat produk kamu BERBEDA dari kompetitor?" rows={2} />
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Batal</Button>
          <Button type="submit" isLoading={isLoading}>{isEditing ? "Simpan Perubahan" : "Tambah Produk"}</Button>
        </div>
      </form>
    </Modal>
  );
}
