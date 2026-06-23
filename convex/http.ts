import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    const payload = await request.text();

    try {
      await ctx.runAction(internal.stripe.handleStripeWebhook, {
        payload,
        signature,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Webhook handler failed";
      if (message === "Invalid signature") {
        return new Response("Invalid signature", { status: 400 });
      }
      if (message === "Stripe webhook not configured") {
        return new Response("Stripe webhook not configured", { status: 500 });
      }
      console.error("Stripe webhook handler error", error);
      return new Response("Webhook handler failed", { status: 500 });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
