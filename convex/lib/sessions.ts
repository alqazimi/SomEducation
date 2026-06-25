import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function revokeAllUserSessions(
  ctx: MutationCtx,
  userId: Id<"users">,
  options?: { exceptSessionId?: Id<"authSessions"> }
) {
  const sessions = (await ctx.db.query("authSessions").collect()).filter(
    (session) => session.userId === userId
  );

  for (const session of sessions) {
    if (options?.exceptSessionId && session._id === options.exceptSessionId) {
      continue;
    }

    await ctx.db.delete(session._id);

    const verifications = (
      await ctx.db.query("mfaVerifications").collect()
    ).filter((row) => row.sessionId === session._id);

    for (const row of verifications) {
      await ctx.db.delete(row._id);
    }
  }
}
