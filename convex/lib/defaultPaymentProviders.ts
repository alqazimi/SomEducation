export const DEFAULT_MOBILE_MONEY_PROVIDERS = [
  { name: "EVC Plus", slug: "evc-plus" },
  { name: "Zaad", slug: "zaad" },
  { name: "eDahab", slug: "edahab" },
  { name: "Sahal", slug: "sahal" },
] as const;

export const DEFAULT_BANK_PROVIDERS = [
  { name: "Premier Bank", slug: "premier-bank" },
  { name: "Salaam Somali Bank", slug: "salaam-somali-bank" },
  {
    name: "International Bank of Somalia",
    slug: "international-bank-of-somalia",
  },
] as const;

export async function insertDefaultPaymentProviders(
  ctx: { db: import("../_generated/server").MutationCtx["db"] }
) {
  let created = 0;
  let order = 0;

  for (const provider of DEFAULT_MOBILE_MONEY_PROVIDERS) {
    const existing = await ctx.db
      .query("paymentProviders")
      .withIndex("by_slug", (q) => q.eq("slug", provider.slug))
      .unique();
    if (!existing) {
      await ctx.db.insert("paymentProviders", {
        type: "mobile_money",
        name: provider.name,
        slug: provider.slug,
        accountNumber: "",
        isActive: false,
        order: order++,
        createdAt: Date.now(),
      });
      created++;
    }
  }

  for (const provider of DEFAULT_BANK_PROVIDERS) {
    const existing = await ctx.db
      .query("paymentProviders")
      .withIndex("by_slug", (q) => q.eq("slug", provider.slug))
      .unique();
    if (!existing) {
      await ctx.db.insert("paymentProviders", {
        type: "bank_transfer",
        name: provider.name,
        slug: provider.slug,
        accountNumber: "",
        isActive: false,
        order: order++,
        createdAt: Date.now(),
      });
      created++;
    }
  }

  return created;
}
