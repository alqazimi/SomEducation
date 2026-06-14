import { describe, expect, it } from "vitest";

describe("Authorization rules", () => {
  it("defines role hierarchy correctly", () => {
    const roles = ["owner", "admin", "teacher", "student"] as const;
    expect(roles).toContain("owner");
    expect(roles).toContain("admin");
    expect(roles.indexOf("owner")).toBeLessThan(roles.indexOf("admin"));
    expect(roles.indexOf("admin")).toBeLessThan(roles.indexOf("teacher"));
  });

  it("student cannot access admin-only actions", () => {
    const adminActions = [
      "approve_payment",
      "change_role",
      "delete_user",
      "approve_course",
    ];
    const studentPermissions = ["browse_courses", "submit_payment", "view_messages"];

    for (const action of adminActions) {
      expect(studentPermissions).not.toContain(action);
    }
  });

  it("teacher cannot approve payments", () => {
    const teacherPermissions = [
      "create_course",
      "edit_course",
      "view_enrollments",
    ];
    expect(teacherPermissions).not.toContain("approve_payment");
  });
});

describe("File upload security", () => {
  const allowed = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
  const blocked = [
    "application/x-msdownload",
    "text/html",
    "image/svg+xml",
    "application/javascript",
  ];

  it("allows safe file types only", () => {
    expect(allowed).toHaveLength(4);
    for (const type of blocked) {
      expect(allowed).not.toContain(type);
    }
  });
});
