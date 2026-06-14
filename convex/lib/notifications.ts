import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { notificationType } from "../schema";
import { Infer } from "convex/values";

type NotificationType = Infer<typeof notificationType>;

export async function createNotification(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    type: NotificationType;
    title: string;
    body: string;
    link?: string;
    metadata?: string;
  }
) {
  await ctx.db.insert("notifications", {
    userId: args.userId,
    type: args.type,
    title: args.title,
    body: args.body,
    link: args.link,
    metadata: args.metadata,
    isRead: false,
    createdAt: Date.now(),
  });
}
