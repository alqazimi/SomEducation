"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  BookOpen,
  Compass,
  CreditCard,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import { api } from "convex/_generated/api";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/typography";
import { type } from "@/lib/typography";
import { StudentCoursesSection } from "@/features/student/student-courses-section";

export function StudentDashboard() {
  const user = useQuery(api.users.getMe);
  const courses = useQuery(api.lessons.listEnrolledCourses);
  const payments = useQuery(api.payments.listMine);

  const pendingPayments =
    payments?.filter((p) => p.status === "pending") ?? [];

  const quickLinks = [
    {
      label: "Payments",
      description: "Track payment submissions",
      href: "/dashboard/student/payments",
      icon: CreditCard,
    },
    {
      label: "Messages",
      description: "Chat with teachers and admins",
      href: "/dashboard/messages",
      icon: MessageSquare,
    },
    {
      label: "Courses",
      description: "Browse the full course catalog",
      href: "/courses",
      icon: Compass,
    },
  ];

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Dashboard"
        title={
          user?.firstName ? `Welcome back, ${user.firstName}` : "Welcome back"
        }
        description="Your courses, payments, and learning progress — all in one place."
      >
        <Link href="/courses">
          <Button variant="outline" className="gap-2">
            Browse Courses
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </DashboardPageHeader>

      {pendingPayments.length > 0 && (
        <Card className="mt-6 border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-amber-900">
                {pendingPayments.length} payment
                {pendingPayments.length === 1 ? "" : "s"} awaiting review
              </p>
              <p className="mt-1 text-sm text-amber-800">
                We will notify you once an admin approves your enrollment.
              </p>
            </div>
            <Link href="/dashboard/student/payments">
              <Button variant="outline" className="border-amber-300 bg-white">
                View Payments
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Enrolled Courses",
            value: courses?.length ?? 0,
            icon: BookOpen,
          },
          {
            label: "Pending Payments",
            value: pendingPayments.length,
            icon: CreditCard,
          },
          {
            label: "In Progress",
            value:
              courses?.filter((c) => c && (c.progress?.percent ?? 0) < 100)
                .length ?? 0,
            icon: GraduationCap,
          },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className={type.muted}>{stat.label}</p>
                <p className={`mt-1 ${type.stat}`}>{stat.value}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <stat.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mt-10">
        <SectionTitle className="mt-10">Quick actions</SectionTitle>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={type.cardTitle}>{item.label}</p>
                    <p className={`mt-1 ${type.muted}`}>{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionTitle>My courses</SectionTitle>
        <p className={`mt-1 ${type.muted}`}>
          Continue learning or review completed programs.
        </p>
        <div className="mt-6">
          <StudentCoursesSection />
        </div>
      </section>
    </div>
  );
}
