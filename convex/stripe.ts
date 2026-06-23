"use node";

import Stripe from "stripe";
import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

function getStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error(
      "Stripe is not configured. Add STRIPE_SECRET_KEY in the Convex dashboard."
    );
  }
  return key;
}

function getStripeClient() {
  return new Stripe(getStripeSecretKey());
}

function getAppUrl() {
  const url =
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "") ??
    "http://localhost:3000";
  return url;
}

/** Stripe amounts are in the smallest currency unit (e.g. cents for USD). */
function toStripeAmount(price: number, currency: string) {
  const zeroDecimal = new Set(["bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf"]);
  const code = currency.toLowerCase();
  if (zeroDecimal.has(code)) {
    return Math.round(price);
  }
  return Math.round(price * 100);
}

export const createCheckoutSession = action({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const prep = await ctx.runQuery(internal.stripeInternal.assertStripePurchaseAllowed, {
      courseId: args.courseId,
    });

    const stripe = getStripeClient();
    const appUrl = getAppUrl();
    const { course } = prep;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: prep.userEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: course.currency.toLowerCase(),
            unit_amount: toStripeAmount(course.price, course.currency),
            product_data: {
              name: course.title,
              description: `Course access on SomEducation`,
            },
          },
        },
      ],
      success_url: `${appUrl}/courses/${course.slug}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/courses/${course.slug}/purchase?cancelled=1`,
      metadata: {
        courseId: course._id,
        studentId: prep.userId,
      },
    });

    if (!session.url) {
      throw new Error("Could not start Stripe checkout");
    }

    await ctx.runMutation(internal.stripeInternal.createPendingStripePayment, {
      courseId: course._id,
      stripeCheckoutSessionId: session.id,
      fullName: prep.fullName,
      phone: prep.phone,
      amount: course.price,
      currency: course.currency,
      existingPaymentId: prep.existingStripePaymentId ?? undefined,
    });

    return { url: session.url, sessionId: session.id };
  },
});

export const handleStripeWebhook = internalAction({
  args: {
    payload: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

    if (!secretKey || !webhookSecret) {
      throw new Error("Stripe webhook not configured");
    }

    const stripe = new Stripe(secretKey);

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        args.payload,
        args.signature,
        webhookSecret
      );
    } catch (error) {
      console.error("Stripe webhook signature verification failed", error);
      throw new Error("Invalid signature");
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === "paid") {
          await ctx.runMutation(internal.stripeInternal.completeStripePayment, {
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id,
          });
        }
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await ctx.runMutation(internal.stripeInternal.expireStripePayment, {
          stripeCheckoutSessionId: session.id,
        });
        break;
      }
      default:
        break;
    }

    return { received: true };
  },
});

export const verifyCheckoutSession = action({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(args.sessionId);

    if (session.payment_status === "paid") {
      await ctx.runMutation(internal.stripeInternal.completeStripePayment, {
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id,
      });
    }

    return {
      status: session.payment_status,
    };
  },
});
