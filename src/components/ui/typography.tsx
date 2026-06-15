import { cn } from "@/lib/utils";
import { type } from "@/lib/typography";

export function PageTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h1 className={cn(type.pageTitle, className)}>{children}</h1>;
}

export function PageEyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn(type.eyebrow, className)}>{children}</p>;
}

export function PageLead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn(type.lead, className)}>{children}</p>;
}

export function SectionTitle({
  children,
  className,
  as: Tag = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h2" | "h3" | "h4";
}) {
  return <Tag className={cn(type.sectionTitle, className)}>{children}</Tag>;
}

export function Muted({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn(type.muted, className)}>{children}</p>;
}
