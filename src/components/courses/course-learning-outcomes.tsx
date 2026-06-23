import { CheckCircle2 } from "lucide-react";
import { marketingCardClass } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";

type CourseLearningOutcomesProps = {
  outcomes: string[];
  className?: string;
  variant?: "card" | "plain";
};

export function CourseLearningOutcomes({
  outcomes,
  className,
  variant = "card",
}: CourseLearningOutcomesProps) {
  if (outcomes.length === 0) return null;

  const content = (
    <>
      <h2 className="text-base font-semibold text-white sm:text-lg">
        What you&apos;ll learn
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {outcomes.map((outcome, index) => (
          <li key={`${index}-${outcome}`} className="flex gap-2.5 text-sm leading-relaxed">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
            <span className="text-slate-300">{outcome}</span>
          </li>
        ))}
      </ul>
    </>
  );

  if (variant === "plain") {
    return <div className={className}>{content}</div>;
  }

  return (
    <div className={cn(marketingCardClass, "p-5 sm:p-6", className)}>
      {content}
    </div>
  );
}
