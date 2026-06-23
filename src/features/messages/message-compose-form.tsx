"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
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
import { messageFormSchema, type MessageFormValues } from "@/schemas";

type MessageComposeFormProps = {
  defaultRecipientId?: string;
  onSent?: () => void;
  onCancel?: () => void;
};

export function MessageComposeForm({
  defaultRecipientId,
  onSent,
  onCancel,
}: MessageComposeFormProps) {
  const me = useQuery(api.users.getMe);
  const recipients = useQuery(api.messages.listMessageRecipients, {});
  const send = useMutation(api.messages.send);
  const sendAsAdmin = useMutation(api.messages.sendAsAdmin);

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      recipientId: defaultRecipientId ?? "",
      subject: "",
      body: "",
    },
  });

  const isAdmin = me?.role === "admin" || me?.role === "owner";
  const singleRecipient =
    recipients?.length === 1 && !isAdmin ? recipients[0] : null;
  const recipientId = useWatch({
    control: form.control,
    name: "recipientId",
  });

  useEffect(() => {
    if (singleRecipient) {
      form.setValue("recipientId", singleRecipient._id);
    } else if (defaultRecipientId) {
      form.setValue("recipientId", defaultRecipientId);
    }
  }, [singleRecipient, defaultRecipientId, form]);

  async function onSubmit(data: MessageFormValues) {
    try {
      const payload = {
        recipientId: data.recipientId as Id<"users">,
        subject: data.subject,
        body: data.body,
      };

      if (me?.role === "admin" || me?.role === "owner") {
        await sendAsAdmin(payload);
      } else {
        await send(payload);
      }

      toast.success("Message sent");
      form.reset({
        recipientId: defaultRecipientId ?? "",
        subject: "",
        body: "",
      });
      onSent?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="recipient">To</Label>
        {recipients === undefined ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading recipients...</p>
        ) : recipients.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No recipients available.
          </p>
        ) : recipients.length === 1 && !isAdmin ? (
          <p className="mt-2 text-sm text-foreground/90">
            {recipients[0].firstName} {recipients[0].lastName} (
            {recipients[0].email})
          </p>
        ) : (
          <Select
            value={recipientId}
            onValueChange={(value) => form.setValue("recipientId", value)}
          >
            <SelectTrigger id="recipient" className="mt-1">
              <SelectValue placeholder="Select recipient" />
            </SelectTrigger>
            <SelectContent>
              {recipients.map((recipient) => (
                <SelectItem key={recipient._id} value={recipient._id}>
                  {recipient.firstName} {recipient.lastName} · {recipient.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {form.formState.errors.recipientId && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.recipientId.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" className="mt-1" {...form.register("subject")} />
        {form.formState.errors.subject && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.subject.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="body">Message</Label>
        <Textarea
          id="body"
          className="mt-1"
          rows={5}
          {...form.register("body")}
        />
        {form.formState.errors.body && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.body.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={
            form.formState.isSubmitting ||
            recipients === undefined ||
            recipients.length === 0
          }
        >
          {form.formState.isSubmitting ? "Sending..." : "Send message"}
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
