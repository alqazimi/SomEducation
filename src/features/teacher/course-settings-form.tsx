"use client";

import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { SectionTitle } from "@/components/ui/typography";

type Category = {
  _id: Id<"categories">;
  name: string;
};

type CourseDifficulty = "beginner" | "intermediate" | "advanced";

type CourseSettingsFormProps = {
  courseId: Id<"courses">;
  categories: Category[] | undefined;
  title: string;
  description: string;
  price: string;
  categoryId: string;
  difficulty: CourseDifficulty;
  thumbnailPreview: string | null;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onCategoryIdChange: (value: string) => void;
  onDifficultyChange: (value: CourseDifficulty) => void;
  onThumbnailPreviewChange: (value: string | null) => void;
};

export function CourseSettingsForm({
  courseId,
  categories,
  title,
  description,
  price,
  categoryId,
  difficulty,
  thumbnailPreview,
  onTitleChange,
  onDescriptionChange,
  onPriceChange,
  onCategoryIdChange,
  onDifficultyChange,
  onThumbnailPreviewChange,
}: CourseSettingsFormProps) {
  const updateCourse = useMutation(api.courses.update);

  async function handleThumbnailUploaded(
    storageId: Id<"_storage">,
    previewUrl: string
  ) {
    onThumbnailPreviewChange(previewUrl);
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
        difficulty,
      });
      toast.success("Course details updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  return (
    <section>
      <SectionTitle>Course settings</SectionTitle>
      <p className="mt-1 text-sm text-slate-500">
        Update how your course appears in the catalog and on the public page.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="mt-2"
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={4}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Category</Label>
          <select
            className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm"
            value={categoryId}
            onChange={(e) => onCategoryIdChange(e.target.value)}
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
          <Label>Difficulty</Label>
          <select
            className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm"
            value={difficulty}
            onChange={(e) =>
              onDifficultyChange(e.target.value as CourseDifficulty)
            }
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <Label>Price (USD)</Label>
          <Input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            className="mt-2"
          />
        </div>
        <div className="sm:col-span-2">
          <ImageUploadField
            previewUrl={thumbnailPreview}
            onUploaded={handleThumbnailUploaded}
            onClear={() => onThumbnailPreviewChange(null)}
            showUploadSuccessToast={false}
          />
        </div>
      </div>
      <Button variant="outline" className="mt-6" onClick={handleSaveDetails}>
        Save Settings
      </Button>
    </section>
  );
}
