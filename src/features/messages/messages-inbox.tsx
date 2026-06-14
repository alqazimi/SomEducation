"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export function MessagesInbox() {
  const messages = useQuery(api.messages.inbox);
  const markRead = useMutation(api.messages.markRead);

  return (
    <div>
      <h1 className="text-2xl font-bold">Messages</h1>
      <p className="mt-1 text-slate-500">Your inbox</p>

      <div className="mt-8 space-y-4">
        {!messages ? (
          <p>Loading...</p>
        ) : messages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              No messages
            </CardContent>
          </Card>
        ) : (
          messages.map((msg) => (
            <Card
              key={msg._id}
              className={msg.isRead ? "opacity-75" : ""}
              onClick={() => !msg.isRead && markRead({ messageId: msg._id })}
            >
              <CardHeader>
                <CardTitle className="text-base">{msg.subject}</CardTitle>
                <p className="text-sm text-slate-500">
                  From {msg.sender?.firstName} {msg.sender?.lastName} ·{" "}
                  {formatDate(msg.createdAt)}
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
