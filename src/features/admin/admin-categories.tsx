"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import {
  isAdminListDenied,
  isAdminListLoading,
  isAdminListReady,
} from "@/lib/admin-query-state";

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
          placeholder="e.g. Programming, Business, Design"
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
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const categories = useQuery(
    api.categories.listForAdmin,
    isAuthenticated ? {} : "skip"
  );
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const removeCategory = useMutation(api.categories.remove);

  const [editingId, setEditingId] = useState<Id<"categories"> | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const isLoading = isAdminListLoading(authLoading, isAuthenticated, categories);

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

  async function handleDelete(categoryId: Id<"categories">) {
    try {
      await removeCategory({ categoryId });
      toast.success("Category deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    }
  }

  const editingCategory = categories?.find((cat) => cat._id === editingId);

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Administration"
        title="Course categories"
        description="Create and manage your own categories. Nothing is hardcoded."
      />

      <div className="mt-8">
        <Button onClick={() => setShowCreateForm((open) => !open)}>
          <Plus className="mr-2 h-4 w-4" />
          {showCreateForm ? "Close form" : "Add category"}
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
            All categories ({categories?.length ?? (isLoading ? "…" : 0)})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : isAdminListDenied(categories) ? (
            <p className="text-sm text-slate-500">
              Could not load categories. Check your admin access and Convex
              connection.
            </p>
          ) : isAdminListReady(categories) && categories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-12 text-center">
              <p className="text-sm text-slate-600">No categories yet.</p>
              <p className="mt-1 text-sm text-slate-500">
                Click Add category above to create your first one.
              </p>
            </div>
          ) : isAdminListReady(categories) ? (
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
                      {category.courseCount === 0 && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => void handleDelete(category._id)}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
