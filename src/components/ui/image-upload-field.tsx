"use client";

import { useMutation } from "convex/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IMAGE_ACCEPT, uploadFileToConvex } from "@/lib/upload-convex-file";

type ImageUploadFieldProps = {
  label?: string;
  previewUrl?: string | null;
  onUploaded: (storageId: Id<"_storage">, previewUrl: string) => void;
  onClear?: () => void;
  onUploadingChange?: (uploading: boolean) => void;
  showUploadSuccessToast?: boolean;
};

export function ImageUploadField({
  label = "Cover Image",
  previewUrl,
  onUploaded,
  onClear,
  onUploadingChange,
  showUploadSuccessToast = true,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrlMutation);

  const displayPreview = localPreview ?? previewUrl ?? null;

  async function handleFileChange(file: File) {
    setUploading(true);
    onUploadingChange?.(true);
    try {
      const storageId = await uploadFileToConvex(
        () => generateUploadUrl(),
        file
      );
      const objectUrl = URL.createObjectURL(file);
      setLocalPreview(objectUrl);
      onUploaded(storageId, objectUrl);
      if (showUploadSuccessToast) {
        toast.success("Image uploaded");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleClear() {
    setLocalPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    onClear?.();
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-32 w-full max-w-xs items-center justify-center overflow-hidden rounded-lg border border-border bg-slate-50">
          {displayPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayPreview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="px-4 text-center text-xs text-slate-400">
              No image selected
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFileChange(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
          {displayPreview && onClear && (
            <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
              Remove
            </Button>
          )}
          <p className="text-xs text-slate-500">PNG, JPG, or WEBP · max 5MB</p>
        </div>
      </div>
    </div>
  );
}
