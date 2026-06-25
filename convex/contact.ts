import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { createNotification } from "./lib/notifications";
import { isAdminOrOwner } from "./lib/roles";
import {
  checkRateLimit,
  sanitizeText,
  validateEmail,
} from "./lib/validation";

export const submitInquiry = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const name = sanitizeText(args.name, 120);
    const email = sanitizeText(args.email, 254).toLowerCase();
    const subject = sanitizeText(args.subject, 200);
    const message = sanitizeText(args.message, 5000);

    if (!name || !email || !subject || !message) {
      throw new Error("Please fill in all fields.");
    }

    if (!validateEmail(email)) {
      throw new Error("Please enter a valid email address.");
    }

    await checkRateLimit(ctx, `contact:${email}`, 5);

    const inquiryId = await ctx.db.insert("contactInquiries", {
      name,
      email,
      subject,
      message,
      createdAt: Date.now(),
    });

    const admins = await ctx.db.query("users").collect();
    await Promise.all(
      admins
        .filter((user) => isAdminOrOwner(user.role) && user.status === "active")
        .map((admin) =>
          createNotification(ctx, {
            userId: admin._id,
            type: "new_message",
            title: "New contact form message",
            body: `${name} — ${subject}`,
            link: "/contact",
            metadata: inquiryId,
          })
        )
    );

    return { ok: true as const };
  },
});
