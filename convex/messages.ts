import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  MutationCtx,
  QueryCtx,
} from "./_generated/server";
import {
  getCurrentUser,
  requireAdmin,
  requireCurrentUser,
  isAdminOrOwner,
} from "./lib/auth";
import { UserRole } from "./lib/types";
import { createNotification } from "./lib/notifications";
import { checkRateLimit, sanitizeText } from "./lib/validation";
import { Id } from "./_generated/dataModel";

const MESSAGE_TTL_MS = 24 * 60 * 60 * 1000;

async function getOrCreateSupportThread(
  ctx: MutationCtx,
  studentId: Id<"users">
) {
  const existing = await getPrimaryThreadForStudent(ctx, studentId);

  if (existing) return existing;

  const now = Date.now();
  const threadId = await ctx.db.insert("supportThreads", {
    studentId,
    createdAt: now,
    updatedAt: now,
    lastMessageAt: now,
  });

  const thread = await ctx.db.get(threadId);
  if (!thread) throw new Error("Failed to create support thread");
  return thread;
}

async function getAllThreadsForStudent(
  ctx: QueryCtx,
  studentId: Id<"users">
) {
  return await ctx.db
    .query("supportThreads")
    .withIndex("by_studentId", (q) => q.eq("studentId", studentId))
    .collect();
}

async function getPrimaryThreadForStudent(
  ctx: QueryCtx,
  studentId: Id<"users">
) {
  const threads = await getAllThreadsForStudent(ctx, studentId);
  if (threads.length === 0) return null;
  return threads.sort((a, b) => b.lastMessageAt - a.lastMessageAt)[0];
}

async function getThreadMessages(ctx: QueryCtx, threadId: Id<"supportThreads">) {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_thread", (q) => q.eq("threadId", threadId))
    .collect();

  return messages
    .filter((msg) => !msg.isDeleted)
    .sort((a, b) => a.createdAt - b.createdAt);
}

async function getAllSupportMessagesForStudent(
  ctx: QueryCtx,
  studentId: Id<"users">
) {
  const seen = new Set<string>();
  const messages: Awaited<ReturnType<typeof getThreadMessagesWithSenders>> = [];

  const threads = await getAllThreadsForStudent(ctx, studentId);
  for (const thread of threads) {
    const threadMessages = await getThreadMessagesWithSenders(ctx, thread._id);
    for (const msg of threadMessages) {
      if (!seen.has(msg._id)) {
        seen.add(msg._id);
        messages.push(msg);
      }
    }
  }

  const directToStudent = await ctx.db
    .query("messages")
    .withIndex("by_recipient", (q) => q.eq("recipientId", studentId))
    .collect();

  for (const msg of directToStudent) {
    if (msg.threadId || msg.isDeleted || seen.has(msg._id)) continue;
    const sender = await ctx.db.get(msg.senderId);
    seen.add(msg._id);
    messages.push({ ...msg, sender });
  }

  const directFromStudent = await ctx.db
    .query("messages")
    .withIndex("by_sender", (q) => q.eq("senderId", studentId))
    .collect();

  for (const msg of directFromStudent) {
    if (msg.threadId || msg.isDeleted || seen.has(msg._id)) continue;
    const sender = await ctx.db.get(msg.senderId);
    seen.add(msg._id);
    messages.push({ ...msg, sender });
  }

  return messages.sort((a, b) => a.createdAt - b.createdAt);
}

function isSupportReplyToStudent(
  message: { audience?: string; senderId: Id<"users">; recipientId: Id<"users"> },
  studentId: Id<"users">
) {
  if (message.audience === "support_to_student") return true;
  if (message.audience === "student_to_support") return false;
  return message.recipientId === studentId && message.senderId !== studentId;
}

async function getThreadMessagesWithSenders(
  ctx: QueryCtx,
  threadId: Id<"supportThreads">
) {
  const messages = await getThreadMessages(ctx, threadId);
  return await Promise.all(
    messages.map(async (msg) => {
      const sender = await ctx.db.get(msg.senderId);
      return { ...msg, sender };
    })
  );
}

async function notifyAllAdmins(
  ctx: Parameters<typeof createNotification>[0],
  args: {
    title: string;
    body: string;
    link?: string;
  }
) {
  const users = await ctx.db.query("users").collect();
  const admins = users.filter(
    (user) =>
      user.status === "active" && isAdminOrOwner(user.role as UserRole)
  );

  for (const admin of admins) {
    await createNotification(ctx, {
      userId: admin._id,
      type: "new_message",
      title: args.title,
      body: args.body,
      link: args.link ?? "/dashboard/messages",
    });
  }
}

export const sendToSupport = mutation({
  args: {
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const sender = await requireCurrentUser(ctx);
    if (sender.role !== "student") {
      throw new Error("Only students can message support through this flow");
    }

    await checkRateLimit(ctx, `message:${sender._id}`, 20);

    const thread = await getOrCreateSupportThread(ctx, sender._id);
    const now = Date.now();

    const messageId = await ctx.db.insert("messages", {
      senderId: sender._id,
      recipientId: sender._id,
      threadId: thread._id,
      audience: "student_to_support",
      subject: sanitizeText(args.subject, 200),
      body: sanitizeText(args.body, 5000),
      isRead: false,
      createdAt: now,
    });

    await ctx.db.patch(thread._id, {
      updatedAt: now,
      lastMessageAt: now,
    });

    await notifyAllAdmins(ctx, {
      title: "New support message",
      body: sanitizeText(args.subject, 200),
    });

    return messageId;
  },
});

export const replyInThread = mutation({
  args: {
    threadId: v.id("supportThreads"),
    body: v.string(),
    subject: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await checkRateLimit(ctx, `message:${admin._id}`, 50);

    const thread = await ctx.db.get(args.threadId);
    if (!thread) throw new Error("Conversation not found");

    const student = await ctx.db.get(thread.studentId);
    if (!student || student.status !== "active" || student.role !== "student") {
      throw new Error("Student not found");
    }

    const now = Date.now();
    const messageId = await ctx.db.insert("messages", {
      senderId: admin._id,
      recipientId: thread.studentId,
      threadId: thread._id,
      audience: "support_to_student",
      subject: args.subject
        ? sanitizeText(args.subject, 200)
        : "Reply from support",
      body: sanitizeText(args.body, 5000),
      isRead: false,
      createdAt: now,
    });

    await ctx.db.patch(thread._id, {
      updatedAt: now,
      lastMessageAt: now,
    });

    await createNotification(ctx, {
      userId: thread.studentId,
      type: "new_message",
      title: "Message from SomEducation Support",
      body: sanitizeText(args.body, 200),
      link: "/dashboard/messages",
    });

    return messageId;
  },
});

export const startThreadWithStudent = mutation({
  args: {
    studentId: v.id("users"),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await checkRateLimit(ctx, `message:${admin._id}`, 50);

    const student = await ctx.db.get(args.studentId);
    if (
      !student ||
      student.status !== "active" ||
      student.role !== "student"
    ) {
      throw new Error("Student not found");
    }

    const thread = await getOrCreateSupportThread(ctx, args.studentId);
    const now = Date.now();

    const messageId = await ctx.db.insert("messages", {
      senderId: admin._id,
      recipientId: args.studentId,
      threadId: thread._id,
      audience: "support_to_student",
      subject: sanitizeText(args.subject, 200),
      body: sanitizeText(args.body, 5000),
      isRead: false,
      createdAt: now,
    });

    await ctx.db.patch(thread._id, {
      updatedAt: now,
      lastMessageAt: now,
    });

    await createNotification(ctx, {
      userId: args.studentId,
      type: "new_message",
      title: "Message from SomEducation Admin",
      body: sanitizeText(args.subject, 200),
      link: "/dashboard/messages",
    });

    return { messageId, threadId: thread._id };
  },
});

export const listSupportThreads = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || !isAdminOrOwner(user.role)) return [];

    const threads = await ctx.db
      .query("supportThreads")
      .withIndex("by_lastMessageAt")
      .order("desc")
      .take(200);

    const seenStudents = new Set<string>();
    const results = [];

    for (const thread of threads) {
      if (seenStudents.has(thread.studentId)) continue;
      seenStudents.add(thread.studentId);

      const student = await ctx.db.get(thread.studentId);
      const messages = await getAllSupportMessagesForStudent(
        ctx,
        thread.studentId
      );
      const lastMessage = messages[messages.length - 1] ?? null;
      const unreadCount = messages.filter(
        (msg) =>
          msg.audience === "student_to_support" && !msg.isRead
      ).length;

      const primaryThread =
        (await getPrimaryThreadForStudent(ctx, thread.studentId)) ?? thread;

      results.push({
        ...primaryThread,
        student,
        lastMessage,
        unreadCount,
      });
    }

    return results.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
});

export const getMySupportThread = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.status === "suspended") {
      return null;
    }
    if (user.role !== "student") {
      return { thread: null, messages: [] };
    }

    const thread = await getPrimaryThreadForStudent(ctx, user._id);
    const messages = await getAllSupportMessagesForStudent(ctx, user._id);

    return { thread, messages };
  },
});

export const getSupportThread = query({
  args: { threadId: v.id("supportThreads") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || !isAdminOrOwner(user.role)) return null;

    const thread = await ctx.db.get(args.threadId);
    if (!thread) return null;

    const student = await ctx.db.get(thread.studentId);
    const messages = await getAllSupportMessagesForStudent(
      ctx,
      thread.studentId
    );

    return { thread, student, messages };
  },
});

export const markThreadRead = mutation({
  args: { threadId: v.optional(v.id("supportThreads")) },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const isAdmin = isAdminOrOwner(user.role);

    let studentId: Id<"users"> | null = null;
    if (args.threadId) {
      const thread = await ctx.db.get(args.threadId);
      if (!thread) throw new Error("Conversation not found");
      studentId = thread.studentId;
      if (!isAdmin && user._id !== thread.studentId) {
        throw new Error("Access denied");
      }
    } else if (!isAdmin && user.role === "student") {
      studentId = user._id;
    } else {
      throw new Error("Conversation not found");
    }

    const now = Date.now();
    const threads =
      studentId !== null
        ? await getAllThreadsForStudent(ctx, studentId)
        : args.threadId
          ? [await ctx.db.get(args.threadId)!]
          : [];

    const threadIds = threads.filter(Boolean).map((t) => t!._id);
    const seen = new Set<string>();

    for (const threadId of threadIds) {
      const messages = await getThreadMessages(ctx, threadId);
      for (const msg of messages) {
        if (msg.isRead || seen.has(msg._id)) continue;
        seen.add(msg._id);

        if (isAdmin && msg.audience === "student_to_support") {
          await ctx.db.patch(msg._id, { isRead: true, readAt: now });
        } else if (
          !isAdmin &&
          isSupportReplyToStudent(msg, user._id)
        ) {
          await ctx.db.patch(msg._id, { isRead: true, readAt: now });
        }
      }
    }

    if (!isAdmin && studentId) {
      const legacy = await ctx.db
        .query("messages")
        .withIndex("by_recipient", (q) => q.eq("recipientId", studentId))
        .collect();

      for (const msg of legacy) {
        if (msg.threadId || msg.isDeleted || msg.isRead || seen.has(msg._id)) {
          continue;
        }
        if (isSupportReplyToStudent(msg, studentId)) {
          seen.add(msg._id);
          await ctx.db.patch(msg._id, { isRead: true, readAt: now });
        }
      }
    }
  },
});

export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    body: v.string(),
    subject: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const message = await ctx.db.get(args.messageId);
    if (!message || message.isDeleted) {
      throw new Error("Message not found");
    }
    if (message.senderId !== user._id) {
      throw new Error("You can only edit your own messages");
    }
    if (message.isRead) {
      throw new Error("Cannot edit a message after it has been read");
    }

    const patch: {
      body: string;
      editedAt: number;
      subject?: string;
    } = {
      body: sanitizeText(args.body, 5000),
      editedAt: Date.now(),
    };

    if (args.subject) {
      patch.subject = sanitizeText(args.subject, 200);
    }

    await ctx.db.patch(args.messageId, patch);
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const message = await ctx.db.get(args.messageId);
    if (!message || message.isDeleted) {
      throw new Error("Message not found");
    }
    if (message.senderId !== user._id) {
      throw new Error("You can only delete your own messages");
    }
    if (message.isRead) {
      throw new Error("Cannot delete a message after it has been read");
    }

    await ctx.db.patch(args.messageId, { isDeleted: true });
  },
});

export const purgeReadMessages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - MESSAGE_TTL_MS;
    const messages = await ctx.db.query("messages").collect();

    for (const message of messages) {
      if (message.readAt && message.readAt < cutoff) {
        await ctx.db.delete(message._id);
      }
    }
  },
});

export const send = mutation({
  args: {
    recipientId: v.id("users"),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const sender = await requireCurrentUser(ctx);
    await checkRateLimit(ctx, `message:${sender._id}`, 20);

    if (sender.role === "student") {
      throw new Error("Students should use support messaging instead");
    }

    const recipient = await ctx.db.get(args.recipientId);
    if (!recipient || recipient.status !== "active") {
      throw new Error("Recipient not found");
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

    if (recipient.role === "student") {
      const thread = await getOrCreateSupportThread(ctx, args.recipientId);
      const now = Date.now();

      const messageId = await ctx.db.insert("messages", {
        senderId: admin._id,
        recipientId: args.recipientId,
        threadId: thread._id,
        audience: "support_to_student",
        subject: sanitizeText(args.subject, 200),
        body: sanitizeText(args.body, 5000),
        isRead: false,
        createdAt: now,
      });

      await ctx.db.patch(thread._id, {
        updatedAt: now,
        lastMessageAt: now,
      });

      await createNotification(ctx, {
        userId: args.recipientId,
        type: "new_message",
        title: "Message from SomEducation Admin",
        body: sanitizeText(args.subject, 200),
        link: "/dashboard/messages",
      });

      return messageId;
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
    const user = await getCurrentUser(ctx);
    if (!user || user.status === "suspended") return [];

    if (user.role === "student") return [];

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
          candidate.email.toLowerCase().includes(search) ||
          name.includes(search)
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

export const listStudentsForMessaging = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || !isAdminOrOwner(user.role)) return [];

    const search = args.search?.trim().toLowerCase();
    const users = await ctx.db.query("users").collect();

    return users
      .filter(
        (candidate) =>
          candidate.status === "active" && candidate.role === "student"
      )
      .filter((candidate) => {
        if (!search) return true;
        const name = `${candidate.firstName ?? ""} ${candidate.lastName ?? ""}`
          .trim()
          .toLowerCase();
        return (
          candidate.email.toLowerCase().includes(search) ||
          name.includes(search)
        );
      })
      .sort((a, b) => a.email.localeCompare(b.email))
      .slice(0, 50)
      .map((candidate) => ({
        _id: candidate._id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
      }));
  },
});

export const inbox = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.status === "suspended") return [];

    if (user.role === "student" || isAdminOrOwner(user.role)) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_recipient", (q) => q.eq("recipientId", user._id))
      .order("desc")
      .take(100);

    return await Promise.all(
      messages
        .filter((msg) => !msg.threadId && !msg.isDeleted)
        .map(async (msg) => {
          const sender = await ctx.db.get(msg.senderId);
          return { ...msg, sender };
        })
    );
  },
});

export const sent = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.status === "suspended") return [];

    if (user.role === "student" || isAdminOrOwner(user.role)) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("senderId", user._id))
      .order("desc")
      .take(100);

    return await Promise.all(
      messages
        .filter((msg) => !msg.threadId && !msg.isDeleted)
        .map(async (msg) => {
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
    if (!message || message.isDeleted) {
      throw new Error("Message not found");
    }
    if (message.recipientId !== user._id) {
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
    const user = await getCurrentUser(ctx);
    if (!user || user.status === "suspended") return 0;

    if (user.role === "student") {
      const messages = await getAllSupportMessagesForStudent(ctx, user._id);
      return messages.filter(
        (msg) => isSupportReplyToStudent(msg, user._id) && !msg.isRead
      ).length;
    }

    if (isAdminOrOwner(user.role)) {
      const threads = await ctx.db.query("supportThreads").collect();
      let count = 0;
      for (const thread of threads) {
        const messages = await getThreadMessages(ctx, thread._id);
        count += messages.filter(
          (msg) => msg.audience === "student_to_support" && !msg.isRead
        ).length;
      }
      return count;
    }

    const unread = await ctx.db
      .query("messages")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientId", user._id).eq("isRead", false)
      )
      .collect();

    return unread.filter((msg) => !msg.threadId && !msg.isDeleted).length;
  },
});
