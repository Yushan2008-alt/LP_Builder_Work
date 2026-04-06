"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useBrandContext } from "@/contexts/BrandContext";
import type { Product, CreateProductInput, UpdateProductInput } from "@/lib/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  brandId: string;
  product?: Product | null;
}

export function ProductForm({ isOpen, onClose, brandId, product }: Props) {
  const { createProduct, updateProduct } = useBrandContext();
  const { showToast } = useToast();
  const isEditing = !!product;
  const [isLoading, setIsLoading] = useState(false);

  const empty = { name: "", description: "", price_normal: "", price_promo: "", target_audience: "", pain_points: "", objections: "", usp: "" };
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (product) {
      setForm({
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
      setForm(empty);
    }
  }, [product, isOpen]);

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.price_normal.trim()) {
      showToast("Nama, deskripsi, dan harga normal wajib diisi.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const nullify = (v: string) => v.trim() || null;
      if (isEditing && product) {
        const input: UpdateProductInput = {
          name: form.name, description: form.description,
          price_normal: form.price_normal, price_promo: nullify(form.price_promo),
          target_audience: nullify(form.target_audience), pain_points: nullify(form.pain_points),
          objections: nullify(form.objections), usp: nullify(form.usp),
        };
        await updateProduct(product.id, input);
        showToast("Produk diperbarui!", "success");
      } else {
        const input: CreateProductInput = {
          brand_id: brandId, name: form.name, description: form.description,
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
      if (msg.includes("limit")) {
        showToast("Batas maksimum 10 produk telah tercapai.", "error");
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
            <Input label="Nama Produk" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Kelas Online Marketing Digital" required />
          </div>
          <div className="col-span-2">
            <Textarea label="Deskripsi Produk" value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Jelaskan produk kamu secara lengkap — apa itu, bagaimana cara kerjanya, apa yang didapatkan..." rows={4} required />
          </div>
          <Input label="Harga Normal" value={form.price_normal} onChange={(e) => set("price_normal", e.target.value)} placeholder="e.g. Rp 997.000" required />
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
