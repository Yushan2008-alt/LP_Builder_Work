import { useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project, CreateProjectInput } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { getFormulaById } from "@/lib/config/formulas";

export function useProjects() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (!error && data) setProjects(data as Project[]);
    setIsLoading(false);
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
      if (error) throw new Error(error.message);
    }

    return project.id;
  }, [user, createProject, supabase]);

  return {
    projects, isLoading,
    fetchProjects, createProject, createProjectFromFormula,
    updateProject, deleteProject,
  };
}
