import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function logAudit(
  ctx: MutationCtx,
  args: {
    actorId?: Id<"users">;
    action: string;
    entityType: string;
    entityId?: string;
    details?: string;
    ipAddress?: string;
  }
) {
  await ctx.db.insert("auditLogs", {
    actorId: args.actorId,
    action: args.action,
    entityType: args.entityType,
    entityId: args.entityId,
    details: args.details,
    ipAddress: args.ipAddress,
    createdAt: Date.now(),
  });
}
