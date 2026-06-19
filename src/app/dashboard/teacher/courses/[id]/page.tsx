"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import {
  BookOpen,
  ClipboardCheck,
  Rocket,
  Settings2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseCurriculumEditor } from "@/features/teacher/course-curriculum-editor";
import { CourseSettingsForm } from "@/features/teacher/course-settings-form";
import { ExamManager } from "@/features/teacher/exam-manager";
import { PageTitle } from "@/components/ui/typography";
import { formatEnrollmentCount } from "@/lib/enrollment";
import { type } from "@/lib/typography";
import { cn } from "@/lib/utils";

const statusVariant: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  draft: "secondary",
  pending: "warning",
  published: "success",
  rejected: "destructive",
};

const statusLabel: Record<string, string> = {
  draft: "Draft",
  pending: "In Review",
  published: "Published",
  rejected: "Rejected",
};

export default function EditCoursePage() {
  const params = useParams<{ id: string }>();
  const courseId = params.id as Id<"courses">;

  const me = useQuery(api.users.getMe);
  const course = useQuery(api.courses.getMyCourseById, { courseId });
  const categories = useQuery(api.categories.list, { activeOnly: true });
  const modules = useQuery(
    api.modules.listByCourse,
    course ? { courseId } : "skip"
  );
  const submitForReview = useMutation(api.courses.submitForReview);

  const [activeTab, setActiveTab] = useState("curriculum");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!course) return;
    setTitle(course.title);
    setDescription(course.description);
    setPrice(String(course.price));
    setCategoryId(course.categoryId);
    setDifficulty(course.difficulty);
    setThumbnailPreview(course.thumbnailUrl ?? null);
  }, [course?._id]);

  const isManagingAsStaff =
    me &&
    course &&
    me._id !== course.teacherId &&
    (me.role === "admin" || me.role === "owner");

  const canSubmitForReview =
    course?.status === "draft" || course?.status === "rejected";
  const hasModules = (modules?.length ?? 0) > 0;

  if (course === undefined || modules === undefined) {
    return (
      <div className="mx-auto max-w-5xl py-12">
        <p className={type.muted}>Loading course builder...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Access Denied</h1>
        <p className="mt-2 text-sm text-slate-600">
          You can only manage courses that belong to you, or courses you have
          admin access to.
        </p>
        <Link href="/dashboard/teacher/courses" className="mt-6 inline-block">
          <Button variant="outline">Back to My Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div className="min-w-0 flex-1">
          <Link
            href="/dashboard/teacher/courses"
            className={`${type.muted} hover:text-stone-800`}
          >
            ← Back to courses
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <PageTitle className="truncate">{course.title}</PageTitle>
            <Badge
              variant={statusVariant[course.status] ?? "secondary"}
              className="capitalize"
            >
              {statusLabel[course.status] ?? course.status}
            </Badge>
            {isManagingAsStaff && (
              <Badge variant="outline" className="capitalize">
                Managing as {me.role}
              </Badge>
            )}
          </div>
          <p className={`mt-2 ${type.muted}`}>
            Course builder · {formatEnrollmentCount(course.enrollmentCount)}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="h-auto w-full flex-wrap sm:flex-nowrap">
          <TabsTrigger value="curriculum" className="gap-1.5">
            <BookOpen className="h-4 w-4" />
            Curriculum
          </TabsTrigger>
          <TabsTrigger value="exams" className="gap-1.5">
            <ClipboardCheck className="h-4 w-4" />
            Exams
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Settings2 className="h-4 w-4" />
            Settings
          </TabsTrigger>
          {canSubmitForReview && (
            <TabsTrigger value="publish" className="gap-1.5">
              <Rocket className="h-4 w-4" />
              Publish
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="curriculum">
          <CourseCurriculumEditor courseId={courseId} modules={modules} />
        </TabsContent>

        <TabsContent value="exams">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Module exams</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add practice quizzes and graded exams at the end of each module.
            </p>
            <div className="mt-6">
              {modules.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-sm text-slate-500">
                    Add at least one module in the Curriculum tab before creating
                    exams.
                  </CardContent>
                </Card>
              ) : (
                <ExamManager courseId={courseId} modules={modules} />
              )}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="settings">
          <CourseSettingsForm
            courseId={courseId}
            categories={categories}
            title={title}
            description={description}
            price={price}
            categoryId={categoryId}
            difficulty={difficulty}
            thumbnailPreview={thumbnailPreview}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onPriceChange={setPrice}
            onCategoryIdChange={setCategoryId}
            onDifficultyChange={setDifficulty}
            onThumbnailPreviewChange={setThumbnailPreview}
          />
        </TabsContent>

        {canSubmitForReview && (
          <TabsContent value="publish">
            <Card>
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50">
                    <Rocket className="h-6 w-6 text-brand-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Ready to publish?
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Submit your course for admin review. Once approved, it will
                      appear in the public catalog for students to enroll.
                    </p>

                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                      <li
                        className={cn(
                          "flex items-center gap-2",
                          hasModules ? "text-emerald-700" : "text-amber-700"
                        )}
                      >
                        {hasModules ? "✓" : "○"} At least one module with lessons
                      </li>
                      <li className="flex items-center gap-2 text-slate-600">
                        ✓ Course title and description filled in
                      </li>
                    </ul>

                    {course.status === "rejected" && course.rejectionReason && (
                      <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                        Previously rejected: {course.rejectionReason}
                      </p>
                    )}

                    <Button
                      className="mt-6"
                      disabled={!hasModules}
                      onClick={() =>
                        submitForReview({ courseId })
                          .then(() => toast.success("Submitted for admin review"))
                          .catch((error) =>
                            toast.error(
                              error instanceof Error
                                ? error.message
                                : "Submit failed"
                            )
                          )
                      }
                    >
                      Submit for Review
                    </Button>
                    {!hasModules && (
                      <p className="mt-3 text-sm text-amber-700">
                        Add modules and lessons in the Curriculum tab first.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
