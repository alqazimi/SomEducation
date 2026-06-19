"use client";

import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export function DragHandle({
  draggable = true,
  onDragStart,
  onDragEnd,
  className,
  label = "Drag to reorder",
}: {
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent) => void;
  onDragEnd?: () => void;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      aria-label={label}
      className={cn(
        "rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600",
        draggable && "cursor-grab active:cursor-grabbing",
        className
      )}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
}

export function reorderDropClass(isDropTarget: boolean, isDragging: boolean) {
  return cn(
    isDragging && "opacity-50",
    isDropTarget && "ring-2 ring-brand-400 ring-offset-1"
  );
}
