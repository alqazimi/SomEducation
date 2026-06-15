"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { MessageComposeForm } from "@/features/messages/message-compose-form";

type MessagesView = "inbox" | "sent" | "compose";

export function MessagesInbox() {
  const [view, setView] = useState<MessagesView>("inbox");
  const inbox = useQuery(api.messages.inbox);
  const sent = useQuery(api.messages.sent);
  const markRead = useMutation(api.messages.markRead);

  const messages = view === "sent" ? sent : inbox;

  return (
    <div>
      <DashboardPageHeader
        eyebrow="Inbox"
        title="Messages"
        description="Send questions to support or read replies from administrators."
      >
        {view !== "compose" && (
          <Button size="sm" onClick={() => setView("compose")}>
            New message
          </Button>
        )}
      </DashboardPageHeader>

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
            <CardContent className="py-12 text-center text-slate-500">
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
                <p className="text-sm text-slate-500">
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
    </div>
  );
}
