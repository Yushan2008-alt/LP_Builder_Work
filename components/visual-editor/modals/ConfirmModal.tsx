"use client";

import { useEditorStore } from "@/store/editor-store";

export default function ConfirmModal() {
  const { showConfirmDelete, setShowConfirmDelete, deleteElement, selectedTag } = useEditorStore();

  if (!showConfirmDelete) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-red-600">🗑</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Delete Element</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Are you sure you want to delete this <span className="font-mono text-red-600">&lt;{selectedTag}&gt;</span> element?
              This cannot be undone (unless you undo).
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setShowConfirmDelete(false)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={deleteElement}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
