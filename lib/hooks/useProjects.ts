import { useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project, CreateProjectInput, Section } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { getFormulaById } from "@/lib/config/formulas";
import { getFriendlyDatabaseError } from "@/lib/utils";

const PROJECTS_CACHE_TTL_MS = 15_000;
let projectsCache: { userId: string; projects: Project[]; updatedAt: number } | null = null;
const inFlightProjectFetches = new Map<string, Promise<Project[]>>();

function getCachedProjects(userId: string): Project[] | null {
  if (!projectsCache || projectsCache.userId !== userId) return null;
  if (Date.now() - projectsCache.updatedAt > PROJECTS_CACHE_TTL_MS) return null;
  return projectsCache.projects;
}

function setProjectsCache(userId: string, projects: Project[]) {
  projectsCache = { userId, projects, updatedAt: Date.now() };
}

function clearProjectsCache(userId?: string) {
  if (!userId || projectsCache?.userId === userId) {
    projectsCache = null;
  }
}

export function useProjects() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProjects = useCallback(async (options?: { force?: boolean }) => {
    if (!user) {
      setProjects([]);
      clearProjectsCache();
      return;
    }

    const force = options?.force ?? false;
    if (!force) {
      const cachedProjects = getCachedProjects(user.id);
      if (cachedProjects) {
        setProjects(cachedProjects);
        return;
      }
      const inFlightRequest = inFlightProjectFetches.get(user.id);
      if (inFlightRequest) {
        setIsLoading(true);
        try {
          const data = await inFlightRequest;
          setProjects(data);
        } catch {
          setProjects([]);
        } finally {
          setIsLoading(false);
        }
        return;
      }
    }

    setIsLoading(true);
    const request = (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data as Project[]) ?? [];
    })();
    inFlightProjectFetches.set(user.id, request);

    try {
      const nextProjects = await request;
      setProjectsCache(user.id, nextProjects);
      setProjects(nextProjects);
    } catch {
      setProjects([]);
      clearProjectsCache(user.id);
    } finally {
      inFlightProjectFetches.delete(user.id);
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
    if (error) throw new Error(getFriendlyDatabaseError(error.message));
    const project = data as Project;
    setProjects((prev) => [project, ...prev]);
    clearProjectsCache(user.id);
    return project;
  }, [user, supabase]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>): Promise<Project | null> => {
    if (!user) {
      throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
    }
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();
    if (error) throw new Error(getFriendlyDatabaseError(error.message));
    const project = data as Project;
    setProjects((prev) => prev.map((p) => (p.id === id ? project : p)));
    clearProjectsCache(user.id);
    return project;
  }, [supabase, user]);

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    if (!user) {
      throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
    }
    const { error } = await supabase.from("projects").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw new Error(getFriendlyDatabaseError(error.message));
    setProjects((prev) => prev.filter((p) => p.id !== id));
    clearProjectsCache(user.id);
    return true;
  }, [supabase, user]);

  const duplicateProject = useCallback(async (sourceProjectId: string): Promise<Project | null> => {
    if (!user) return null;
    const sourceProject = projects.find((p) => p.id === sourceProjectId);
    if (!sourceProject) {
      throw new Error("Source project not found.");
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
    if (createError) throw new Error(getFriendlyDatabaseError(createError.message));

    const duplicatedProject = createdData as Project;
    setProjects((prev) => [duplicatedProject, ...prev]);
    clearProjectsCache(user.id);

    const { data: sourceSectionsData, error: sourceSectionsError } = await supabase
      .from("sections")
      .select("*")
      .eq("project_id", sourceProjectId)
      .order("order_index", { ascending: true });

    if (sourceSectionsError) {
      const { error: rollbackError } = await supabase.from("projects").delete().eq("id", duplicatedProject.id);
      if (rollbackError) {
        throw new Error(
          `${getFriendlyDatabaseError(sourceSectionsError.message)} (rollback failed: ${getFriendlyDatabaseError(rollbackError.message)})`
        );
      }
      setProjects((prev) => prev.filter((project) => project.id !== duplicatedProject.id));
      clearProjectsCache(user.id);
      throw new Error(getFriendlyDatabaseError(sourceSectionsError.message));
    }

    const sourceSections = (sourceSectionsData as Section[]) ?? [];
    if (sourceSections.length === 0) {
      return duplicatedProject;
    }

    const duplicatedSectionsPayload = sourceSections.map((section, index) => ({
      project_id: duplicatedProject.id,
      product_id: section.product_id ?? duplicatedProject.product_id,
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
        throw new Error(
          `${getFriendlyDatabaseError(duplicateSectionsError.message)} (rollback failed: ${getFriendlyDatabaseError(rollbackError.message)})`
        );
      }
      setProjects((prev) => prev.filter((project) => project.id !== duplicatedProject.id));
      clearProjectsCache(user.id);
      throw new Error(getFriendlyDatabaseError(duplicateSectionsError.message));
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
        product_id: productId,
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
          throw new Error(
            `${getFriendlyDatabaseError(error.message)} (rollback failed: ${getFriendlyDatabaseError(rollbackError.message)})`
          );
        }
        setProjects((prev) => prev.filter((p) => p.id !== project.id));
        clearProjectsCache(user.id);
        throw new Error(getFriendlyDatabaseError(error.message));
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
