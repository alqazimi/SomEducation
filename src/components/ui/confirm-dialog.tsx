"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: (inputValue?: string) => void | Promise<void>;
  loading?: boolean;
  inputMode?: "none" | "text" | "textarea";
  inputLabel?: string;
  inputPlaceholder?: string;
  defaultInputValue?: string;
  requiredInput?: boolean;
};

type ConfirmDialogPanelProps = Omit<ConfirmDialogProps, "open">;

function ConfirmDialogPanel({
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  loading = false,
  inputMode = "none",
  inputLabel,
  inputPlaceholder,
  defaultInputValue = "",
  requiredInput = false,
}: ConfirmDialogPanelProps) {
  const [inputValue, setInputValue] = useState(defaultInputValue);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onOpenChange]);

  async function handleConfirm() {
    if (requiredInput && !inputValue.trim()) return;
    await onConfirm(inputMode === "none" ? undefined : inputValue.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close dialog"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-xl"
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-semibold text-slate-900"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{description}</p>

        {inputMode !== "none" && (
          <div className="mt-4">
            {inputLabel && <Label className="mb-2 block">{inputLabel}</Label>}
            {inputMode === "textarea" ? (
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={inputPlaceholder}
                rows={3}
              />
            ) : (
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={inputPlaceholder}
              />
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            disabled={
              loading || (requiredInput && inputMode !== "none" && !inputValue.trim())
            }
            onClick={() => void handleConfirm()}
          >
            {loading ? "Please wait..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  defaultInputValue = "",
  ...props
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <ConfirmDialogPanel
      key={defaultInputValue}
      defaultInputValue={defaultInputValue}
      {...props}
    />
  );
}
