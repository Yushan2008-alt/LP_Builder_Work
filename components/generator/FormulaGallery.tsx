"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useBrandContext } from "@/contexts/BrandContext";
import { useToast } from "@/components/ui/Toast";
import { FormulaCard } from "./FormulaCard";
import { FORMULAS, FORMULA_TIERS } from "@/lib/config/formulas";
import { useProjects } from "@/lib/hooks/useProjects";
import { generateProjectName, getLimitReachedMessage, isLimitExceededError } from "@/lib/utils";
import type { FormulaTier } from "@/lib/config/formulas";

export function FormulaGallery() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, userLimits } = useBrandContext();
  const { createProjectFromFormula, projects, fetchProjects, isLoading: isProjectsLoading } = useProjects();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [activeTier, setActiveTier] = useState<FormulaTier | "all">("all");
  const [loadingFormulaId, setLoadingFormulaId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [preselectedFormulaId, setPreselectedFormulaId] = useState<string | null>(null);

  const maxProjects = userLimits?.max_projects ?? 4;
  const canCreate = projects.length < maxProjects;
  const projectLimitMessage = getLimitReachedMessage(maxProjects, "project");

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filtered = useMemo(() => {
    return FORMULAS.filter((f) => {
      const matchTier = activeTier === "all" || f.tier === activeTier;
      const matchSearch =
        search === "" ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.description.toLowerCase().includes(search.toLowerCase()) ||
        f.bestCase.toLowerCase().includes(search.toLowerCase());
      return matchTier && matchSearch;
    });
  }, [search, activeTier]);

  const groupedByTier = useMemo(
    () =>
      FORMULA_TIERS.map((tier) => ({
        ...tier,
        formulas: filtered.filter((formula) => formula.tier === tier.id),
      })).filter((group) => group.formulas.length > 0),
    [filtered]
  );

  const disableFormulaSelection =
    isProjectsLoading || loadingFormulaId !== null || !selectedProductId || !canCreate;

  useEffect(() => {
    const framework = searchParams.get("framework");
    if (!framework) {
      setPreselectedFormulaId(null);
      return;
    }
    const exists = FORMULAS.some((formula) => formula.id === framework);
    setPreselectedFormulaId(exists ? framework : null);
  }, [searchParams]);

  const handleSelect = async (formulaId: string) => {
    if (isProjectsLoading) {
      showToast("Sedang memuat daftar project. Coba lagi sebentar.", "warning");
      return;
    }
    if (!canCreate) {
      showToast(projectLimitMessage, "error");
      return;
    }
    if (!selectedProductId) {
      showToast("Pilih produk terlebih dahulu untuk membuat LP.", "error");
      return;
    }
    const formula = FORMULAS.find((f) => f.id === formulaId);
    if (!formula) return;
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    setLoadingFormulaId(formulaId);
    try {
      const projectName = generateProjectName(formula.name, product.name);
      const projectId = await createProjectFromFormula(formulaId, selectedProductId, projectName);
      if (projectId) {
        router.push(`/generator/${projectId}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat project";
      if (isLimitExceededError(msg)) {
        showToast(projectLimitMessage, "error");
      } else {
        showToast(msg, "error");
      }
    } finally {
      setLoadingFormulaId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pilih Formula LP</h1>
        <p className="text-sm text-gray-500 mt-1">
          Setiap formula adalah kerangka copywriting yang berbeda. Pilih yang paling sesuai dengan produk dan tujuanmu.
        </p>
      </div>

      {/* Product Selector (required) */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <label className="text-sm font-semibold text-blue-800">Produk yang akan di-LP-kan:</label>
          </div>
          {products.length === 0 ? (
            <p className="text-sm text-blue-600">
              Belum ada produk.{" "}
              <Link
                href="/products"
                className="underline font-medium"
              >
                Tambah produk dulu →
              </Link>
            </p>
          ) : (
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="flex-1 min-w-48 px-3 py-1.5 border border-blue-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Produk --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <span className="text-xs text-blue-500 shrink-0">
            {projects.length}/{maxProjects} project digunakan
          </span>
        </div>
      </div>

      {isProjectsLoading && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Sedang memuat jumlah project tersimpan. Pilihan formula akan aktif setelah proses selesai.
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari formula... (AIDA, Story, B2B, dsb)"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTier("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTier === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Semua
          </button>
          {FORMULA_TIERS.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setActiveTier(tier.id as FormulaTier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTier === tier.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* Formula Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">Tidak ada formula yang cocok dengan pencarian kamu.</p>
        </div>
      ) : (
        activeTier === "all" ? (
          <div className="space-y-8">
            {groupedByTier.map((group) => (
              <section key={group.id}>
                <div className="mb-3">
                  <h2 className="text-sm font-semibold text-gray-800">{group.label}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{group.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {group.formulas.map((formula) => (
                    <FormulaCard
                      key={formula.id}
                      formula={formula}
                      onClick={() => handleSelect(formula.id)}
                      isLoading={loadingFormulaId === formula.id}
                      isPreselected={preselectedFormulaId === formula.id}
                      disabled={disableFormulaSelection}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((formula) => (
              <FormulaCard
                key={formula.id}
                formula={formula}
                onClick={() => handleSelect(formula.id)}
                isLoading={loadingFormulaId === formula.id}
                isPreselected={preselectedFormulaId === formula.id}
                disabled={disableFormulaSelection}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
