"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { MessageComposeForm } from "@/features/messages/message-compose-form";
import { StudentSupportThread } from "@/features/messages/student-support-thread";
import { AdminSupportInbox } from "@/features/messages/admin-support-inbox";

type MessagesView = "inbox" | "sent" | "compose";

function TeacherMessagesInbox() {
  const [view, setView] = useState<MessagesView>("inbox");
  const inbox = useQuery(api.messages.inbox);
  const sent = useQuery(api.messages.sent);
  const markRead = useMutation(api.messages.markRead);

  const messages = view === "sent" ? sent : inbox;

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={view === "inbox" ? "default" : "outline"}
          onClick={() => setView("inbox")}
        >
          Inbox
        </Button>
        <Button
          size="sm"
          variant={view === "sent" ? "default" : "outline"}
          onClick={() => setView("sent")}
        >
          Sent
        </Button>
        {view !== "compose" && (
          <Button size="sm" variant="outline" onClick={() => setView("compose")}>
            New message
          </Button>
        )}
      </div>

      <div className="mt-8 space-y-4">
        {view === "compose" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compose message</CardTitle>
            </CardHeader>
            <CardContent>
              <MessageComposeForm
                onSent={() => setView("sent")}
                onCancel={() => setView("inbox")}
              />
            </CardContent>
          </Card>
        ) : !messages ? (
          <p>Loading...</p>
        ) : messages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {view === "sent" ? "No sent messages" : "No messages"}
            </CardContent>
          </Card>
        ) : (
          messages.map((msg) => (
            <Card
              key={msg._id}
              className={view === "inbox" && msg.isRead ? "opacity-75" : ""}
              onClick={() =>
                view === "inbox" &&
                !msg.isRead &&
                markRead({ messageId: msg._id })
              }
            >
              <CardHeader>
                <CardTitle className="text-base">{msg.subject}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {view === "sent" ? (
                    <>
                      To{" "}
                      {"recipient" in msg && msg.recipient
                        ? `${msg.recipient.firstName} ${msg.recipient.lastName}`
                        : "recipient"}{" "}
                      · {formatDate(msg.createdAt)}
                    </>
                  ) : (
                    <>
                      From{" "}
                      {"sender" in msg && msg.sender
                        ? `${msg.sender.firstName} ${msg.sender.lastName}`
                        : "sender"}{" "}
                      · {formatDate(msg.createdAt)}
                    </>
                  )}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}

export function MessagesInbox() {
  const me = useQuery(api.users.getMe);

  const isStudent = me?.role === "student";
  const isAdmin = me?.role === "admin" || me?.role === "owner";

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Inbox"
        title="Messages"
        description={
          isStudent
            ? "Contact platform support anytime. All administrators share this inbox."
            : isAdmin
              ? "Shared support inbox for all student conversations."
              : "Message students or administrators."
        }
      />

      {me === undefined ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading...</p>
      ) : isStudent ? (
        <div className="mt-8">
          <StudentSupportThread />
        </div>
      ) : isAdmin ? (
        <div className="mt-8">
          <AdminSupportInbox />
        </div>
      ) : (
        <TeacherMessagesInbox />
      )}
    </div>
  );
}
