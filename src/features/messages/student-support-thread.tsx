"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  supportMessageFormSchema,
  supportReplySchema,
  type SupportMessageFormValues,
  type SupportReplyValues,
} from "@/schemas";
import { formatDate } from "@/lib/utils";

type ThreadMessage = {
  _id: Id<"messages">;
  subject: string;
  body: string;
  isRead: boolean;
  readAt?: number;
  editedAt?: number;
  createdAt: number;
  senderId: Id<"users">;
  recipientId: Id<"users">;
  audience?: "student_to_support" | "support_to_student";
  sender?: {
    firstName?: string;
    lastName?: string;
    role?: string;
  } | null;
};

function isFromSupport(
  message: ThreadMessage,
  studentId?: Id<"users">
) {
  if (message.audience === "support_to_student") return true;
  if (message.audience === "student_to_support") return false;
  return (
    studentId !== undefined &&
    message.recipientId === studentId &&
    message.senderId !== studentId
  );
}

function MessageBubble({
  message,
  isOwn,
  fromSupport,
  onEdit,
  onDelete,
}: {
  message: ThreadMessage;
  isOwn: boolean;
  fromSupport: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const senderName = fromSupport
    ? "SomEducation Support"
    : message.sender
      ? `${message.sender.firstName ?? ""} ${message.sender.lastName ?? ""}`.trim()
      : "You";

  return (
    <div
      className={`rounded-lg border p-4 ${
        fromSupport
          ? "border-brand-300 bg-brand-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-slate-900">{message.subject}</p>
          <p className="text-xs text-slate-500">
            {isOwn ? "You" : senderName} · {formatDate(message.createdAt)}
            {fromSupport && !isOwn && " · Reply from support"}
            {message.editedAt && " · edited"}
          </p>
        </div>
        {isOwn && !message.isRead && onEdit && onDelete && (
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={onEdit}>
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        )}
      </div>
      <p className="mt-3 text-sm whitespace-pre-wrap text-slate-700">
        {message.body}
      </p>
      {message.isRead && (
        <p className="mt-2 text-xs text-slate-400">
          Read · auto-deletes 24 hours after read
        </p>
      )}
    </div>
  );
}

export function StudentSupportThread() {
  const data = useQuery(api.messages.getMySupportThread);
  const me = useQuery(api.users.getMe);
  const sendToSupport = useMutation(api.messages.sendToSupport);
  const markThreadRead = useMutation(api.messages.markThreadRead);
  const editMessage = useMutation(api.messages.editMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);

  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

  const newMessageForm = useForm<SupportMessageFormValues>({
    resolver: zodResolver(supportMessageFormSchema),
    defaultValues: { subject: "", body: "" },
  });

  const editForm = useForm<SupportReplyValues>({
    resolver: zodResolver(supportReplySchema),
    defaultValues: { body: "" },
  });

  const thread = data?.thread;
  const messages = data?.messages ?? [];
  const threadId = thread?._id;

  useEffect(() => {
    void markThreadRead(threadId ? { threadId } : {});
  }, [threadId, markThreadRead]);

  async function handleNewMessage(values: SupportMessageFormValues) {
    try {
      await sendToSupport(values);
      toast.success("Message sent to support");
      newMessageForm.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send");
    }
  }

  async function handleEdit(messageId: Id<"messages">) {
    const body = editForm.getValues("body");
    try {
      await editMessage({ messageId, body });
      toast.success("Message updated");
      setEditingId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to edit");
    }
  }

  async function handleDelete(messageId: Id<"messages">) {
    try {
      await deleteMessage({ messageId });
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    }
  }

  if (data === undefined || me === undefined) {
    return <p className="text-sm text-slate-500">Loading messages...</p>;
  }

  if (data === null) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-slate-600">
          Messages are unavailable for suspended accounts. Contact us by email if
          you need help.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {messages.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Message support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-slate-600">
              Send a message to our support team. All administrators can see your
              message and reply here.
            </p>
            <form
              onSubmit={newMessageForm.handleSubmit(handleNewMessage)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  className="mt-1"
                  {...newMessageForm.register("subject")}
                />
                {newMessageForm.formState.errors.subject && (
                  <p className="mt-1 text-sm text-red-600">
                    {newMessageForm.formState.errors.subject.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  className="mt-1"
                  rows={5}
                  {...newMessageForm.register("body")}
                />
                {newMessageForm.formState.errors.body && (
                  <p className="mt-1 text-sm text-red-600">
                    {newMessageForm.formState.errors.body.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={newMessageForm.formState.isSubmitting}
              >
                {newMessageForm.formState.isSubmitting
                  ? "Sending..."
                  : "Send to support"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.senderId === me?._id;
              const fromSupport = isFromSupport(message, me?._id);
              if (editingId === message._id) {
                return (
                  <Card key={message._id}>
                    <CardContent className="pt-6 space-y-3">
                      <Textarea
                        rows={4}
                        {...editForm.register("body")}
                        defaultValue={message.body}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => void handleEdit(message._id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwn={isOwn}
                  fromSupport={fromSupport}
                  onEdit={() => {
                    editForm.setValue("body", message.body);
                    setEditingId(message._id);
                  }}
                  onDelete={() => void handleDelete(message._id)}
                />
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Send another message</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={newMessageForm.handleSubmit(handleNewMessage)}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="followup-subject">Subject</Label>
                  <Input
                    id="followup-subject"
                    className="mt-1"
                    {...newMessageForm.register("subject")}
                  />
                </div>
                <div>
                  <Label htmlFor="followup-body">Message</Label>
                  <Textarea
                    id="followup-body"
                    className="mt-1"
                    rows={4}
                    {...newMessageForm.register("body")}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={newMessageForm.formState.isSubmitting}
                >
                  Send to support
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
