"use client";

import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { LogOut, User } from "lucide-react";
import { useState } from "react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { cn, getInitials } from "@/lib/utils";
import { getDashboardHref } from "@/lib/dashboard-nav";
import Link from "next/link";

export function UserAccountMenu({ dark }: { dark?: boolean }) {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getMe, {});
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const dashboardHref = getDashboardHref(user.role);
  const initials = getInitials(user.firstName, user.lastName, user.email);
  const profileImageUrl = user.profileImageUrl;

  async function handleSignOut() {
    await signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={cn(
          "flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-xs font-semibold sm:h-9 sm:w-9",
          profileImageUrl
            ? "ring-1 ring-border"
            : dark
              ? "bg-brand-600/30 text-brand-200 ring-1 ring-white/20"
              : "bg-brand-100 text-brand-700 ring-1 ring-brand-200"
        )}
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profileImageUrl}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close account menu"
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              "absolute right-0 z-50 mt-2 w-52 rounded-lg border p-1 shadow-lg",
              dark
                ? "border-white/10 bg-slate-900"
                : "border-border bg-card"
            )}
          >
            <div
              className={cn(
                "border-b px-3 py-2 text-xs",
                dark ? "border-white/10 text-slate-400" : "border-border text-muted-foreground"
              )}
            >
              <p className="truncate font-medium text-foreground">
                {[user.firstName, user.lastName].filter(Boolean).join(" ") ||
                  user.email}
              </p>
              {user.email ? (
                <p className="truncate">{user.email}</p>
              ) : null}
            </div>
            <Link
              href="/dashboard/profile"
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm",
                dark
                  ? "text-slate-200 hover:bg-white/10"
                  : "text-foreground hover:bg-muted"
              )}
              onClick={() => setOpen(false)}
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <Link
              href={dashboardHref}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm",
                dark
                  ? "text-slate-200 hover:bg-white/10"
                  : "text-foreground hover:bg-muted"
              )}
              onClick={() => setOpen(false)}
            >
              <User className="h-4 w-4" />
              Dashboard
            </Link>
            <Button
              variant="ghost"
              className={cn(
                "h-auto w-full justify-start gap-2 px-3 py-2 text-sm font-normal",
                dark
                  ? "text-slate-200 hover:bg-white/10"
                  : "text-foreground hover:bg-muted"
              )}
              onClick={() => void handleSignOut()}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
