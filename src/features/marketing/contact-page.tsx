"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PLATFORM_NAME, PLATFORM_SUPPORT_EMAIL } from "@/lib/brand";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { marketingCardClass } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";

const SUBJECT_OPTIONS = [
  "General question",
  "Payment help",
  "Course access",
  "Refund request",
  "Technical issue",
  "Other",
] as const;

export function ContactPage() {
  const settings = useQuery(api.settings.get);
  const submitInquiry = useMutation(api.contact.submitInquiry);
  const supportEmail = settings?.supportEmail ?? PLATFORM_SUPPORT_EMAIL;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState<string>(SUBJECT_OPTIONS[0]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      await submitInquiry({
        name: name.trim(),
        email: email.trim(),
        subject,
        message: message.trim(),
      });
      toast.success("Message sent. We will reply by email soon.");
      setName("");
      setEmail("");
      setSubject(SUBJECT_OPTIONS[0]);
      setMessage("");
    } catch (error) {
      toast.error(getConvexErrorMessage(error, "Could not send message. Try email instead."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MarketingShell>
      <PageHeader
        variant="marketing"
        eyebrow="Get in touch"
        title="Contact us"
        description={`Send a message to the ${PLATFORM_NAME} team. We usually reply within one business day.`}
      />

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Card className={cn(marketingCardClass, "shadow-none")}>
          <CardContent className="flex items-start gap-4 p-6">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
            <div>
              <p className="text-sm font-medium text-marketing-fg">Email</p>
              <p className="mt-1 text-sm leading-relaxed text-marketing-muted">
                Prefer email? Write to{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  className="font-medium text-brand-400 hover:underline"
                >
                  {supportEmail}
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(marketingCardClass, "shadow-none")}>
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-base font-semibold text-marketing-fg">
              Send us a message
            </h2>
            <p className="mt-1 text-sm text-marketing-muted">
              For payment steps, visit the{" "}
              <Link href="/support" className="font-medium text-brand-400 hover:underline">
                Help Center
              </Link>
              . For returns, see our{" "}
              <Link href="/returns" className="font-medium text-brand-400 hover:underline">
                Return Policy
              </Link>
              .
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="text-marketing-fg">
                    Name
                  </Label>
                  <Input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="border-marketing-border bg-marketing-elevated text-marketing-fg"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-marketing-fg">
                    Email
                  </Label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="border-marketing-border bg-marketing-elevated text-marketing-fg"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-subject" className="text-marketing-fg">
                  Subject
                </Label>
                <select
                  id="contact-subject"
                  name="subject"
                  required
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="flex h-10 w-full rounded-lg border border-marketing-border bg-marketing-elevated px-3 text-sm text-marketing-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  {SUBJECT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message" className="text-marketing-fg">
                  Message
                </Label>
                <Textarea
                  id="contact-message"
                  name="message"
                  required
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="min-h-[140px] border-marketing-border bg-marketing-elevated text-marketing-fg"
                  placeholder="How can we help?"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="h-10 rounded-lg px-5"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Sending…" : "Send message"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-marketing-muted">
          Signed in? You can also message support from{" "}
          <Link href="/dashboard/messages" className="font-medium text-brand-400 hover:underline">
            Dashboard → Messages
          </Link>
          .
        </p>
      </div>
    </MarketingShell>
  );
}
