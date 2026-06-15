"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { BookOpen, Plus, Users } from "lucide-react";
import { api } from "convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/typography";
import { formatEnrollmentCount } from "@/lib/enrollment";
import { type } from "@/lib/typography";
import { formatPrice } from "@/lib/utils";

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

export function TeacherDashboard() {
  const courses = useQuery(api.courses.listByTeacher);
  const stats = useQuery(api.enrollments.getTeacherStats);

  const summaryStats = [
    {
      label: "My Courses",
      value: stats?.totalCourses ?? courses?.length ?? 0,
    },
    {
      label: "Published",
      value: stats?.publishedCourses ?? 0,
    },
    {
      label: "Students Enrolled",
      value: stats?.totalEnrollments ?? 0,
    },
  ];

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Instructor"
        title="My courses"
        description="Track enrollments and manage your catalog."
      >
        <Link href="/dashboard/teacher/courses/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New course
          </Button>
        </Link>
      </DashboardPageHeader>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {summaryStats.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardTitle className={type.muted}>{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={type.stat}>{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {courses === undefined ? (
          <p className={type.muted}>Loading courses...</p>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16 text-center">
              <BookOpen className="h-10 w-10 text-slate-300" />
              <p className={`mt-4 ${type.cardTitle}`}>No courses yet</p>
              <p className={`mt-1 ${type.muted}`}>
                Create your first course to start building your curriculum.
              </p>
              <Link href="/dashboard/teacher/courses/new" className="mt-6">
                <Button>Create Course</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          courses.map((course) => (
            <Card key={course._id} className="overflow-hidden transition-shadow hover:shadow-sm">
              <CardContent className="flex flex-col gap-4 p-0 sm:flex-row sm:items-stretch">
                <div className="aspect-video w-full shrink-0 bg-brand-50 sm:w-48">
                  {course.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full min-h-28 items-center justify-center text-xs text-brand-300">
                      No cover
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-center gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={type.cardTitle}>
                        {course.title}
                      </h3>
                      <Badge variant={statusVariant[course.status] ?? "outline"}>
                        {statusLabel[course.status] ?? course.status}
                      </Badge>
                    </div>
                    <p className={`mt-1 ${type.muted}`}>
                      {formatPrice(course.price, course.currency)} ·{" "}
                      <span className="capitalize">{course.difficulty}</span>
                      {course.moduleCount > 0 && (
                        <>
                          {" "}
                          · {course.moduleCount} module
                          {course.moduleCount === 1 ? "" : "s"}
                        </>
                      )}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
                      <Users className="h-4 w-4" />
                      {formatEnrollmentCount(course.enrollmentCount)}
                    </p>
                  </div>
                  <Link href={`/dashboard/teacher/courses/${course._id}`}>
                    <Button variant="outline">Manage Course</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
