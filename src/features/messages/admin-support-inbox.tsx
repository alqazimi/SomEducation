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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  supportMessageFormSchema,
  supportReplySchema,
  type SupportMessageFormValues,
  type SupportReplyValues,
} from "@/schemas";
import { formatDate } from "@/lib/utils";

function studentLabel(student: {
  firstName?: string;
  lastName?: string;
  email: string;
}) {
  const name = `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim();
  return name ? `${name} · ${student.email}` : student.email;
}

export function AdminSupportInbox() {
  const threads = useQuery(api.messages.listSupportThreads);
  const students = useQuery(api.messages.listStudentsForMessaging, {});
  const me = useQuery(api.users.getMe);

  const [selectedThreadId, setSelectedThreadId] =
    useState<Id<"supportThreads"> | null>(null);
  const [showNewThread, setShowNewThread] = useState(false);
  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

  const threadDetail = useQuery(
    api.messages.getSupportThread,
    selectedThreadId ? { threadId: selectedThreadId } : "skip"
  );

  const replyInThread = useMutation(api.messages.replyInThread);
  const startThreadWithStudent = useMutation(api.messages.startThreadWithStudent);
  const markThreadRead = useMutation(api.messages.markThreadRead);
  const editMessage = useMutation(api.messages.editMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);

  const replyForm = useForm<SupportReplyValues>({
    resolver: zodResolver(supportReplySchema),
    defaultValues: { body: "" },
  });

  const [newStudentId, setNewStudentId] = useState("");
  const newMessageForm = useForm<SupportMessageFormValues>({
    resolver: zodResolver(supportMessageFormSchema),
    defaultValues: { subject: "", body: "" },
  });

  const editForm = useForm<SupportReplyValues>({
    resolver: zodResolver(supportReplySchema),
    defaultValues: { body: "" },
  });

  useEffect(() => {
    if (selectedThreadId) {
      void markThreadRead({ threadId: selectedThreadId });
    }
  }, [selectedThreadId, markThreadRead]);

  async function handleReply(values: SupportReplyValues) {
    if (!selectedThreadId) return;
    try {
      await replyInThread({ threadId: selectedThreadId, body: values.body });
      toast.success("Reply sent");
      replyForm.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send");
    }
  }

  async function handleNewThread(values: SupportMessageFormValues) {
    if (!newStudentId) {
      toast.error("Select a student");
      return;
    }
    try {
      const result = await startThreadWithStudent({
        studentId: newStudentId as Id<"users">,
        subject: values.subject,
        body: values.body,
      });
      toast.success("Message sent");
      newMessageForm.reset();
      setNewStudentId("");
      setShowNewThread(false);
      setSelectedThreadId(result.threadId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send");
    }
  }

  async function handleEdit(messageId: Id<"messages">) {
    try {
      await editMessage({ messageId, body: editForm.getValues("body") });
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

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Student conversations</h2>
          <Button size="sm" onClick={() => setShowNewThread((v) => !v)}>
            {showNewThread ? "Cancel" : "Message student"}
          </Button>
        </div>

        {showNewThread && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New message to student</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Student</Label>
                <Select value={newStudentId} onValueChange={setNewStudentId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students?.map((student) => (
                      <SelectItem key={student._id} value={student._id}>
                        {studentLabel(student)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <form
                onSubmit={newMessageForm.handleSubmit(handleNewThread)}
                className="space-y-3"
              >
                <div>
                  <Label htmlFor="new-subject">Subject</Label>
                  <Input
                    id="new-subject"
                    className="mt-1"
                    {...newMessageForm.register("subject")}
                  />
                </div>
                <div>
                  <Label htmlFor="new-body">Message</Label>
                  <Textarea
                    id="new-body"
                    className="mt-1"
                    rows={4}
                    {...newMessageForm.register("body")}
                  />
                </div>
                <Button type="submit" size="sm">Send</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {!threads ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : threads.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-slate-500">
              No student conversations yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {threads.map((thread) => {
              const student = thread.student;
              if (!student) return null;
              const active = selectedThreadId === thread._id;
              return (
                <button
                  key={thread._id}
                  type="button"
                  onClick={() => setSelectedThreadId(thread._id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    active
                      ? "border-slate-900 bg-slate-50"
                      : "border-border hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-900 text-sm">
                      {studentLabel(student)}
                    </p>
                    {thread.unreadCount > 0 && (
                      <Badge variant="default">{thread.unreadCount}</Badge>
                    )}
                  </div>
                  {thread.lastMessage && (
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {thread.lastMessage.body}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(thread.lastMessageAt)}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        {!selectedThreadId ? (
          <Card>
            <CardContent className="py-16 text-center text-sm text-slate-500">
              Select a conversation to view messages and reply.
            </CardContent>
          </Card>
        ) : threadDetail === undefined ? (
          <p className="text-sm text-slate-500">Loading conversation...</p>
        ) : !threadDetail ? (
          <Card>
            <CardContent className="py-16 text-center text-sm text-slate-500">
              Conversation not found.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {threadDetail.student
                    ? studentLabel(threadDetail.student)
                    : "Student"}
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Shared inbox — all admins and owners see this thread.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {threadDetail.messages.map((message) => {
                  const isOwn = message.senderId === me?._id;
                  const fromStudent =
                    message.audience === "student_to_support";

                  if (editingId === message._id) {
                    return (
                      <div key={message._id} className="space-y-2 rounded-lg border p-4">
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
                      </div>
                    );
                  }

                  return (
                    <div
                      key={message._id}
                      className={`rounded-lg border p-4 ${
                        fromStudent
                          ? "border-brand-200 bg-brand-50/40"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-900">
                            {message.subject}
                          </p>
                          <p className="text-xs text-slate-500">
                            {fromStudent
                              ? studentLabel(
                                  threadDetail.student ?? {
                                    email: "student",
                                    firstName: "Student",
                                  }
                                )
                              : message.sender
                                ? `${message.sender.firstName ?? ""} ${message.sender.lastName ?? ""}`.trim() ||
                                  "Admin"
                                : "Admin"}
                            · {formatDate(message.createdAt)}
                          </p>
                        </div>
                        {isOwn && !message.isRead && (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                editForm.setValue("body", message.body);
                                setEditingId(message._id);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => void handleDelete(message._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="mt-3 text-sm whitespace-pre-wrap text-slate-700">
                        {message.body}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reply to student</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={replyForm.handleSubmit(handleReply)}
                  className="space-y-3"
                >
                  <Textarea
                    rows={4}
                    placeholder="Type your reply..."
                    {...replyForm.register("body")}
                  />
                  <Button type="submit" disabled={replyForm.formState.isSubmitting}>
                    {replyForm.formState.isSubmitting ? "Sending..." : "Send reply"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
