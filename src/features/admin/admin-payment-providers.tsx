"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Building2, Pencil, Plus, Smartphone, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  isAdminListDenied,
  isAdminListLoading,
  isAdminListReady,
} from "@/lib/admin-query-state";
import {
  paymentProviderFormSchema,
  type PaymentProviderFormValues,
} from "@/schemas";
import { cn } from "@/lib/utils";

const typeLabels = {
  mobile_money: "Mobile Money",
  bank_transfer: "Bank Transfer",
} as const;

function ProviderForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  defaultValues?: PaymentProviderFormValues;
  submitLabel: string;
  onSubmit: (values: PaymentProviderFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const form = useForm<PaymentProviderFormValues>({
    resolver: zodResolver(paymentProviderFormSchema),
    defaultValues: defaultValues ?? {
      type: "mobile_money",
      name: "",
      accountNumber: "",
      instructions: "",
    },
  });

  const selectedType = useWatch({
    control: form.control,
    name: "type",
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => onSubmit(values))}
    >
      <div>
        <Label>Payment type</Label>
        <Select
          value={selectedType}
          onValueChange={(value) =>
            form.setValue("type", value as PaymentProviderFormValues["type"])
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mobile_money">Mobile Money</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="provider-name">Provider name</Label>
        <Input
          id="provider-name"
          {...form.register("name")}
          className="mt-1"
          placeholder={
            selectedType === "mobile_money" ? "e.g. EVC Plus" : "e.g. Premier Bank"
          }
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="provider-number">
          {selectedType === "mobile_money"
            ? "Wallet / phone number"
            : "Account number"}
        </Label>
        <Input
          id="provider-number"
          {...form.register("accountNumber")}
          className="mt-1"
          placeholder={
            selectedType === "mobile_money" ? "e.g. 61XXXXXXX" : "e.g. 1234567890"
          }
        />
        {form.formState.errors.accountNumber && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.accountNumber.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="provider-instructions">Instructions (optional)</Label>
        <Textarea
          id="provider-instructions"
          {...form.register("instructions")}
          className="mt-1"
          rows={2}
          placeholder="Short note shown to students for this provider"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export function AdminPaymentProviders() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const providers = useQuery(
    api.paymentProviders.listForAdmin,
    isAuthenticated ? {} : "skip"
  );
  const createProvider = useMutation(api.paymentProviders.create);
  const updateProvider = useMutation(api.paymentProviders.update);
  const removeProvider = useMutation(api.paymentProviders.remove);
  const seedProviders = useMutation(api.seed.seedPaymentProviders);

  const [editingId, setEditingId] = useState<Id<"paymentProviders"> | null>(
    null
  );
  const [showCreateForm, setShowCreateForm] = useState(false);

  async function handleCreate(values: PaymentProviderFormValues) {
    try {
      await createProvider({
        type: values.type,
        name: values.name,
        accountNumber: values.accountNumber,
        instructions: values.instructions || undefined,
      });
      toast.success("Payment provider created");
      setShowCreateForm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create");
    }
  }

  async function handleUpdate(
    providerId: Id<"paymentProviders">,
    values: PaymentProviderFormValues
  ) {
    try {
      await updateProvider({
        providerId,
        type: values.type,
        name: values.name,
        accountNumber: values.accountNumber,
        instructions: values.instructions || undefined,
      });
      toast.success("Payment provider updated");
      setEditingId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
    }
  }

  async function handleToggleActive(
    providerId: Id<"paymentProviders">,
    isActive: boolean
  ) {
    try {
      await updateProvider({ providerId, isActive: !isActive });
      toast.success(isActive ? "Provider hidden" : "Provider activated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
    }
  }

  async function handleDelete(providerId: Id<"paymentProviders">) {
    try {
      await removeProvider({ providerId });
      toast.success("Payment provider deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    }
  }

  async function handleSeedDefaults() {
    try {
      const result = await seedProviders({});
      toast.success(
        result.created > 0
          ? `Added ${result.created} starter providers`
          : "Starter providers already exist"
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to seed");
    }
  }

  const editingProvider = providers?.find((provider) => provider._id === editingId);
  const isLoading = isAdminListLoading(authLoading, isAuthenticated, providers);

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Administration"
        title="Payment providers"
        description="Manage mobile money and bank transfer numbers students see when paying."
      />

      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => setShowCreateForm((open) => !open)}>
          <Plus className="mr-2 h-4 w-4" />
          {showCreateForm ? "Close form" : "Add provider"}
        </Button>
        <Button variant="outline" onClick={() => void handleSeedDefaults()}>
          <Sparkles className="mr-2 h-4 w-4" />
          Add Somalia starter list
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>New payment provider</CardTitle>
          </CardHeader>
          <CardContent>
            <ProviderForm
              key="create-provider"
              submitLabel="Create provider"
              onSubmit={handleCreate}
              onCancel={() => setShowCreateForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>
            All providers ({providers?.length ?? (isLoading ? "…" : 0)})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : isAdminListDenied(providers) ? (
            <p className="text-sm text-slate-500">
              Could not load payment providers. Check your admin access and
              Convex connection.
            </p>
          ) : isAdminListReady(providers) && providers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-12 text-center">
              <p className="text-sm text-slate-600">No payment providers yet.</p>
              <p className="mt-1 text-sm text-slate-500">
                Add providers manually or load the Somalia starter list.
              </p>
            </div>
          ) : isAdminListReady(providers) ? (
            providers.map((provider) => (
              <div
                key={provider._id}
                className="rounded-xl border border-border bg-white p-4"
              >
                {editingId === provider._id && editingProvider ? (
                  <ProviderForm
                    key={provider._id}
                    defaultValues={{
                      type: editingProvider.type,
                      name: editingProvider.name,
                      accountNumber: editingProvider.accountNumber,
                      instructions: editingProvider.instructions ?? "",
                    }}
                    submitLabel="Save changes"
                    onSubmit={(values) => handleUpdate(provider._id, values)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {provider.type === "mobile_money" ? (
                          <Smartphone className="h-4 w-4 text-brand-600" />
                        ) : (
                          <Building2 className="h-4 w-4 text-brand-600" />
                        )}
                        <h3 className="font-medium text-stone-900">
                          {provider.name}
                        </h3>
                        <Badge variant="outline">
                          {typeLabels[provider.type]}
                        </Badge>
                        <Badge
                          variant={provider.isActive ? "success" : "secondary"}
                        >
                          {provider.isActive ? "Active" : "Hidden"}
                        </Badge>
                      </div>
                      <p
                        className={cn(
                          "mt-2 font-mono text-sm",
                          provider.accountNumber.trim()
                            ? "text-stone-900"
                            : "text-amber-700"
                        )}
                      >
                        {provider.accountNumber.trim() || "No number set yet"}
                      </p>
                      {provider.instructions && (
                        <p className="mt-2 text-sm text-slate-600">
                          {provider.instructions}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-slate-500">
                        {provider.paymentCount} payment
                        {provider.paymentCount === 1 ? "" : "s"} submitted
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(provider._id)}
                      >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void handleToggleActive(
                            provider._id,
                            provider.isActive
                          )
                        }
                      >
                        {provider.isActive ? "Hide" : "Activate"}
                      </Button>
                      {provider.paymentCount === 0 && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => void handleDelete(provider._id)}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
