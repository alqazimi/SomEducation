import { marketingBackgroundClass } from "@/lib/marketing-theme";
import { type } from "@/lib/typography";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "marketing";
};

export function PageHeader({
  title,
  description,
  eyebrow,
  children,
  className,
  variant = "default",
}: PageHeaderProps) {
  const isMarketing = variant === "marketing";

  return (
    <div
      className={cn(
        "border-b",
        isMarketing
          ? `border-marketing-border ${marketingBackgroundClass}`
          : "border-border bg-white",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            {eyebrow && (
              <p
                className={cn(
                  type.eyebrow,
                  isMarketing && "text-brand-600"
                )}
              >
                {eyebrow}
              </p>
            )}
            <h1
              className={cn(
                type.pageTitle,
                isMarketing && "text-marketing-fg",
                eyebrow ? "mt-2" : undefined
              )}
            >
              {title}
            </h1>
            {description && (
              <p
                className={cn(
                  type.lead,
                  "mt-2 max-w-xl",
                  isMarketing && "text-marketing-muted"
                )}
              >
                {description}
              </p>
            )}
          </div>
          {children && (
            <div className="w-full shrink-0 lg:max-w-md">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}
