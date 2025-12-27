"use client"

import React from "react"
import { useDraggable } from "@dnd-kit/core"
import { GripVertical } from "lucide-react"

import { cn } from "@/lib/utils"

interface IMergeField {
  key: string
  label: string
  description?: string
}

interface MergeFieldsSidebarProps {
  fields: IMergeField[]
  className?: string
}

interface DraggableFieldProps {
  field: IMergeField
}

function DraggableField({ field }: DraggableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: field.key,
      data: {
        type: "merge-field",
        key: field.key,
        value: `{${field.key}}`,
      },
    })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "bg-card flex cursor-grab items-center gap-2 rounded-md border p-2 transition-all active:cursor-grabbing",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <GripVertical className="text-muted-foreground h-4 w-4" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{field.label}</div>
        {field.description && (
          <div className="text-muted-foreground truncate text-xs">
            {field.description}
          </div>
        )}
      </div>
      <code className="bg-muted rounded px-2 py-1 font-mono text-xs">
        {`{${field.key}}`}
      </code>
    </div>
  )
}

export function MergeFieldsSidebar({
  fields,
  className,
}: MergeFieldsSidebarProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold">Merge Fields</h4>
        <p className="text-muted-foreground text-xs">
          Drag and drop fields into the remarks text area
        </p>
      </div>
      <div className="max-h-[400px] space-y-2 overflow-y-auto">
        {fields.map((field) => (
          <DraggableField key={field.key} field={field} />
        ))}
      </div>
    </div>
  )
}
