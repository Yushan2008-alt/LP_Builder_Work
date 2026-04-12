import { AppLayout } from "@/components/layout/AppLayout";
import dynamic from "next/dynamic";

const VisualEditor = dynamic(() => import("@/components/visual-editor/VisualEditor"), {
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function EditorPage() {
  return (
    <AppLayout fullHeight>
      <VisualEditor />
    </AppLayout>
  );
}
