"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export function SortableItem({ id, children, isActive }: { id: string, children: React.ReactNode, isActive?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: "relative" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex rounded-lg border ${
        isActive ? "border-primary bg-primary/5 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"
      } ${isDragging ? "opacity-50 shadow-lg border-primary" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-center px-2 text-gray-400 hover:text-gray-600 active:cursor-grabbing"
      >
        <GripVertical size={20} />
      </div>
      <div className="flex-1 p-4">
        {children}
      </div>
    </div>
  );
}
