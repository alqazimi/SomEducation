import { mutation } from "./_generated/server";
import { requireCurrentUser } from "./lib/auth";
import { generateUploadUrl } from "./lib/files";
import { checkRateLimit } from "./lib/validation";

export const generateUploadUrlMutation = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    await checkRateLimit(ctx, `upload:${user._id}`, 20);
    return await generateUploadUrl(ctx);
  },
});
