"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Pencil, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { categoryFormSchema, type CategoryFormValues } from "@/schemas";
import { Skeleton } from "@/components/ui/skeleton";

function CategoryForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  defaultValues?: CategoryFormValues;
  submitLabel: string;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: defaultValues ?? { name: "", description: "" },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => onSubmit(values))}
    >
      <div>
        <Label htmlFor="category-name">Name</Label>
        <Input
          id="category-name"
          {...form.register("name")}
          className="mt-1"
          placeholder="e.g. Web Development"
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="category-description">Description (optional)</Label>
        <Textarea
          id="category-description"
          {...form.register("description")}
          className="mt-1"
          rows={2}
          placeholder="Short description for teachers and students"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export function AdminCategories() {
  const categories = useQuery(api.categories.listForAdmin);
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const seedCategories = useMutation(api.seed.seedCategories);

  const [editingId, setEditingId] = useState<Id<"categories"> | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  async function handleCreate(values: CategoryFormValues) {
    try {
      await createCategory({
        name: values.name,
        description: values.description || undefined,
      });
      toast.success("Category created");
      setShowCreateForm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create");
    }
  }

  async function handleUpdate(
    categoryId: Id<"categories">,
    values: CategoryFormValues
  ) {
    try {
      await updateCategory({
        categoryId,
        name: values.name,
        description: values.description || undefined,
      });
      toast.success("Category updated");
      setEditingId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
    }
  }

  async function handleToggleActive(
    categoryId: Id<"categories">,
    isActive: boolean
  ) {
    try {
      await updateCategory({ categoryId, isActive: !isActive });
      toast.success(isActive ? "Category hidden" : "Category activated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
    }
  }

  async function handleSeedDefaults() {
    try {
      await seedCategories({});
      toast.success("Starter categories added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to seed");
    }
  }

  const editingCategory = categories?.find((cat) => cat._id === editingId);

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Administration"
        title="Course categories"
        description="Create and manage categories teachers pick when publishing courses."
      />

      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => setShowCreateForm((open) => !open)}>
          <Plus className="mr-2 h-4 w-4" />
          {showCreateForm ? "Close form" : "Add category"}
        </Button>
        <Button variant="outline" onClick={() => void handleSeedDefaults()}>
          <Sparkles className="mr-2 h-4 w-4" />
          Add starter categories
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>New category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryForm
              key="create-category"
              submitLabel="Create category"
              onSubmit={handleCreate}
              onCancel={() => setShowCreateForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>
            All categories ({categories?.length ?? "…"})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!categories ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-12 text-center">
              <p className="text-sm text-slate-600">No categories yet.</p>
              <p className="mt-1 text-sm text-slate-500">
                Add your first category or load the starter list above.
              </p>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category._id}
                className="rounded-xl border border-border bg-white p-4"
              >
                {editingId === category._id && editingCategory ? (
                  <CategoryForm
                    key={category._id}
                    defaultValues={{
                      name: editingCategory.name,
                      description: editingCategory.description ?? "",
                    }}
                    submitLabel="Save changes"
                    onSubmit={(values) => handleUpdate(category._id, values)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-stone-900">
                          {category.name}
                        </h3>
                        <Badge
                          variant={category.isActive ? "success" : "secondary"}
                        >
                          {category.isActive ? "Active" : "Hidden"}
                        </Badge>
                      </div>
                      {category.description && (
                        <p className="mt-1 text-sm text-slate-600">
                          {category.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-slate-500">
                        {category.courseCount} course
                        {category.courseCount === 1 ? "" : "s"} ·{" "}
                        {category.publishedCourseCount} published · slug:{" "}
                        {category.slug}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(category._id)}
                      >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void handleToggleActive(
                            category._id,
                            category.isActive
                          )
                        }
                      >
                        {category.isActive ? "Hide" : "Activate"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
