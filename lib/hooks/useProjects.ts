import { useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project, CreateProjectInput, Section } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { getFormulaById } from "@/lib/config/formulas";

export function useProjects() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (error) {
        setProjects([]);
        return;
      }
      setProjects((data as Project[]) ?? []);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  const createProject = useCallback(async (input: CreateProjectInput): Promise<Project | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("projects")
      .insert({ ...input, user_id: user.id, output_mode: input.output_mode ?? "html" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    const project = data as Project;
    setProjects((prev) => [project, ...prev]);
    return project;
  }, [user, supabase]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>): Promise<Project | null> => {
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    const project = data as Project;
    setProjects((prev) => prev.map((p) => (p.id === id ? project : p)));
    return project;
  }, [supabase]);

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw new Error(error.message);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    return true;
  }, [supabase]);

  const duplicateProject = useCallback(async (sourceProjectId: string): Promise<Project | null> => {
    if (!user) return null;
    const sourceProject = projects.find((p) => p.id === sourceProjectId);
    if (!sourceProject) {
      throw new Error("Source project tidak ditemukan.");
    }

    const usedNames = new Set(projects.map((project) => project.name.trim().toLowerCase()));
    const baseName = `${sourceProject.name} (Copy)`;
    let copiedName = baseName;
    let suffix = 2;
    while (usedNames.has(copiedName.trim().toLowerCase())) {
      copiedName = `${baseName} ${suffix}`;
      suffix += 1;
    }

    const { data: createdData, error: createError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        product_id: sourceProject.product_id,
        name: copiedName,
        framework: sourceProject.framework,
        mode: sourceProject.mode,
        tone: sourceProject.tone,
        platform: sourceProject.platform,
        output_mode: sourceProject.output_mode,
        global_settings: sourceProject.global_settings ?? {},
        is_dirty: false,
      })
      .select()
      .single();
    if (createError) throw new Error(createError.message);

    const duplicatedProject = createdData as Project;
    setProjects((prev) => [duplicatedProject, ...prev]);

    const { data: sourceSectionsData, error: sourceSectionsError } = await supabase
      .from("sections")
      .select("*")
      .eq("project_id", sourceProjectId)
      .order("order_index", { ascending: true });

    if (sourceSectionsError) {
      const { error: rollbackError } = await supabase.from("projects").delete().eq("id", duplicatedProject.id);
      setProjects((prev) => prev.filter((project) => project.id !== duplicatedProject.id));
      if (rollbackError) {
        throw new Error(`${sourceSectionsError.message} (rollback failed: ${rollbackError.message})`);
      }
      throw new Error(sourceSectionsError.message);
    }

    const sourceSections = (sourceSectionsData as Section[]) ?? [];
    if (sourceSections.length === 0) {
      return duplicatedProject;
    }

    const duplicatedSectionsPayload = sourceSections.map((section, index) => ({
      project_id: duplicatedProject.id,
      order_index: index,
      section_title: section.section_title,
      section_goals: section.section_goals,
      layout_format: section.layout_format,
      style_mode: section.style_mode,
      style_custom: section.style_custom,
      framework_position: section.framework_position,
      additional_context: section.additional_context,
    }));

    const { error: duplicateSectionsError } = await supabase
      .from("sections")
      .insert(duplicatedSectionsPayload);

    if (duplicateSectionsError) {
      const { error: rollbackError } = await supabase.from("projects").delete().eq("id", duplicatedProject.id);
      if (rollbackError) {
        throw new Error(`${duplicateSectionsError.message} (rollback failed: ${rollbackError.message})`);
      }
      setProjects((prev) => prev.filter((project) => project.id !== duplicatedProject.id));
      throw new Error(duplicateSectionsError.message);
    }

    return duplicatedProject;
  }, [user, projects, supabase]);

  // Create a new project from a formula, auto-generating sections
  const createProjectFromFormula = useCallback(async (
    formulaId: string,
    productId: string,
    projectName: string
  ): Promise<string | null> => {
    if (!user) return null;

    const formula = getFormulaById(formulaId);
    if (!formula) throw new Error("Formula not found");

    // Create project
    const project = await createProject({
      product_id: productId,
      name: projectName,
      framework: formulaId === "custom" ? null : formulaId,
      mode: formulaId === "custom" ? "custom" : "formula",
      output_mode: "html",
    });
    if (!project) return null;

    // Create sections from formula
    if (formula.sections.length > 0) {
      const sectionsToInsert = formula.sections.map((s, i) => ({
        project_id: project.id,
        order_index: i,
        section_title: s.title,
        section_goals: s.goals,
        layout_format: s.defaultLayout ?? "standard_image",
        style_mode: "default" as const,
        framework_position: s.frameworkPosition,
      }));
      const { error } = await supabase.from("sections").insert(sectionsToInsert);
      if (error) {
        const { error: rollbackError } = await supabase.from("projects").delete().eq("id", project.id);
        if (rollbackError) {
          throw new Error(`${error.message} (rollback failed: ${rollbackError.message})`);
        }
        setProjects((prev) => prev.filter((p) => p.id !== project.id));
        throw new Error(error.message);
      }
    }

    return project.id;
  }, [user, createProject, supabase]);

  return {
    projects, isLoading,
    fetchProjects, createProject, createProjectFromFormula,
    updateProject, deleteProject, duplicateProject,
  };
}
