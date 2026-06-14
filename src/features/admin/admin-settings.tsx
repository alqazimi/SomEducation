"use client";

import { useMutation, useQuery } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
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
  const seedCategories = useMutation(api.seed.seedCategories);

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

  async function handleSeedCategories() {
    try {
      await seedCategories({});
      toast.success("Default categories created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Platform Settings</h1>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Course Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Teachers need categories before they can create courses. Run this once
            to add the default list (Web Development, Data Science, Business,
            Design, Marketing).
          </p>
          <p className="text-sm text-slate-500">
            Current categories: {categories?.length ?? "…"}
          </p>
          <Button variant="outline" onClick={() => void handleSeedCategories()}>
            Seed Default Categories
          </Button>
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
