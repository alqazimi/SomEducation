export const DEFAULT_CATEGORIES = [
  { name: "Web Development", slug: "web-development" },
  { name: "Data Science", slug: "data-science" },
  { name: "Business", slug: "business" },
  { name: "Design", slug: "design" },
  { name: "Marketing", slug: "marketing" },
] as const;

export async function insertDefaultCategories(
  ctx: { db: import("../_generated/server").MutationCtx["db"] }
) {
  let created = 0;
  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", cat.slug))
      .unique();
    if (!existing) {
      await ctx.db.insert("categories", {
        name: cat.name,
        slug: cat.slug,
        isActive: true,
        createdAt: Date.now(),
      });
      created++;
    }
  }
  return created;
}
