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
