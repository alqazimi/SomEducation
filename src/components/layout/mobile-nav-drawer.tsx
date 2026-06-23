"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  BookOpen,
  HelpCircle,
  Home,
  LayoutDashboard,
  Mail,
  Route,
  Search,
  X,
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DashboardRole,
  getDashboardHref,
  getNavForRole,
  isDashboardNavActive,
} from "@/lib/dashboard-nav";
import { PLATFORM_TAGLINE } from "@/lib/brand";
import { getSignInUrl, getSignUpUrl } from "@/lib/auth-urls";
import { useMarketingTheme } from "@/components/marketing/marketing-theme-provider";
import { cn } from "@/lib/utils";

const exploreLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/how-it-works", label: "How It Works", icon: Route },
  { href: "/contact", label: "Contact", icon: Mail },
  { href: "/support", label: "Help Center", icon: HelpCircle },
] as const;

function isExploreActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/courses") return pathname.startsWith("/courses");
  return pathname === href;
}

function DrawerLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
  dark,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
  onNavigate: () => void;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
        active
          ? dark
            ? "bg-brand-600/20 text-brand-300"
            : "bg-brand-50 text-brand-700"
          : dark
            ? "text-slate-300 hover:bg-white/5"
            : "text-stone-700 hover:bg-stone-50"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          active
            ? dark
              ? "text-brand-400"
              : "text-brand-600"
            : dark
              ? "text-slate-500"
              : "text-stone-500"
        )}
      />
      {label}
    </Link>
  );
}

function SectionLabel({
  children,
  dark,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <p
      className={cn(
        "px-4 pb-1 pt-3 text-xs font-medium uppercase tracking-wide first:pt-1",
        dark ? "text-slate-500" : "text-stone-400"
      )}
    >
      {children}
    </p>
  );
}

export function MobileNavDrawer({
  open,
  onClose,
  role,
  onSearch,
  variant = "default",
}: {
  open: boolean;
  onClose: () => void;
  role?: DashboardRole;
  onSearch?: () => void;
  variant?: "default" | "marketing" | "dashboard";
}) {
  const isMarketing = variant === "marketing";
  const isDashboardVariant = variant === "dashboard";
  const { isNight } = useMarketingTheme();
  const marketingDark = isMarketing && isNight;
  const dashboardDark = isDashboardVariant && isNight;
  const drawerDark = marketingDark || dashboardDark;
  const pathname = usePathname();
  const dashboardItems = role ? getNavForRole(role) : [];
  const dashboardHref = getDashboardHref(role);
  const signInUrl = getSignInUrl(pathname || "/dashboard");
  const signUpUrl = getSignUpUrl(pathname || "/dashboard");
  const { isSignedIn, isLoaded: clerkLoaded } = useAuth();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute left-0 top-0 flex h-full w-full max-w-sm flex-col shadow-xl",
          isMarketing
            ? "bg-marketing-panel text-marketing-fg"
            : drawerDark
              ? "bg-marketing-panel text-marketing-fg"
              : "bg-background text-foreground"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between border-b px-4 py-4",
            isMarketing || drawerDark ? "border-marketing-border" : "border-border"
          )}
        >
          <div>
            <p
              className={cn(
                "text-sm font-medium",
                isMarketing || drawerDark ? "text-marketing-fg" : "text-foreground"
              )}
            >
              Menu
            </p>
            <p
              className={cn(
                "text-xs",
                isMarketing || drawerDark ? "text-marketing-muted" : "text-muted-foreground"
              )}
            >
              {PLATFORM_TAGLINE}
            </p>
          </div>
          <button
            type="button"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-lg",
              isMarketing
                ? marketingDark
                  ? "text-slate-300 hover:bg-white/10"
                  : "text-stone-600 hover:bg-stone-100"
                : drawerDark
                  ? "text-slate-300 hover:bg-white/10"
                  : "text-stone-600 hover:bg-stone-100"
            )}
            aria-label="Close menu"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {onSearch && (
            <button
              type="button"
              onClick={() => {
                onSearch();
                onClose();
              }}
              className={cn(
                "mb-2 flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                isMarketing || drawerDark
                  ? "border-white/15 bg-white/5 text-slate-400 hover:bg-white/10"
                  : "border-border bg-muted text-muted-foreground hover:bg-muted"
              )}
            >
              <Search className="h-4 w-4 shrink-0" />
              Search e-learning courses…
            </button>
          )}

          <SectionLabel dark={drawerDark}>E-Learning</SectionLabel>
          {exploreLinks.map((link) => (
            <DrawerLink
              key={link.label}
              href={link.href}
              label={link.label}
              icon={link.icon}
              active={isExploreActive(pathname, link.href)}
              onNavigate={onClose}
              dark={drawerDark}
            />
          ))}

          {clerkLoaded && isSignedIn && dashboardItems.length > 0 && (
              <>
                <SectionLabel dark={drawerDark}>Dashboard</SectionLabel>
                <DrawerLink
                  href={dashboardHref}
                  label="Overview"
                  icon={LayoutDashboard}
                  active={
                    role
                      ? isDashboardNavActive(pathname, dashboardHref, role)
                      : false
                  }
                  onNavigate={onClose}
                  dark={drawerDark}
                />
                {dashboardItems
                  .filter((item) => item.href !== dashboardHref)
                  .map((item) => (
                    <DrawerLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      active={
                        role
                          ? isDashboardNavActive(pathname, item.href, role)
                          : false
                      }
                      onNavigate={onClose}
                      dark={drawerDark}
                    />
                  ))}
              </>
            )}
        </nav>

        <div
          className={cn(
            "border-t p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]",
            isMarketing || drawerDark ? "border-marketing-border" : "border-border"
          )}
        >
          {!(clerkLoaded && isSignedIn) && (
            <div className="flex flex-col gap-2">
              <Link href={signInUrl} className="w-full" onClick={onClose}>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full",
                    isMarketing &&
                      "border-white/20 bg-transparent text-white hover:bg-white/10"
                  )}
                >
                  Sign In
                </Button>
              </Link>
              <Link href={signUpUrl} className="w-full" onClick={onClose}>
                <Button className="w-full">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
