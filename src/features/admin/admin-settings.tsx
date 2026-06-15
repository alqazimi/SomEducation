"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
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
  const settings = useQuery(api.settings.get);
  const categories = useQuery(api.categories.list, {});
  const updateSettings = useMutation(api.settings.update);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    values: {
      paymentPhone: settings?.paymentPhone ?? "",
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

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Administration"
        title="Platform settings"
        description="Payment details, categories, and support contact information."
      />

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Course Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Manage categories from the dedicated admin page. Teachers choose a
            category when creating a course; students use them to filter the
            catalog.
          </p>
          <p className="text-sm text-slate-500">
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
          <CardTitle>Payment Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="phone">Payment Phone/Number</Label>
            <Input
              id="phone"
              {...form.register("paymentPhone")}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="instructions">Payment Instructions</Label>
            <Textarea
              id="instructions"
              {...form.register("paymentInstructions")}
              className="mt-1"
              rows={5}
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
