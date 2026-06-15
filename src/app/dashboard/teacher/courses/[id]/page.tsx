"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ExamManager } from "@/features/teacher/exam-manager";
import { PageTitle, SectionTitle } from "@/components/ui/typography";
import { formatEnrollmentCount } from "@/lib/enrollment";
import { type } from "@/lib/typography";

type LessonDraft = {
  title: string;
  youtubeUrl: string;
  content: string;
  durationMinutes: string;
  isFreePreview: boolean;
};

const emptyLessonDraft = (): LessonDraft => ({
  title: "",
  youtubeUrl: "",
  content: "",
  durationMinutes: "",
  isFreePreview: false,
});

export default function EditCoursePage() {
  const params = useParams<{ id: string }>();
  const courseId = params.id as Id<"courses">;

  const course = useQuery(api.courses.getMyCourseById, { courseId });
  const categories = useQuery(api.categories.list, { activeOnly: true });
  const modules = useQuery(
    api.modules.listByCourse,
    course ? { courseId } : "skip"
  );
  const submitForReview = useMutation(api.courses.submitForReview);
  const updateCourse = useMutation(api.courses.update);
  const createModule = useMutation(api.modules.create);
  const createLesson = useMutation(api.lessons.create);
  const updateLesson = useMutation(api.lessons.update);
  const removeLesson = useMutation(api.lessons.remove);

  const [moduleTitle, setModuleTitle] = useState("");
  const [selectedModule, setSelectedModule] = useState<Id<"modules"> | null>(
    null
  );
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [editingLessonId, setEditingLessonId] = useState<Id<"lessons"> | null>(
    null
  );
  const [lessonDraft, setLessonDraft] = useState<LessonDraft>(emptyLessonDraft);
  const [lessonToDelete, setLessonToDelete] = useState<Id<"lessons"> | null>(
    null
  );
  const [deleteLessonLoading, setDeleteLessonLoading] = useState(false);
  const [loadedCourseId, setLoadedCourseId] = useState<Id<"courses"> | null>(null);

  if (course && course._id !== loadedCourseId) {
    setLoadedCourseId(course._id);
    setTitle(course.title);
    setDescription(course.description);
    setPrice(String(course.price));
    setCategoryId(course.categoryId);
    setThumbnailPreview(course.thumbnailUrl ?? null);
  }

  async function handleThumbnailUploaded(
    storageId: Id<"_storage">,
    previewUrl: string
  ) {
    setThumbnailPreview(previewUrl);
    try {
      await updateCourse({ courseId, thumbnailStorageId: storageId });
      toast.success("Cover image saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save image");
    }
  }

  async function handleSaveDetails() {
    if (!title.trim() || description.trim().length < 10) {
      toast.error("Title and description (10+ chars) are required");
      return;
    }
    try {
      await updateCourse({
        courseId,
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        categoryId: categoryId as Id<"categories">,
      });
      toast.success("Course details updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  async function handleAddModule() {
    if (!moduleTitle.trim()) {
      toast.error("Enter a module title first");
      return;
    }
    try {
      await createModule({
        courseId,
        title: moduleTitle,
        order: (modules?.length ?? 0) + 1,
      });
      setModuleTitle("");
      toast.success("Module added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  function startEditLesson(
    lesson: {
      _id: Id<"lessons">;
      title: string;
      youtubeUrl?: string;
      content?: string;
      durationMinutes?: number;
      isFreePreview: boolean;
    },
    moduleId: Id<"modules">
  ) {
    setEditingLessonId(lesson._id);
    setSelectedModule(moduleId);
    setLessonDraft({
      title: lesson.title,
      youtubeUrl: lesson.youtubeUrl ?? "",
      content: lesson.content ?? "",
      durationMinutes: lesson.durationMinutes?.toString() ?? "",
      isFreePreview: lesson.isFreePreview,
    });
  }

  function resetLessonForm() {
    setEditingLessonId(null);
    setLessonDraft(emptyLessonDraft());
  }

  async function handleSaveLesson() {
    if (!selectedModule || !lessonDraft.title.trim()) {
      toast.error("Module and lesson title are required");
      return;
    }

    const duration = lessonDraft.durationMinutes.trim()
      ? Number(lessonDraft.durationMinutes)
      : undefined;

    try {
      if (editingLessonId) {
        await updateLesson({
          lessonId: editingLessonId,
          title: lessonDraft.title,
          youtubeUrl: lessonDraft.youtubeUrl,
          content: lessonDraft.content,
          durationMinutes: duration,
          isFreePreview: lessonDraft.isFreePreview,
        });
        toast.success("Lesson updated");
      } else {
        const mod = modules?.find((m) => m._id === selectedModule);
        await createLesson({
          moduleId: selectedModule,
          title: lessonDraft.title,
          youtubeUrl: lessonDraft.youtubeUrl || undefined,
          content: lessonDraft.content || undefined,
          durationMinutes: duration,
          order: (mod?.lessons.length ?? 0) + 1,
          isFreePreview: lessonDraft.isFreePreview,
        });
        toast.success("Lesson added");
      }
      resetLessonForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  async function handleDeleteLessonConfirm() {
    if (!lessonToDelete) return;
    setDeleteLessonLoading(true);
    try {
      await removeLesson({ lessonId: lessonToDelete });
      if (editingLessonId === lessonToDelete) resetLessonForm();
      toast.success("Lesson deleted");
      setLessonToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setDeleteLessonLoading(false);
    }
  }

  if (course === undefined || modules === undefined) {
    return <p>Loading...</p>;
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Access Denied</h1>
        <p className="mt-2 text-sm text-slate-600">
          You can only manage courses that belong to you.
        </p>
        <Link href="/dashboard/teacher/courses" className="mt-6 inline-block">
          <Button variant="outline">Back to My Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link
            href="/dashboard/teacher/courses"
            className={`${type.muted} hover:text-stone-800`}
          >
            ← Back to courses
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <PageTitle>{course.title}</PageTitle>
            <Badge variant="secondary" className="capitalize">
              {course.status}
            </Badge>
          </div>
          <p className={`mt-2 ${type.muted}`}>
            Manage curriculum, settings, and publishing ·{" "}
            {formatEnrollmentCount(course.enrollmentCount)}
          </p>
        </div>
        {(course.status === "draft" || course.status === "rejected") && (
          <Button
            onClick={() =>
              submitForReview({ courseId })
                .then(() => toast.success("Submitted for admin review"))
                .catch((error) =>
                  toast.error(
                    error instanceof Error ? error.message : "Submit failed"
                  )
                )
            }
          >
            Submit for Review
          </Button>
        )}
      </div>

      <section className="mt-10">
        <SectionTitle>Curriculum</SectionTitle>
        <p className="mt-1 text-sm text-slate-500">
          Organize your course into modules and video lessons.
        </p>

        <div className="mt-6 flex gap-2">
          <Input
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            placeholder="New module title"
            className="max-w-md"
          />
          <Button variant="outline" onClick={handleAddModule}>
            Add Module
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          {modules.length === 0 ? (
            <p className="rounded-lg border border-border bg-slate-50 px-4 py-6 text-sm text-slate-600">
              No modules yet. Add at least one module before submitting for review.
            </p>
          ) : (
            modules.map((mod) => (
              <div
                key={mod._id}
                className="rounded-lg border border-border bg-white p-5"
              >
                <h3 className="font-medium text-slate-900">{mod.title}</h3>
                <ul className="mt-4 space-y-2">
                  {mod.lessons.length === 0 ? (
                    <li className="text-sm text-slate-500">No lessons yet</li>
                  ) : (
                    mod.lessons.map((lesson) => (
                      <li
                        key={lesson._id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-slate-800">
                          {lesson.title}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditLesson(lesson, mod._id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLessonToDelete(lesson._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 rounded-lg border border-border bg-white p-5">
          <h3 className="font-medium text-slate-900">
            {editingLessonId ? "Edit Lesson" : "Add Lesson"}
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Module</Label>
              <select
                className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm"
                value={selectedModule ?? ""}
                onChange={(e) =>
                  setSelectedModule(e.target.value as Id<"modules">)
                }
              >
                <option value="">Select module</option>
                {modules.map((mod) => (
                  <option key={mod._id} value={mod._id}>
                    {mod.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Lesson Title</Label>
              <Input
                value={lessonDraft.title}
                onChange={(e) =>
                  setLessonDraft((d) => ({ ...d, title: e.target.value }))
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label>YouTube URL</Label>
              <Input
                value={lessonDraft.youtubeUrl}
                onChange={(e) =>
                  setLessonDraft((d) => ({ ...d, youtubeUrl: e.target.value }))
                }
                placeholder="https://www.youtube.com/watch?v=..."
                className="mt-2"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Lesson Notes</Label>
              <Textarea
                value={lessonDraft.content}
                onChange={(e) =>
                  setLessonDraft((d) => ({ ...d, content: e.target.value }))
                }
                rows={3}
                className="mt-2"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleSaveLesson}>
              {editingLessonId ? "Save Lesson" : "Add Lesson"}
            </Button>
            {editingLessonId && (
              <Button variant="outline" onClick={resetLessonForm}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </section>

      <Separator className="my-10" />

      <section>
        <SectionTitle>Module Exams</SectionTitle>
        <p className="mt-1 text-sm text-slate-500">
          Create practice quizzes and graded exams for each module, like Coursera.
        </p>
        <div className="mt-6">
          <ExamManager courseId={courseId} modules={modules} />
        </div>
      </section>

      <Separator className="my-10" />

      <section>
        <SectionTitle>Course settings</SectionTitle>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Category</Label>
            <select
              className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select category</option>
              {categories?.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Price (USD)</Label>
            <Input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-2"
            />
          </div>
          <div className="sm:col-span-2">
            <ImageUploadField
              previewUrl={thumbnailPreview}
              onUploaded={handleThumbnailUploaded}
              onClear={() => setThumbnailPreview(null)}
              showUploadSuccessToast={false}
            />
          </div>
        </div>
        <Button variant="outline" className="mt-6" onClick={handleSaveDetails}>
          Save Settings
        </Button>
      </section>

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
    </div>
  );
}
