"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { courseFormSchema, type CourseFormValues } from "@/schemas";
import { useState } from "react";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { CoursePricingFields } from "@/components/courses/course-pricing-fields";
import {
  LearningOutcomesEditor,
  normalizeLearningOutcomes,
} from "@/components/courses/learning-outcomes-editor";

export function CreateCourseForm() {
  const router = useRouter();
  const categories = useQuery(api.categories.list, { activeOnly: true });
  const createCourse = useMutation(api.courses.create);
  const createModule = useMutation(api.modules.create);
  const createLesson = useMutation(api.lessons.create);

  const [moduleTitle, setModuleTitle] = useState("Introduction");
  const [lessonTitle, setLessonTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [thumbnailStorageId, setThumbnailStorageId] =
    useState<Id<"_storage"> | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema) as Resolver<CourseFormValues>,
    defaultValues: {
      difficulty: "beginner",
      price: 0,
      compareAtPrice: undefined,
    },
  });
  const [regularPrice, setRegularPrice] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState(["", "", ""]);
  const salePrice = useWatch({ control: form.control, name: "price" });

  async function onSubmit(data: CourseFormValues) {
    if (!moduleTitle.trim()) {
      toast.error("Module title is required");
      return;
    }

    try {
      const courseId = await createCourse({
        title: data.title,
        description: data.description,
        categoryId: data.categoryId as Id<"categories">,
        difficulty: data.difficulty,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        learningOutcomes: normalizeLearningOutcomes(learningOutcomes),
        thumbnailStorageId: thumbnailStorageId ?? undefined,
      });

      const moduleId = await createModule({
        courseId,
        title: moduleTitle.trim(),
        order: 1,
      });

      if (lessonTitle.trim()) {
        await createLesson({
          moduleId,
          title: lessonTitle.trim(),
          youtubeUrl: youtubeUrl.trim() || undefined,
          order: 1,
        });
      }

      toast.success("Course created successfully");
      router.push(`/dashboard/teacher/courses/${courseId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <DashboardPageHeader
        eyebrow="Instructor"
        title="Create new course"
        description="Set up course details and your first module."
      />

      <form className="mt-8 space-y-10" onSubmit={form.handleSubmit(onSubmit)}>
        <section>
          <h2 className="text-base font-semibold text-slate-900">
            Course Information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Basic details shown on the public course page.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="e.g. Complete Web Development Bootcamp"
                className="mt-2"
              />
              {form.formState.errors.title && (
                <p className="mt-1.5 text-sm text-red-600">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                rows={5}
                placeholder="Describe what students will learn, prerequisites, and outcomes."
                className="mt-2"
              />
              {form.formState.errors.description && (
                <p className="mt-1.5 text-sm text-red-600">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Select
                  onValueChange={(v) => form.setValue("categoryId", v)}
                  disabled={!categories?.length}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoryId && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {form.formState.errors.categoryId.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Difficulty Level</Label>
                <Select
                  defaultValue="beginner"
                  onValueChange={(v) =>
                    form.setValue(
                      "difficulty",
                      v as CourseFormValues["difficulty"]
                    )
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <CoursePricingFields
              regularPrice={regularPrice}
              salePrice={String(salePrice ?? "")}
              onRegularPriceChange={(value) => {
                setRegularPrice(value);
                form.setValue(
                  "compareAtPrice",
                  value.trim() === "" ? undefined : Number(value),
                  { shouldValidate: true }
                );
              }}
              onSalePriceChange={(value) => {
                form.setValue("price", value === "" ? 0 : Number(value), {
                  shouldValidate: true,
                });
              }}
              regularPriceError={
                form.formState.errors.compareAtPrice?.message
              }
              salePriceError={form.formState.errors.price?.message}
            />

            <LearningOutcomesEditor
              outcomes={learningOutcomes}
              onChange={setLearningOutcomes}
            />

            <ImageUploadField
              onUploaded={(storageId) => setThumbnailStorageId(storageId)}
              onClear={() => setThumbnailStorageId(null)}
              onUploadingChange={setThumbnailUploading}
            />
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="text-base font-semibold text-slate-900">Curriculum</h2>
          <p className="mt-1 text-sm text-slate-500">
            Start with one module and optional first lesson. After creating the
            course, use the course builder to add, edit, or delete modules and
            lessons inline.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <Label htmlFor="moduleTitle">Module Title</Label>
              <Input
                id="moduleTitle"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="Introduction & Setup"
                className="mt-2"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="lessonTitle">First Lesson Title</Label>
                <Input
                  id="lessonTitle"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Welcome & Overview"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="youtubeUrl">YouTube Video URL</Label>
                <Input
                  id="youtubeUrl"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/teacher/courses")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={thumbnailUploading}>
            {thumbnailUploading ? "Uploading image..." : "Create Course"}
          </Button>
        </div>
      </form>
    </div>
  );
}
