import { cn } from "@/lib/utils";
import { type } from "@/lib/typography";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("border-b border-border bg-white", className)}>
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            {eyebrow && <p className={type.eyebrow}>{eyebrow}</p>}
            <h1
              className={cn(
                type.pageTitle,
                eyebrow ? "mt-2" : undefined
              )}
            >
              {title}
            </h1>
            {description && (
              <p className={cn(type.lead, "mt-2 max-w-xl")}>{description}</p>
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
