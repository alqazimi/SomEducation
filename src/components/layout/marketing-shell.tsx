import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { marketingPageClass } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";

export function MarketingShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(marketingPageClass, className)}>
      <Header />
      <main className="pb-8 pt-5 sm:pt-7">{children}</main>
      <Footer />
    </div>
  );
}
