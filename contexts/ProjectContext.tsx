"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  Project, Section, ProjectContextValue,
  CreateSectionInput, UpdateSectionInput
} from "@/lib/types";
import { useAuth } from "./AuthContext";

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [project, setProjectState] = useState<Project | null>(null);
  const [sections, setSectionsState] = useState<Section[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState("");

  const setProject = useCallback((p: Project) => {
    setProjectState((prev) => {
      if (!prev) return p;

      const hasChanged =
        prev.product_id !== p.product_id ||
        prev.name !== p.name ||
        prev.framework !== p.framework ||
        prev.mode !== p.mode ||
        prev.tone !== p.tone ||
        prev.platform !== p.platform ||
        prev.output_mode !== p.output_mode ||
        JSON.stringify(prev.global_settings) !== JSON.stringify(p.global_settings);

      if (!hasChanged) return p;

      setIsDirty(true);
      return { ...p, is_dirty: true };
    });
  }, []);

  const setSections = useCallback((s: Section[]) => {
    setSectionsState(s);
  }, []);

  const loadProject = useCallback(async (projectId: string) => {
    if (!user) {
      setProjectState(null);
      setSectionsState([]);
      setIsDirty(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data: projectData } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!projectData) {
        setProjectState(null);
        setSectionsState([]);
        setIsDirty(false);
        return;
      }

      const { data: sectionsData } = await supabase
        .from("sections")
        .select("*")
        .eq("project_id", projectId)
        .order("order_index", { ascending: true });

      setProjectState(projectData as Project);
      setSectionsState((sectionsData as Section[]) ?? []);
      setIsDirty(false);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  const addSection = useCallback(async (input: Omit<CreateSectionInput, "project_id">): Promise<Section | null> => {
    if (!project) return null;
    const { data, error } = await supabase
      .from("sections")
      .insert({ ...input, project_id: project.id })
      .select()
      .single();
    if (error) throw new Error(error.message);
    const section = data as Section;
    setSectionsState((prev) => [...prev, section].sort((a, b) => a.order_index - b.order_index));
    setIsDirty(true);
    return section;
  }, [project, supabase]);

  const updateSection = useCallback(async (id: string, input: UpdateSectionInput): Promise<void> => {
    const { data, error } = await supabase
      .from("sections")
      .update(input)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    const updated = data as Section;
    setSectionsState((prev) => prev.map((s) => (s.id === id ? updated : s)));
    setIsDirty(true);
  }, [supabase]);

  const deleteSection = useCallback(async (id: string): Promise<void> => {
    const previousSections = sections;
    const nextSections = previousSections
      .filter((s) => s.id !== id)
      .map((s, i) => ({ ...s, order_index: i }));

    setSectionsState(nextSections);
    setIsDirty(true);

    try {
      const { error: deleteError } = await supabase.from("sections").delete().eq("id", id);
      if (deleteError) throw new Error(deleteError.message);

      const reorderUpdates = nextSections.map((s) =>
        supabase.from("sections").update({ order_index: s.order_index }).eq("id", s.id)
      );
      const reorderResults = await Promise.all(reorderUpdates);
      const failed = reorderResults.find((result) => result.error);
      if (failed?.error) throw new Error(failed.error.message);
    } catch (error) {
      setSectionsState(previousSections);
      throw error;
    }
  }, [sections, supabase]);

  const duplicateSection = useCallback(async (id: string): Promise<void> => {
    const original = sections.find((s) => s.id === id);
    if (!original || !project) return;
    const newOrderIndex = original.order_index + 1;
    // Shift all sections after this one
    const sectionsToShift = sections.filter((s) => s.order_index >= newOrderIndex);
    if (sectionsToShift.length > 0) {
      await Promise.all(
        sectionsToShift.map((s) =>
          supabase.from("sections").update({ order_index: s.order_index + 1 }).eq("id", s.id)
        )
      );
    }
    const { data, error } = await supabase
      .from("sections")
      .insert({
        project_id: project.id,
        order_index: newOrderIndex,
        section_title: original.section_title + " (Copy)",
        section_goals: original.section_goals,
        layout_format: original.layout_format,
        style_mode: original.style_mode,
        style_custom: original.style_custom,
        framework_position: original.framework_position,
        additional_context: original.additional_context,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    const newSection = data as Section;
    setSectionsState((prev) => {
      const shifted = prev.map((s) =>
        s.order_index >= newOrderIndex ? { ...s, order_index: s.order_index + 1 } : s
      );
      return [...shifted, newSection].sort((a, b) => a.order_index - b.order_index);
    });
    setIsDirty(true);
  }, [sections, project, supabase]);

  const reorderSections = useCallback(async (newSections: Section[]): Promise<void> => {
    const previousSections = sections;
    const reindexed = newSections.map((s, i) => ({ ...s, order_index: i }));

    setSectionsState(reindexed);
    setIsDirty(true);

    try {
      const updates = reindexed.map((s) =>
        supabase.from("sections").update({ order_index: s.order_index }).eq("id", s.id)
      );
      const results = await Promise.all(updates);
      const failed = results.find((result) => result.error);
      if (failed?.error) throw new Error(failed.error.message);
    } catch (error) {
      setSectionsState(previousSections);
      throw error;
    }
  }, [sections, supabase]);

  const saveProject = useCallback(async (): Promise<boolean> => {
    if (!project) return false;
    setIsSaving(true);
    try {
      const updatableProject = {
        product_id: project.product_id,
        name: project.name,
        framework: project.framework,
        mode: project.mode,
        tone: project.tone,
        platform: project.platform,
        output_mode: project.output_mode,
        global_settings: project.global_settings,
      };

      const { error } = await supabase
        .from("projects")
        .update({ ...updatableProject, is_dirty: false })
        .eq("id", project.id);
      if (error) throw new Error(error.message);
      setProjectState((prev) => prev ? { ...prev, is_dirty: false } : null);
      setIsDirty(false);
      return true;
    } finally {
      setIsSaving(false);
    }
  }, [project, supabase]);

  return (
    <ProjectContext.Provider
      value={{
        project, sections, isDirty, isLoading, isSaving, generatedOutput,
        setProject, setSections, setIsDirty, setGeneratedOutput,
        addSection, updateSection, deleteSection, duplicateSection,
        reorderSections, saveProject, loadProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjectContext must be used within ProjectProvider");
  }
  return context;
}
