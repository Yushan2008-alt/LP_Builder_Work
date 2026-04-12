import { AppLayout } from "@/components/layout/AppLayout";
import dynamic from "next/dynamic";
import { ProjectProvider } from "@/contexts/ProjectContext";

const SectionPlanner = dynamic(() => import("@/components/generator/SectionPlanner"), {
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function GeneratorProjectPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <AppLayout fullHeight>
      <ProjectProvider>
        <SectionPlanner projectId={projectId} />
      </ProjectProvider>
    </AppLayout>
  );
}
