"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  Project, Section, ProjectContextValue,
  CreateSectionInput, UpdateSectionInput
} from "@/lib/types";
import { useAuth } from "./AuthContext";
import { useRef } from "react";

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
  const initialProjectRef = useRef<Project | null>(null);
  const initialSectionsRef = useRef<Section[]>([]);
  const tempIdCounterRef = useRef(0);

  const makeTempId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `tmp-${crypto.randomUUID()}`;
    }
    tempIdCounterRef.current += 1;
    return `tmp-${tempIdCounterRef.current}-${Math.random().toString(36).slice(2, 14)}`;
  };

  const isTempId = (id: string) => id.startsWith("tmp-");

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

      if (!hasChanged) return prev;

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
        initialProjectRef.current = null;
        initialSectionsRef.current = [];
        return;
      }

      const { data: sectionsData } = await supabase
        .from("sections")
        .select("*")
        .eq("project_id", projectId)
        .order("order_index", { ascending: true });

      const nextProject = projectData as Project;
      const nextSections = (sectionsData as Section[]) ?? [];
      setProjectState(nextProject);
      setSectionsState(nextSections);
      setIsDirty(false);
      initialProjectRef.current = nextProject;
      initialSectionsRef.current = nextSections.map((section) => ({ ...section }));
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  const addSection = useCallback(async (input: Omit<CreateSectionInput, "project_id">): Promise<Section | null> => {
    if (!project) return null;
    const section: Section = {
      id: makeTempId(),
      project_id: project.id,
      order_index: input.order_index,
      section_title: input.section_title,
      section_goals: input.section_goals,
      layout_format: input.layout_format,
      style_mode: input.style_mode ?? "default",
      style_custom: input.style_custom ?? null,
      framework_position: input.framework_position ?? null,
      additional_context: input.additional_context ?? null,
      created_at: new Date().toISOString(),
    };
    setSectionsState((prev) =>
      [...prev, section]
        .sort((a, b) => a.order_index - b.order_index)
        .map((item, index) => ({ ...item, order_index: index }))
    );
    setIsDirty(true);
    setProjectState((prev) => (prev ? { ...prev, is_dirty: true } : prev));
    return section;
  }, [project]);

  const updateSection = useCallback(async (id: string, input: UpdateSectionInput): Promise<void> => {
    setSectionsState((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          ...input,
          style_custom: input.style_custom !== undefined ? input.style_custom : s.style_custom,
          framework_position:
            input.framework_position !== undefined ? input.framework_position : s.framework_position,
          additional_context:
            input.additional_context !== undefined ? input.additional_context : s.additional_context,
        };
      })
    );
    setIsDirty(true);
    setProjectState((prev) => (prev ? { ...prev, is_dirty: true } : prev));
  }, []);

  const deleteSection = useCallback(async (id: string): Promise<void> => {
    const nextSections = sections
      .filter((s) => s.id !== id)
      .map((s, i) => ({ ...s, order_index: i }));
    setSectionsState(nextSections);
    setIsDirty(true);
    setProjectState((prev) => (prev ? { ...prev, is_dirty: true } : prev));
  }, [sections]);

  const duplicateSection = useCallback(async (id: string): Promise<void> => {
    const original = sections.find((s) => s.id === id);
    if (!original || !project) return;
    const newOrderIndex = original.order_index + 1;

    const newSection: Section = {
      ...original,
      id: makeTempId(),
      project_id: project.id,
      order_index: newOrderIndex,
      section_title: `${original.section_title} (Copy)`,
      created_at: new Date().toISOString(),
    };

    setSectionsState((prev) => {
      const shifted = prev.map((s) =>
        s.order_index >= newOrderIndex ? { ...s, order_index: s.order_index + 1 } : s
      );
      return [...shifted, newSection].sort((a, b) => a.order_index - b.order_index);
    });
    setIsDirty(true);
    setProjectState((prev) => (prev ? { ...prev, is_dirty: true } : prev));
  }, [sections, project]);

  const reorderSections = useCallback(async (newSections: Section[]): Promise<void> => {
    const reindexed = newSections.map((s, i) => ({ ...s, order_index: i }));
    setSectionsState(reindexed);
    setIsDirty(true);
    setProjectState((prev) => (prev ? { ...prev, is_dirty: true } : prev));
  }, []);

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

      const { error: projectError } = await supabase
        .from("projects")
        .update({ ...updatableProject, is_dirty: false })
        .eq("id", project.id);
      if (projectError) throw new Error(projectError.message);

      const initialSections = initialSectionsRef.current;
      const currentSections = sections.map((section, index) => ({
        ...section,
        order_index: index,
      }));

      const currentIdSet = new Set(currentSections.map((section) => section.id));
      const deletedSectionIds = initialSections
        .filter((section) => !currentIdSet.has(section.id))
        .map((section) => section.id)
        .filter((id) => !isTempId(id));

      if (deletedSectionIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("sections")
          .delete()
          .in("id", deletedSectionIds);
        if (deleteError) throw new Error(deleteError.message);
      }

      const sectionsToInsert = currentSections.filter((section) => isTempId(section.id));
      if (sectionsToInsert.length > 0) {
        const payload = sectionsToInsert.map((section) => ({
          project_id: project.id,
          order_index: section.order_index,
          section_title: section.section_title,
          section_goals: section.section_goals,
          layout_format: section.layout_format,
          style_mode: section.style_mode,
          style_custom: section.style_custom,
          framework_position: section.framework_position,
          additional_context: section.additional_context,
        }));
        const { error: insertError } = await supabase.from("sections").insert(payload);
        if (insertError) throw new Error(insertError.message);
      }

      const initialMap = new Map(initialSections.map((section) => [section.id, section]));
      const sectionUpdatePromises = currentSections
        .filter((section) => !isTempId(section.id))
        .map(async (section) => {
          const initial = initialMap.get(section.id);
          if (!initial) {
            throw new Error(
              `Section baseline mismatch for "${section.id}". Reload project sebelum menyimpan ulang untuk menjaga konsistensi data.`
            );
          }

          const hasChanged =
            initial.order_index !== section.order_index ||
            initial.section_title !== section.section_title ||
            initial.section_goals !== section.section_goals ||
            initial.layout_format !== section.layout_format ||
            initial.style_mode !== section.style_mode ||
            initial.style_custom !== section.style_custom ||
            initial.framework_position !== section.framework_position ||
            initial.additional_context !== section.additional_context;

          if (!hasChanged) {
            return;
          }

          const { error: updateError } = await supabase
            .from("sections")
            .update({
              order_index: section.order_index,
              section_title: section.section_title,
              section_goals: section.section_goals,
              layout_format: section.layout_format,
              style_mode: section.style_mode,
              style_custom: section.style_custom,
              framework_position: section.framework_position,
              additional_context: section.additional_context,
            })
            .eq("id", section.id);

          if (updateError) {
            throw new Error(updateError.message);
          }
        });

      await Promise.all(sectionUpdatePromises);

      const { data: latestSections, error: latestSectionsError } = await supabase
        .from("sections")
        .select("*")
        .eq("project_id", project.id)
        .order("order_index", { ascending: true });
      if (latestSectionsError) throw new Error(latestSectionsError.message);

      const updatedProject = { ...project, is_dirty: false };
      const updatedSections = (latestSections as Section[]) ?? [];
      setProjectState(updatedProject);
      setSectionsState(updatedSections);
      setIsDirty(false);
      initialProjectRef.current = updatedProject;
      initialSectionsRef.current = updatedSections.map((section) => ({ ...section }));
      return true;
    } finally {
      setIsSaving(false);
    }
  }, [project, sections, supabase]);

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
