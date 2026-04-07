import { AppLayout } from "@/components/layout/AppLayout";
import { FormulaGallery } from "@/components/generator/FormulaGallery";
import { ProjectProvider } from "@/contexts/ProjectContext";

export default function GeneratorNewPage() {
  return (
    <AppLayout>
      <ProjectProvider>
        <FormulaGallery />
      </ProjectProvider>
    </AppLayout>
  );
}
