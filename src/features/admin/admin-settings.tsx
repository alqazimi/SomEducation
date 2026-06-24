"use client";

import Link from "next/link";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { settingsFormSchema, type SettingsFormValues } from "@/schemas";

export function AdminSettings() {
  const { isAuthenticated } = useConvexAuth();
  const settings = useQuery(api.settings.get);
  const stripeConfig = useQuery(api.stripeConfig.getPublicConfig);
  const categories = useQuery(api.categories.list, {});
  const paymentProviders = useQuery(
    api.paymentProviders.list,
    isAuthenticated ? {} : "skip"
  );
  const updateSettings = useMutation(api.settings.update);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    values: {
      paymentInstructions: settings?.paymentInstructions ?? "",
      supportEmail: settings?.supportEmail,
      stripeEnabled: settings?.stripeEnabled ?? false,
    },
  });

  async function onSubmit(data: SettingsFormValues) {
    try {
      await updateSettings(data);
      toast.success("Settings updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  const activeProviders =
    paymentProviders?.filter(
      (provider) => provider.isActive && provider.accountNumber.trim()
    ).length ?? 0;

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Administration"
        title="Platform settings"
        description="Support contact and general payment notes."
      />

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Course Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Manage categories from the dedicated admin page. Teachers choose a
            category when creating a course; students use them to filter the
            catalog.
          </p>
          <p className="text-sm text-muted-foreground">
            Active categories:{" "}
            {categories?.filter((cat) => cat.isActive).length ?? "…"} of{" "}
            {categories?.length ?? "…"}
          </p>
          <Link href="/dashboard/admin/categories">
            <Button variant="outline">Manage categories</Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Payment Providers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Mobile money and bank numbers are managed per provider (EVC Plus,
            Zaad, Premier Bank, etc.). Students only see the number for the
            provider they choose.
          </p>
          <p className="text-sm text-muted-foreground">
            Active providers with numbers: {activeProviders}
          </p>
          <Link href="/dashboard/admin/payment-providers">
            <Button variant="outline">Manage payment providers</Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Stripe card payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Accept debit and credit cards via Stripe Checkout. Students get
            instant access after payment — no manual admin approval needed.
          </p>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
            <div>
              <p className="font-medium text-foreground">Enable Stripe checkout</p>
              <p className="text-sm text-muted-foreground">
                Requires <code className="text-xs">STRIPE_SECRET_KEY</code> in
                Convex (see README).
              </p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-border accent-brand-600"
              checked={form.watch("stripeEnabled") ?? false}
              onChange={(event) =>
                form.setValue("stripeEnabled", event.target.checked, {
                  shouldDirty: true,
                })
              }
              aria-label="Enable Stripe checkout"
            />
          </div>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>
              Convex: <code className="text-xs">STRIPE_SECRET_KEY</code>,{" "}
              <code className="text-xs">STRIPE_WEBHOOK_SECRET</code>
            </li>
            <li>
              Secret key in Convex:{" "}
              {stripeConfig?.stripeConfigured ? "configured" : "not set yet"}
            </li>
          </ul>
          <Button onClick={form.handleSubmit(onSubmit)}>Save Stripe setting</Button>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>General Payment Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="instructions">Optional platform-wide note</Label>
            <Textarea
              id="instructions"
              {...form.register("paymentInstructions")}
              className="mt-1"
              rows={4}
              placeholder="Optional extra instructions shown in support docs"
            />
          </div>
          <div>
            <Label htmlFor="email">Support Email</Label>
            <Input
              id="email"
              {...form.register("supportEmail")}
              className="mt-1"
            />
          </div>
          <Button onClick={form.handleSubmit(onSubmit)}>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
