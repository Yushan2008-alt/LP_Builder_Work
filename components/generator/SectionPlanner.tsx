"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useProjectContext } from "@/contexts/ProjectContext";
import { useBrandContext } from "@/contexts/BrandContext";
import { assemblePrompt, canGenerate } from "@/lib/prompts/engine";
import { TONES, PLATFORMS } from "@/lib/config/platforms";
import SectionCard from "./SectionCard";
import OutputPanel from "./OutputPanel";
import { useToast } from "@/components/ui/Toast";

interface SectionPlannerProps {
  projectId: string;
}

export default function SectionPlanner({ projectId }: SectionPlannerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const {
    project, sections, isDirty, isLoading, isSaving, generatedOutput,
    setProject, setGeneratedOutput,
    loadProject, addSection, updateSection, deleteSection,
    duplicateSection, reorderSections, saveProject,
  } = useProjectContext();

  const { products, brands } = useBrandContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputMode, setOutputMode] = useState<"html" | "copy">("html");
  const projectOutputMode = project?.output_mode;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Load project on mount
  useEffect(() => {
    loadProject(projectId);
  }, [projectId, loadProject]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const currentPath = `${window.location.pathname}${window.location.search}`;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const confirmLeave = () =>
      window.confirm("Kamu punya perubahan yang belum disimpan. Yakin mau keluar?");

    const handleDocumentClick = (e: MouseEvent) => {
      if (!isDirty) return;
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as Element | null;
      const link = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!link) return;
      if (link.target === "_blank" || link.hasAttribute("download")) return;

      const nextUrl = new URL(link.href, window.location.href);
      const nextPath = `${nextUrl.pathname}${nextUrl.search}`;
      if (currentPath === nextPath) return;

      if (!confirmLeave()) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handlePopState = () => {
      if (!isDirty) return;
      if (!confirmLeave()) {
        window.history.pushState(null, "", currentPath);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty]);

  // Sync output mode from project
  useEffect(() => {
    if (projectOutputMode) setOutputMode(projectOutputMode);
  }, [projectOutputMode, setOutputMode]);

  // Deep-link output mode override: /generator/:projectId?mode=html|copy
  useEffect(() => {
    if (!project) return;
    const mode = searchParams.get("mode");
    if (mode !== "html" && mode !== "copy") return;
    if (project.output_mode === mode) return;
    setOutputMode(mode);
    setProject({ ...project, output_mode: mode });
  }, [project, searchParams, setProject]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reorderSections(reordered);
  }

  async function handleAddSection() {
    if (!project) return;
    try {
      await addSection({
        order_index: sections.length,
        section_title: `Seksi ${sections.length + 1}`,
        section_goals: "",
        layout_format: "standard_image",
        style_mode: "default",
      });
    } catch {
      showToast("Gagal menambah seksi", "error");
    }
  }

  async function handleSave() {
    try {
      const ok = await saveProject();
      if (ok) showToast("Project berhasil disimpan!", "success");
      else showToast("Gagal menyimpan project", "error");
    } catch {
      showToast("Gagal menyimpan project", "error");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteSection(id);
    } catch {
      showToast("Gagal menghapus seksi", "error");
    }
  }

  async function handleDuplicate(id: string) {
    try {
      await duplicateSection(id);
      showToast("Seksi berhasil diduplikasi", "success");
    } catch {
      showToast("Gagal menduplikasi seksi", "error");
    }
  }

  function handleGenerate() {
    if (!project) return;
    const product = products.find((p) => p.id === project.product_id);
    if (!product) {
      showToast("Produk tidak ditemukan", "error");
      return;
    }
    const brand = brands.find((b) => b.id === product.brand_id);
    if (!brand) {
      showToast("Brand tidak ditemukan", "error");
      return;
    }
    if (!canGenerate(project, sections, project.product_id)) {
      showToast("Lengkapi semua seksi sebelum generate", "warning");
      return;
    }
    setIsGenerating(true);
    try {
      const prompt = assemblePrompt({ project, product, brand, sections });
      setGeneratedOutput(prompt);
      showToast("Prompt berhasil dibuat! Copy dan paste ke Claude/ChatGPT.", "success");
    } catch {
      showToast("Gagal membuat prompt", "error");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleToneChange(tone: string) {
    if (!project) return;
    setProject({ ...project, tone });
  }

  function handlePlatformChange(platform: string) {
    if (!project) return;
    setProject({ ...project, platform });
  }

  function handleOutputModeChange(mode: "html" | "copy") {
    if (!project) return;
    setOutputMode(mode);
    setProject({ ...project, output_mode: mode });
  }

  const currentProduct = project ? products.find((p) => p.id === project.product_id) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-500">
        <p>Project tidak ditemukan.</p>
        <button
          onClick={() => router.push("/generator/new")}
          className="text-blue-600 hover:underline text-sm"
        >
          Buat project baru
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Global Bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Project Name + Formula */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-gray-900 truncate">{project.name}</h1>
              {project.framework && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium flex-shrink-0">
                  {project.framework}
                </span>
              )}
              {isDirty && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium flex-shrink-0">
                  Unsaved
                </span>
              )}
            </div>
            {currentProduct && (
              <p className="text-xs text-gray-500 mt-0.5">Produk: {currentProduct.name}</p>
            )}
          </div>

          {/* Tone */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500">Tone:</label>
            <select
              value={project.tone ?? ""}
              onChange={(e) => handleToneChange(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Pilih Tone</option>
              {TONES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Platform */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500">Platform:</label>
            <select
              value={project.platform ?? ""}
              onChange={(e) => handlePlatformChange(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Pilih Platform</option>
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Output Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => handleOutputModeChange("html")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                outputMode === "html"
                  ? "bg-white shadow-sm text-gray-800"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              HTML
            </button>
            <button
              onClick={() => handleOutputModeChange("copy")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                outputMode === "copy"
                  ? "bg-white shadow-sm text-gray-800"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Copywriting
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                isDirty && !isSaving
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSaving ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || sections.length === 0}
              className={`px-4 py-1.5 text-xs rounded-lg font-semibold transition-colors ${
                !isGenerating && sections.length > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isGenerating ? "Generating..." : "⚡ Generate Prompt"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Section List */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">
              Seksi ({sections.length})
            </h2>
          </div>

          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {sections.map((section, index) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    index={index}
                    onUpdate={updateSection}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {/* Add Section Button */}
            <button
              onClick={handleAddSection}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              + Tambah Seksi
            </button>

            {sections.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                <p>Belum ada seksi.</p>
                <p className="text-xs mt-1">Klik &ldquo;+ Tambah Seksi&rdquo; untuk mulai.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Output Panel */}
        <div className="w-1/2 overflow-hidden p-4">
          <OutputPanel
            output={generatedOutput}
            outputMode={outputMode}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  );
}
