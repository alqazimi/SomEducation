"use client";

import { useCallback, useState } from "react";

type DragReorderHandlers = {
  dragIndex: number | null;
  overIndex: number | null;
  onDragStart: (index: number) => (event: React.DragEvent) => void;
  onDragOver: (index: number) => (event: React.DragEvent) => void;
  onDrop: (index: number) => (event: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging: (index: number) => boolean;
  isDropTarget: (index: number) => boolean;
};

export function useDragReorder<T>({
  items,
  onReorder,
  disabled = false,
}: {
  items: T[];
  onReorder: (reordered: T[]) => void | Promise<void>;
  disabled?: boolean;
}): DragReorderHandlers {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const onDragStart = useCallback(
    (index: number) => (event: React.DragEvent) => {
      if (disabled) return;
      setDragIndex(index);
      setOverIndex(index);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(index));
    },
    [disabled]
  );

  const onDragOver = useCallback(
    (index: number) => (event: React.DragEvent) => {
      if (disabled || dragIndex === null) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      if (overIndex !== index) setOverIndex(index);
    },
    [disabled, dragIndex, overIndex]
  );

  const onDrop = useCallback(
    (index: number) => (event: React.DragEvent) => {
      event.preventDefault();
      if (disabled || dragIndex === null || dragIndex === index) {
        setDragIndex(null);
        setOverIndex(null);
        return;
      }

      const next = [...items];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      setDragIndex(null);
      setOverIndex(null);
      void onReorder(next);
    },
    [disabled, dragIndex, items, onReorder]
  );

  const onDragEnd = useCallback(() => {
    setDragIndex(null);
    setOverIndex(null);
  }, []);

  return {
    dragIndex,
    overIndex,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    isDragging: (index) => dragIndex === index,
    isDropTarget: (index) =>
      dragIndex !== null && overIndex === index && dragIndex !== index,
  };
}
