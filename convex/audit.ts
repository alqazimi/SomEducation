import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
    entityType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = Math.min(args.limit ?? 50, 100);

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);

    const filtered = args.entityType
      ? logs.filter((log) => log.entityType === args.entityType)
      : logs;

    const actorIds = [
      ...new Set(
        filtered
          .map((log) => log.actorId)
          .filter((id): id is NonNullable<typeof id> => Boolean(id))
      ),
    ];

    const actors = await Promise.all(actorIds.map((id) => ctx.db.get(id)));
    const actorById = new Map(
      actors
        .filter((actor): actor is NonNullable<typeof actor> => Boolean(actor))
        .map((actor) => [actor._id, actor] as const)
    );

    return filtered.map((log) => {
      const actor = log.actorId ? actorById.get(log.actorId) : undefined;
      return {
        ...log,
        actorEmail: actor?.email,
        actorName:
          [actor?.firstName, actor?.lastName].filter(Boolean).join(" ").trim() ||
          actor?.email,
      };
    });
  },
});
