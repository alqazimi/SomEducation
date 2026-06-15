import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  requireAdmin,
  requireCurrentUser,
  isAdminOrOwner,
} from "./lib/auth";
import { UserRole } from "./lib/types";
import { createNotification } from "./lib/notifications";
import { checkRateLimit, sanitizeText } from "./lib/validation";

export const send = mutation({
  args: {
    recipientId: v.id("users"),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const sender = await requireCurrentUser(ctx);
    await checkRateLimit(ctx, `message:${sender._id}`, 20);

    const recipient = await ctx.db.get(args.recipientId);
    if (!recipient || recipient.status !== "active") {
      throw new Error("Recipient not found");
    }

    if (sender.role === "student" && !isAdminOrOwner(recipient.role)) {
      throw new Error("Students can only message admins");
    }

    if (
      sender.role === "teacher" &&
      !isAdminOrOwner(recipient.role) &&
      recipient.role !== "student"
    ) {
      throw new Error("Invalid recipient");
    }

    const now = Date.now();
    const messageId = await ctx.db.insert("messages", {
      senderId: sender._id,
      recipientId: args.recipientId,
      subject: sanitizeText(args.subject, 200),
      body: sanitizeText(args.body, 5000),
      isRead: false,
      createdAt: now,
    });

    await createNotification(ctx, {
      userId: args.recipientId,
      type: "new_message",
      title: "New Message",
      body: sanitizeText(args.subject, 200),
      link: "/dashboard/messages",
    });

    return messageId;
  },
});

export const sendAsAdmin = mutation({
  args: {
    recipientId: v.id("users"),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await checkRateLimit(ctx, `message:${admin._id}`, 50);

    const recipient = await ctx.db.get(args.recipientId);
    if (!recipient || recipient.status !== "active") {
      throw new Error("Recipient not found");
    }

    const now = Date.now();
    const messageId = await ctx.db.insert("messages", {
      senderId: admin._id,
      recipientId: args.recipientId,
      subject: sanitizeText(args.subject, 200),
      body: sanitizeText(args.body, 5000),
      isRead: false,
      createdAt: now,
    });

    await createNotification(ctx, {
      userId: args.recipientId,
      type: "new_message",
      title: "Message from SomEducation Admin",
      body: sanitizeText(args.subject, 200),
      link: "/dashboard/messages",
    });

    return messageId;
  },
});

function canMessageRole(senderRole: UserRole, recipientRole: UserRole) {
  if (senderRole === "student") {
    return isAdminOrOwner(recipientRole);
  }
  if (senderRole === "teacher") {
    return isAdminOrOwner(recipientRole) || recipientRole === "student";
  }
  return true;
}

export const listMessageRecipients = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const search = args.search?.trim().toLowerCase();

    const users = await ctx.db.query("users").collect();
    return users
      .filter(
        (candidate) =>
          candidate.status === "active" &&
          candidate._id !== user._id &&
          canMessageRole(user.role, candidate.role)
      )
      .filter((candidate) => {
        if (!search) return true;
        const name = `${candidate.firstName ?? ""} ${candidate.lastName ?? ""}`
          .trim()
          .toLowerCase();
        return (
          candidate.email.toLowerCase().includes(search) || name.includes(search)
        );
      })
      .sort((a, b) => {
        const aAdmin = isAdminOrOwner(a.role) ? 0 : 1;
        const bAdmin = isAdminOrOwner(b.role) ? 0 : 1;
        if (aAdmin !== bAdmin) return aAdmin - bAdmin;
        return a.email.localeCompare(b.email);
      })
      .slice(0, 50)
      .map((candidate) => ({
        _id: candidate._id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        role: candidate.role,
      }));
  },
});

export const inbox = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_recipient", (q) => q.eq("recipientId", user._id))
      .order("desc")
      .take(100);

    return await Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        return { ...msg, sender };
      })
    );
  },
});

export const sent = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("senderId", user._id))
      .order("desc")
      .take(100);

    return await Promise.all(
      messages.map(async (msg) => {
        const recipient = await ctx.db.get(msg.recipientId);
        return { ...msg, recipient };
      })
    );
  },
});

export const markRead = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const message = await ctx.db.get(args.messageId);
    if (!message || message.recipientId !== user._id) {
      throw new Error("Message not found");
    }

    if (!message.isRead) {
      await ctx.db.patch(args.messageId, {
        isRead: true,
        readAt: Date.now(),
      });
    }
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const unread = await ctx.db
      .query("messages")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientId", user._id).eq("isRead", false)
      )
      .collect();
    return unread.length;
  },
});
