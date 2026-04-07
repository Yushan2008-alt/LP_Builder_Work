import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectProvider } from "@/contexts/ProjectContext";
import SectionPlanner from "@/components/generator/SectionPlanner";

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
