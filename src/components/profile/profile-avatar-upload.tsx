"use client";

import { useMutation } from "convex/react";
import { useRef, useState } from "react";
import { Camera, User } from "lucide-react";
import { toast } from "sonner";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { cn, getInitials } from "@/lib/utils";
import { IMAGE_ACCEPT, uploadFileToConvex } from "@/lib/upload-convex-file";
import { getConvexErrorMessage } from "@/lib/convex-error";

type ProfileAvatarUploadProps = {
  imageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  className?: string;
  onImageChange?: (imageUrl?: string) => void;
};

export function ProfileAvatarUpload({
  imageUrl,
  firstName,
  lastName,
  email,
  className,
  onImageChange,
}: ProfileAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrlMutation);
  const updateProfile = useMutation(api.users.updateProfile);

  const displayUrl = localPreview ?? imageUrl ?? null;
  const initials = getInitials(
    firstName ?? undefined,
    lastName ?? undefined,
    email ?? undefined
  );

  async function handleFileChange(file: File) {
    setUploading(true);
    try {
      const storageId = await uploadFileToConvex(
        () => generateUploadUrl(),
        file
      );
      const preview = URL.createObjectURL(file);
      setLocalPreview(preview);
      await updateProfile({ profileImageStorageId: storageId as Id<"_storage"> });
      onImageChange?.(preview);
      toast.success("Profile photo updated");
    } catch (error) {
      toast.error(getConvexErrorMessage(error, "Could not upload photo"));
      setLocalPreview(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setUploading(true);
    try {
      await updateProfile({ removeProfileImage: true });
      setLocalPreview(null);
      onImageChange?.(undefined);
      toast.success("Profile photo removed");
    } catch (error) {
      toast.error(getConvexErrorMessage(error, "Could not remove photo"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={cn("flex flex-col items-start gap-4 sm:flex-row sm:items-center", className)}>
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-2xl font-semibold text-brand-600">
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayUrl}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted disabled:opacity-50"
          aria-label="Upload profile photo"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Profile photo</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Upload a square image. PNG, JPG, or WEBP up to 5MB.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <User className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload photo"}
          </Button>
          {displayUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={() => void handleRemove()}
            >
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        disabled={uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFileChange(file);
        }}
      />
    </div>
  );
}
