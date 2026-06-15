"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  GraduationCap,
  Pencil,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn, formatPrice } from "@/lib/utils";
import { formatEnrollmentCount } from "@/lib/enrollment";

type StatusFilter = "all" | "draft" | "pending" | "published" | "rejected";

type DialogState =
  | { type: "private"; courseId: Id<"courses">; title: string }
  | { type: "reject"; courseId: Id<"courses"> }
  | { type: "delete"; courseId: Id<"courses">; title: string }
  | null;

const statusConfig = {
  draft: { label: "Private", variant: "secondary" as const, icon: EyeOff },
  pending: { label: "Pending Review", variant: "warning" as const, icon: Clock },
  published: { label: "Published", variant: "success" as const, icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "destructive" as const, icon: XCircle },
};

export function AdminCourses() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const courses = useQuery(api.courses.listForAdmin, {
    status: filter === "all" ? undefined : filter,
  });
  const approve = useMutation(api.courses.approveCourse);
  const reject = useMutation(api.courses.rejectCourse);
  const unpublish = useMutation(api.courses.unpublish);
  const removeCourse = useMutation(api.courses.remove);

  const filters: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "draft", label: "Private" },
    { id: "pending", label: "Pending" },
    { id: "published", label: "Published" },
    { id: "rejected", label: "Rejected" },
  ];

  async function handlePublish(courseId: Id<"courses">) {
    try {
      await approve({ courseId });
      toast.success("Course published");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish");
    }
  }

  async function handleDialogConfirm(inputValue?: string) {
    if (!dialog) return;
    setActionLoading(true);
    try {
      if (dialog.type === "private") {
        await unpublish({ courseId: dialog.courseId });
        toast.success("Course is now private");
      } else if (dialog.type === "reject") {
        await reject({
          courseId: dialog.courseId,
          reason: inputValue || "Course does not meet quality standards",
        });
        toast.success("Course rejected");
      } else if (dialog.type === "delete") {
        await removeCourse({ courseId: dialog.courseId });
        toast.success("Course deleted");
      }
      setDialog(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Administration"
        title="Course management"
        description="Publish, review, edit, or remove courses across the platform."
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              filter === item.id
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 ring-1 ring-border hover:bg-slate-50"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {courses === undefined ? (
          <p className="text-sm text-slate-500">Loading courses...</p>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16 text-center">
              <BookOpen className="h-10 w-10 text-slate-300" />
              <p className="mt-4 font-medium text-slate-700">No courses found</p>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                Courses appear here after a teacher creates them.
              </p>
            </CardContent>
          </Card>
        ) : (
          courses.map((course) => {
            const config = statusConfig[course.status];
            const StatusIcon = config.icon;
            const canPublish =
              course.status === "draft" ||
              course.status === "pending" ||
              course.status === "rejected";

            return (
              <Card key={course._id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
                    <div className="h-24 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-20 sm:w-32">
                      {course.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <BookOpen className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {course.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {course.category ? `${course.category.name} · ` : ""}
                            {formatPrice(course.price, course.currency)}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                            <span className="inline-flex items-center gap-1.5">
                              <GraduationCap className="h-4 w-4 text-slate-400" />
                              <span>
                                Instructor:{" "}
                                <span className="font-medium text-slate-800">
                                  {course.teacher
                                    ? `${course.teacher.firstName ?? ""} ${course.teacher.lastName ?? ""}`.trim() ||
                                      course.teacher.email
                                    : "Unknown"}
                                </span>
                              </span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Users className="h-4 w-4 text-slate-400" />
                              <span>{formatEnrollmentCount(course.enrollmentCount)}</span>
                            </span>
                          </div>
                        </div>
                        <Badge variant={config.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                        {course.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span>{formatPrice(course.price, course.currency)}</span>
                        <span>{course.moduleCount} modules</span>
                        <span>{course.lessonCount} lessons</span>
                        <span>
                          {course.enrollmentCount}{" "}
                          {course.enrollmentCount === 1 ? "student" : "students"}
                        </span>
                        <span className="capitalize">{course.difficulty}</span>
                      </div>

                      {course.status === "rejected" && course.rejectionReason && (
                        <p className="mt-3 text-sm text-red-600">
                          Rejected: {course.rejectionReason}
                        </p>
                      )}

                      {canPublish && course.moduleCount === 0 && (
                        <p className="mt-3 text-sm text-amber-700">
                          Add at least one module before publishing.
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link
                            href={`/dashboard/teacher/courses/${course._id}`}
                            className="gap-1.5"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit Course
                          </Link>
                        </Button>

                        {course.status === "published" && (
                          <Button asChild size="sm" variant="outline">
                            <Link
                              href={`/courses/${course.slug}`}
                              target="_blank"
                              className="gap-1.5"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Live
                            </Link>
                          </Button>
                        )}

                        {canPublish && (
                          <Button
                            size="sm"
                            disabled={course.moduleCount === 0}
                            onClick={() => void handlePublish(course._id)}
                          >
                            Publish
                          </Button>
                        )}

                        {course.status === "published" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setDialog({
                                type: "private",
                                courseId: course._id,
                                title: course.title,
                              })
                            }
                            className="gap-1.5"
                          >
                            <EyeOff className="h-3.5 w-3.5" />
                            Make Private
                          </Button>
                        )}

                        {(course.status === "pending" ||
                          course.status === "draft") &&
                          course.moduleCount > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setDialog({
                                  type: "reject",
                                  courseId: course._id,
                                })
                              }
                            >
                              Reject
                            </Button>
                          )}

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() =>
                            setDialog({
                              type: "delete",
                              courseId: course._id,
                              title: course.title,
                            })
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={dialog?.type === "private"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Make course private?"
        description={
          dialog?.type === "private"
            ? `"${dialog.title}" will be hidden from the public course catalog. Enrolled students may still have access.`
            : ""
        }
        confirmLabel="Make Private"
        variant="default"
        loading={actionLoading}
        onConfirm={() => void handleDialogConfirm()}
      />

      <ConfirmDialog
        open={dialog?.type === "reject"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Reject course"
        description="Tell the instructor why this course was rejected. They will receive a notification."
        confirmLabel="Reject Course"
        variant="destructive"
        loading={actionLoading}
        inputMode="textarea"
        inputLabel="Reason"
        inputPlaceholder="Course does not meet quality standards"
        defaultInputValue="Course does not meet quality standards"
        requiredInput
        onConfirm={(value) => void handleDialogConfirm(value)}
      />

      <ConfirmDialog
        open={dialog?.type === "delete"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Delete course permanently?"
        description={
          dialog?.type === "delete"
            ? `"${dialog.title}" and all modules, lessons, and exams will be permanently removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete Course"
        variant="destructive"
        loading={actionLoading}
        onConfirm={() => void handleDialogConfirm()}
      />
    </div>
  );
}
