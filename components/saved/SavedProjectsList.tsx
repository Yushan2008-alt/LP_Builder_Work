"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/lib/hooks/useProjects";
import { useBrandContext } from "@/contexts/BrandContext";
import { Project } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/Modal";

export default function SavedProjectsList() {
  const router = useRouter();
  const { showToast } = useToast();
  const { projects, isLoading, fetchProjects, deleteProject } = useProjects();
  const { products } = useBrandContext();
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  async function handleDelete(project: Project) {
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      showToast(`Project "${project.name}" dihapus`, "success");
    } catch {
      showToast("Gagal menghapus project", "error");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }

  function getProductName(productId: string) {
    return products.find((p) => p.id === productId)?.name ?? "—";
  }

  const modeColors = {
    formula: "bg-purple-100 text-purple-700",
    custom: "bg-gray-100 text-gray-600",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Saved Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {projects.length} dari 4 project
          </p>
        </div>
        <button
          onClick={() => router.push("/generator/new")}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Buat Project Baru
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Belum ada project</p>
            <p className="text-xs text-gray-400 mt-0.5">Buat LP project pertama kamu!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${modeColors[project.mode]}`}>
                      {project.mode === "formula" ? project.framework ?? "Formula" : "Custom"}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      project.output_mode === "html"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {project.output_mode.toUpperCase()}
                    </span>
                    {project.is_dirty && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600">
                        Unsaved
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                    <span>Produk: <strong className="text-gray-700">{getProductName(project.product_id)}</strong></span>
                    {project.platform && (
                      <span>Platform: <strong className="text-gray-700">{project.platform}</strong></span>
                    )}
                    {project.tone && (
                      <span>Tone: <strong className="text-gray-700">{project.tone}</strong></span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-1">
                    Diperbarui {formatDate(project.updated_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => router.push(`/generator/${project.id}`)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Buka →
                  </button>
                  <button
                    onClick={() => setDeleteTarget(project)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Hapus Project"
        message={`Yakin ingin menghapus project "${deleteTarget?.name}"? Semua seksi di dalamnya akan ikut terhapus dan tidak bisa dikembalikan.`}
        confirmText="Hapus"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
