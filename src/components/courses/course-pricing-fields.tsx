"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type CoursePricingFieldsProps = {
  regularPrice: string;
  salePrice: string;
  onRegularPriceChange: (value: string) => void;
  onSalePriceChange: (value: string) => void;
  regularPriceError?: string;
  salePriceError?: string;
  className?: string;
};

function parseAmount(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

export function CoursePricingFields({
  regularPrice,
  salePrice,
  onRegularPriceChange,
  onSalePriceChange,
  regularPriceError,
  salePriceError,
  className,
}: CoursePricingFieldsProps) {
  const regular = parseAmount(regularPrice);
  const sale = parseAmount(salePrice);
  const hasDiscount =
    regular !== null && sale !== null && regular > sale && sale >= 0;
  const discountPercent =
    hasDiscount && regular > 0
      ? Math.round((1 - sale / regular) * 100)
      : 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <p className="text-sm font-medium text-slate-900">Pricing</p>
        <p className="mt-1 text-sm text-slate-500">
          Set a regular price and optional sale price — like WordPress / WooCommerce.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="regularPrice">Regular price (USD)</Label>
          <Input
            id="regularPrice"
            type="number"
            min="0"
            step="0.01"
            value={regularPrice}
            onChange={(e) => onRegularPriceChange(e.target.value)}
            placeholder="e.g. 99.00"
            className="mt-2"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            The original price shown with a strikethrough when on sale.
          </p>
          {regularPriceError && (
            <p className="mt-1.5 text-sm text-red-600">{regularPriceError}</p>
          )}
        </div>

        <div>
          <Label htmlFor="salePrice">Sale price (USD)</Label>
          <Input
            id="salePrice"
            type="number"
            min="0"
            step="0.01"
            value={salePrice}
            onChange={(e) => onSalePriceChange(e.target.value)}
            placeholder="e.g. 49.00"
            className="mt-2"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            What students pay now. Use 0 for a free course.
          </p>
          {salePriceError && (
            <p className="mt-1.5 text-sm text-red-600">{salePriceError}</p>
          )}
        </div>
      </div>

      {hasDiscount && discountPercent > 0 && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          On sale — {discountPercent}% off (was ${regular.toFixed(2)}, now $
          {sale.toFixed(2)})
        </p>
      )}

      {regular !== null && sale !== null && regular > 0 && regular <= sale && (
        <p className="text-xs text-amber-700">
          Regular price must be higher than sale price to show a discount.
        </p>
      )}
    </div>
  );
}

export function parseCoursePricing(regularPrice: string, salePrice: string) {
  const sale = Number(salePrice);
  const regularRaw = regularPrice.trim();
  const regular =
    regularRaw === "" ? undefined : Number(regularPrice);

  if (!Number.isFinite(sale) || sale < 0) {
    return { error: "Enter a valid sale price" as const };
  }
  if (regularRaw !== "" && (!Number.isFinite(regular!) || regular! < 0)) {
    return { error: "Enter a valid regular price" as const };
  }
  if (regular !== undefined && regular <= sale) {
    return {
      error: "Regular price must be higher than sale price for a discount",
    } as const;
  }

  return {
    price: sale,
    compareAtPrice: regular,
  } as const;
}
