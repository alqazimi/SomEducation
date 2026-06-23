import { query } from "./_generated/server";

export const getPublicStats = query({
  args: {},
  handler: async (ctx) => {
    const [users, courses, approvedPayments] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db
        .query("courses")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect(),
      ctx.db
        .query("payments")
        .withIndex("by_status", (q) => q.eq("status", "approved"))
        .collect(),
    ]);

    const activeStudents = users.filter(
      (user) => user.role === "student" && user.status === "active"
    ).length;
    const activeTeachers = users.filter(
      (user) => user.role === "teacher" && user.status === "active"
    ).length;

    return {
      students: activeStudents,
      courses: courses.length,
      teachers: activeTeachers,
      approvedPayments: approvedPayments.length,
    };
  },
});
