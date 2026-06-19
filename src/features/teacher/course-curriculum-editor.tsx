"use client";

import { useMutation } from "convex/react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionTitle } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type Lesson = {
  _id: Id<"lessons">;
  title: string;
  youtubeUrl?: string;
  content?: string;
  durationMinutes?: number;
  isFreePreview: boolean;
  order: number;
};

type Module = {
  _id: Id<"modules">;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
};

type LessonDraft = {
  title: string;
  youtubeUrl: string;
  content: string;
  durationMinutes: string;
  isFreePreview: boolean;
};

type LessonFormTarget =
  | { mode: "add"; moduleId: Id<"modules"> }
  | { mode: "edit"; moduleId: Id<"modules">; lessonId: Id<"lessons"> };

const emptyLessonDraft = (): LessonDraft => ({
  title: "",
  youtubeUrl: "",
  content: "",
  durationMinutes: "",
  isFreePreview: false,
});

function sortByOrder<T extends { order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order);
}

function LessonFormPanel({
  draft,
  onChange,
  onSave,
  onCancel,
  saveLabel,
  saving,
}: {
  draft: LessonDraft;
  onChange: (draft: LessonDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
  saving?: boolean;
}) {
  return (
    <div className="rounded-lg border border-brand-200 bg-brand-50/40 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Lesson Title</Label>
          <Input
            value={draft.title}
            onChange={(e) => onChange({ ...draft, title: e.target.value })}
            placeholder="e.g. Introduction to the topic"
            className="mt-2 bg-white"
            autoFocus
          />
        </div>
        <div>
          <Label>YouTube URL</Label>
          <Input
            value={draft.youtubeUrl}
            onChange={(e) => onChange({ ...draft, youtubeUrl: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
            className="mt-2 bg-white"
          />
        </div>
        <div>
          <Label>Duration (minutes, optional)</Label>
          <Input
            type="number"
            min={1}
            value={draft.durationMinutes}
            onChange={(e) =>
              onChange({ ...draft, durationMinutes: e.target.value })
            }
            placeholder="10"
            className="mt-2 bg-white"
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={draft.isFreePreview}
              onChange={(e) =>
                onChange({ ...draft, isFreePreview: e.target.checked })
              }
              className="rounded border-border"
            />
            Free preview lesson
          </label>
        </div>
        <div className="sm:col-span-2">
          <Label>Lesson Notes</Label>
          <Textarea
            value={draft.content}
            onChange={(e) => onChange({ ...draft, content: e.target.value })}
            rows={3}
            placeholder="Optional notes or resources for students"
            className="mt-2 bg-white"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : saveLabel}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function CourseCurriculumEditor({
  courseId,
  modules,
}: {
  courseId: Id<"courses">;
  modules: Module[];
}) {
  const createModule = useMutation(api.modules.create);
  const updateModule = useMutation(api.modules.update);
  const removeModule = useMutation(api.modules.remove);
  const createLesson = useMutation(api.lessons.create);
  const updateLesson = useMutation(api.lessons.update);
  const removeLesson = useMutation(api.lessons.remove);

  const sortedModules = useMemo(() => sortByOrder(modules), [modules]);

  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [collapsedModules, setCollapsedModules] = useState<Set<Id<"modules">>>(
    new Set()
  );

  const [editingModuleId, setEditingModuleId] = useState<Id<"modules"> | null>(
    null
  );
  const [moduleEditTitle, setModuleEditTitle] = useState("");
  const [moduleEditDescription, setModuleEditDescription] = useState("");
  const [moduleSaving, setModuleSaving] = useState(false);

  const [lessonFormTarget, setLessonFormTarget] =
    useState<LessonFormTarget | null>(null);
  const [lessonDraft, setLessonDraft] = useState<LessonDraft>(emptyLessonDraft);
  const [lessonSaving, setLessonSaving] = useState(false);

  const [moduleToDelete, setModuleToDelete] = useState<Id<"modules"> | null>(
    null
  );
  const [deleteModuleLoading, setDeleteModuleLoading] = useState(false);

  const [lessonToDelete, setLessonToDelete] = useState<Id<"lessons"> | null>(
    null
  );
  const [deleteLessonLoading, setDeleteLessonLoading] = useState(false);

  function toggleModuleCollapsed(moduleId: Id<"modules">) {
    setCollapsedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  function closeLessonForm() {
    setLessonFormTarget(null);
    setLessonDraft(emptyLessonDraft());
  }

  function isLessonFormOpen(
    moduleId: Id<"modules">,
    lessonId?: Id<"lessons">
  ) {
    if (!lessonFormTarget || lessonFormTarget.moduleId !== moduleId) return false;
    if (lessonFormTarget.mode === "add") return lessonId === undefined;
    return lessonFormTarget.lessonId === lessonId;
  }

  async function handleAddModule() {
    if (!newModuleTitle.trim()) {
      toast.error("Enter a module title first");
      return;
    }
    setAddingModule(true);
    try {
      await createModule({
        courseId,
        title: newModuleTitle.trim(),
        order: sortedModules.length + 1,
      });
      setNewModuleTitle("");
      toast.success("Module added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setAddingModule(false);
    }
  }

  function startEditModule(mod: Module) {
    setEditingModuleId(mod._id);
    setModuleEditTitle(mod.title);
    setModuleEditDescription(mod.description ?? "");
    closeLessonForm();
  }

  function cancelEditModule() {
    setEditingModuleId(null);
    setModuleEditTitle("");
    setModuleEditDescription("");
  }

  async function handleSaveModule() {
    if (!editingModuleId || !moduleEditTitle.trim()) {
      toast.error("Module title is required");
      return;
    }
    setModuleSaving(true);
    try {
      await updateModule({
        moduleId: editingModuleId,
        title: moduleEditTitle.trim(),
        description: moduleEditDescription.trim() || undefined,
      });
      toast.success("Module updated");
      cancelEditModule();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setModuleSaving(false);
    }
  }

  async function handleDeleteModuleConfirm() {
    if (!moduleToDelete) return;
    setDeleteModuleLoading(true);
    try {
      await removeModule({ moduleId: moduleToDelete });
      if (editingModuleId === moduleToDelete) cancelEditModule();
      if (lessonFormTarget?.moduleId === moduleToDelete) closeLessonForm();
      toast.success("Module deleted");
      setModuleToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setDeleteModuleLoading(false);
    }
  }

  function startAddLesson(moduleId: Id<"modules">) {
    setEditingModuleId(null);
    setLessonFormTarget({ mode: "add", moduleId });
    setLessonDraft(emptyLessonDraft());
    setCollapsedModules((prev) => {
      const next = new Set(prev);
      next.delete(moduleId);
      return next;
    });
  }

  function startEditLesson(lesson: Lesson, moduleId: Id<"modules">) {
    setEditingModuleId(null);
    setLessonFormTarget({ mode: "edit", moduleId, lessonId: lesson._id });
    setLessonDraft({
      title: lesson.title,
      youtubeUrl: lesson.youtubeUrl ?? "",
      content: lesson.content ?? "",
      durationMinutes: lesson.durationMinutes?.toString() ?? "",
      isFreePreview: lesson.isFreePreview,
    });
    setCollapsedModules((prev) => {
      const next = new Set(prev);
      next.delete(moduleId);
      return next;
    });
  }

  async function handleSaveLesson() {
    if (!lessonFormTarget || !lessonDraft.title.trim()) {
      toast.error("Lesson title is required");
      return;
    }

    const duration = lessonDraft.durationMinutes.trim()
      ? Number(lessonDraft.durationMinutes)
      : undefined;

    setLessonSaving(true);
    try {
      if (lessonFormTarget.mode === "edit") {
        await updateLesson({
          lessonId: lessonFormTarget.lessonId,
          title: lessonDraft.title,
          youtubeUrl: lessonDraft.youtubeUrl,
          content: lessonDraft.content,
          durationMinutes: duration,
          isFreePreview: lessonDraft.isFreePreview,
        });
        toast.success("Lesson updated");
      } else {
        const mod = sortedModules.find((m) => m._id === lessonFormTarget.moduleId);
        await createLesson({
          moduleId: lessonFormTarget.moduleId,
          title: lessonDraft.title,
          youtubeUrl: lessonDraft.youtubeUrl || undefined,
          content: lessonDraft.content || undefined,
          durationMinutes: duration,
          order: (mod?.lessons.length ?? 0) + 1,
          isFreePreview: lessonDraft.isFreePreview,
        });
        toast.success("Lesson added");
      }
      closeLessonForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setLessonSaving(false);
    }
  }

  async function handleDeleteLessonConfirm() {
    if (!lessonToDelete) return;
    setDeleteLessonLoading(true);
    try {
      await removeLesson({ lessonId: lessonToDelete });
      if (
        lessonFormTarget?.mode === "edit" &&
        lessonFormTarget.lessonId === lessonToDelete
      ) {
        closeLessonForm();
      }
      toast.success("Lesson deleted");
      setLessonToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setDeleteLessonLoading(false);
    }
  }

  const moduleToDeleteData = moduleToDelete
    ? sortedModules.find((m) => m._id === moduleToDelete)
    : null;

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <SectionTitle>Curriculum</SectionTitle>
          <p className="mt-1 text-sm text-slate-500">
            Build your course in modules. Edit or delete anything inline — no
            scrolling required.
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {sortedModules.length} module{sortedModules.length === 1 ? "" : "s"} ·{" "}
          {sortedModules.reduce((sum, mod) => sum + mod.lessons.length, 0)} lesson
          {sortedModules.reduce((sum, mod) => sum + mod.lessons.length, 0) === 1
            ? ""
            : "s"}
        </div>
      </div>

      <Card className="mt-6 border-dashed">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <Input
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            placeholder="New module title, e.g. Getting Started"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleAddModule();
            }}
          />
          <Button
            className="gap-2 shrink-0"
            onClick={() => void handleAddModule()}
            disabled={addingModule}
          >
            <Plus className="h-4 w-4" />
            Add Module
          </Button>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-4">
        {sortedModules.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-14 text-center">
              <BookOpen className="h-10 w-10 text-slate-300" />
              <p className="mt-4 font-medium text-slate-800">No modules yet</p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Add your first module above, then add lessons inside it. You need
                at least one module before submitting for review.
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedModules.map((mod, moduleIndex) => {
            const lessons = sortByOrder(mod.lessons);
            const isCollapsed = collapsedModules.has(mod._id);
            const isEditingModule = editingModuleId === mod._id;

            return (
              <Card key={mod._id} className="overflow-hidden">
                <div className="border-b border-border bg-slate-50/80 px-4 py-3 sm:px-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-2">
                      <button
                        type="button"
                        onClick={() => toggleModuleCollapsed(mod._id)}
                        className="mt-0.5 rounded p-1 text-slate-500 hover:bg-white hover:text-slate-800"
                        aria-label={isCollapsed ? "Expand module" : "Collapse module"}
                      >
                        {isCollapsed ? (
                          <ChevronRight className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Module {moduleIndex + 1}
                        </p>
                        {isEditingModule ? (
                          <div className="mt-2 space-y-3">
                            <Input
                              value={moduleEditTitle}
                              onChange={(e) => setModuleEditTitle(e.target.value)}
                              className="max-w-md bg-white"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") void handleSaveModule();
                                if (e.key === "Escape") cancelEditModule();
                              }}
                            />
                            <Textarea
                              value={moduleEditDescription}
                              onChange={(e) =>
                                setModuleEditDescription(e.target.value)
                              }
                              rows={2}
                              placeholder="Optional module description"
                              className="max-w-md bg-white"
                            />
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                onClick={() => void handleSaveModule()}
                                disabled={moduleSaving}
                              >
                                {moduleSaving ? "Saving..." : "Save"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditModule}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <h3 className="mt-1 truncate text-base font-semibold text-slate-900">
                            {mod.title}
                          </h3>
                        )}
                        {!isCollapsed && !isEditingModule && (
                          <p className="mt-1 text-sm text-slate-500">
                            {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
                          </p>
                        )}
                      </div>
                    </div>

                    {!isEditingModule && (
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => startAddLesson(mod._id)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Lesson
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditModule(mod)}
                          aria-label="Edit module"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setModuleToDelete(mod._id)}
                          aria-label="Delete module"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {!isCollapsed && (
                  <CardContent className="space-y-3 p-4 sm:p-5">
                    {lessons.length === 0 &&
                      !isLessonFormOpen(mod._id) && (
                        <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-slate-500">
                          No lessons in this module yet. Click{" "}
                          <span className="font-medium text-slate-700">
                            Add Lesson
                          </span>{" "}
                          to create one.
                        </p>
                      )}

                    {lessons.map((lesson, lessonIndex) => (
                      <div key={lesson._id} className="space-y-3">
                        <div
                          className={cn(
                            "flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2.5 sm:px-4",
                            isLessonFormOpen(mod._id, lesson._id)
                              ? "border-brand-300 bg-brand-50/30"
                              : "border-border bg-white"
                          )}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                              {lessonIndex + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <Video className="h-4 w-4 shrink-0 text-brand-600" />
                                <span className="truncate font-medium text-slate-900">
                                  {lesson.title}
                                </span>
                                {lesson.isFreePreview && (
                                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                    Preview
                                  </span>
                                )}
                              </div>
                              {lesson.youtubeUrl && (
                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                  Video linked
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant={
                                isLessonFormOpen(mod._id, lesson._id)
                                  ? "secondary"
                                  : "ghost"
                              }
                              size="sm"
                              onClick={() =>
                                isLessonFormOpen(mod._id, lesson._id)
                                  ? closeLessonForm()
                                  : startEditLesson(lesson, mod._id)
                              }
                            >
                              {isLessonFormOpen(mod._id, lesson._id)
                                ? "Close"
                                : "Edit"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLessonToDelete(lesson._id)}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>

                        {isLessonFormOpen(mod._id, lesson._id) && (
                          <LessonFormPanel
                            draft={lessonDraft}
                            onChange={setLessonDraft}
                            onSave={() => void handleSaveLesson()}
                            onCancel={closeLessonForm}
                            saveLabel="Save Lesson"
                            saving={lessonSaving}
                          />
                        )}
                      </div>
                    ))}

                    {isLessonFormOpen(mod._id) && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-800">
                          New lesson
                        </p>
                        <LessonFormPanel
                          draft={lessonDraft}
                          onChange={setLessonDraft}
                          onSave={() => void handleSaveLesson()}
                          onCancel={closeLessonForm}
                          saveLabel="Add Lesson"
                          saving={lessonSaving}
                        />
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={moduleToDelete !== null}
        onOpenChange={(open) => !open && setModuleToDelete(null)}
        title="Delete module?"
        description={
          moduleToDeleteData
            ? `"${moduleToDeleteData.title}" and all ${moduleToDeleteData.lessons.length} lesson(s) and exams inside it will be permanently removed.`
            : "This module and all its content will be permanently removed."
        }
        confirmLabel="Delete Module"
        variant="destructive"
        loading={deleteModuleLoading}
        onConfirm={() => void handleDeleteModuleConfirm()}
      />

      <ConfirmDialog
        open={lessonToDelete !== null}
        onOpenChange={(open) => !open && setLessonToDelete(null)}
        title="Delete lesson?"
        description="This lesson will be permanently removed from the course."
        confirmLabel="Delete Lesson"
        variant="destructive"
        loading={deleteLessonLoading}
        onConfirm={() => void handleDeleteLessonConfirm()}
      />
    </section>
  );
}
