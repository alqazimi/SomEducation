import { cn } from "@/lib/utils";
import { PageEyebrow, PageLead, PageTitle } from "@/components/ui/typography";

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-border pb-6", className)}>
      {eyebrow && <PageEyebrow>{eyebrow}</PageEyebrow>}
      <PageTitle className={eyebrow ? "mt-2" : undefined}>{title}</PageTitle>
      {description && <PageLead className="mt-2 max-w-2xl">{description}</PageLead>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
