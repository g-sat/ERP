"use client"

import React, { forwardRef, useImperativeHandle, useRef } from "react"
import { useDroppable } from "@dnd-kit/core"
import { Path, UseFormReturn } from "react-hook-form"

import { cn } from "@/lib/utils"
import { FormField, FormItem } from "@/components/ui/form"
import { Label } from "@/components/ui/label"

interface MergeFieldsTextareaProps<T extends Record<string, unknown>> {
  form: UseFormReturn<T>
  name?: Path<T>
  label?: string
  className?: string
  placeholder?: string
  onBlurEvent?: () => void
  onChangeEvent?: () => void
  isDisabled?: boolean
  isRequired?: boolean
  maxLength?: number
  showCharacterCount?: boolean
  minRows?: number
  maxRows?: number
  droppableId?: string
}

export interface MergeFieldsTextareaRef {
  insertText: (text: string) => void
  getTextareaRef: () => HTMLTextAreaElement | null
}

const MergeFieldsTextarea = forwardRef<
  MergeFieldsTextareaRef,
  MergeFieldsTextareaProps<any> // eslint-disable-line @typescript-eslint/no-explicit-any
>(
  (
    {
      form,
      label,
      name,
      className,
      placeholder,
      onBlurEvent,
      onChangeEvent,
      isDisabled = false,
      isRequired = false,
      maxLength,
      showCharacterCount = false,
      minRows = 2,
      maxRows = 6,
      droppableId = "remarks-textarea",
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const { setNodeRef, isOver } = useDroppable({
      id: droppableId,
    })

    const insertText = (text: string) => {
      const textarea = textareaRef.current
      if (!textarea || !name) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const currentValue = (form.getValues(name) as string) || ""
      const newValue =
        currentValue.substring(0, start) +
        text +
        currentValue.substring(end, currentValue.length)

      form.setValue(name, newValue, {
        shouldDirty: true,
        shouldTouch: true,
      })

      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus()
        const newCursorPos = start + text.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    }

    useImperativeHandle(ref, () => ({
      insertText,
      getTextareaRef: () => textareaRef.current,
    }))

    if (!name) {
      return null
    }

    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {label && (
          <Label htmlFor={name} className="text-sm font-medium">
            {label}
            {isRequired && <span className="ml-1 text-red-500">*</span>}
          </Label>
        )}
        <FormField
          control={form.control}
          name={name}
          render={({ field, fieldState }) => {
            const { error } = fieldState
            const showError = !!error
            const value = field.value as string

            return (
              <FormItem className={cn("flex flex-col", className)}>
                <div ref={setNodeRef} className="relative">
                  <textarea
                    {...field}
                    ref={textareaRef}
                    value={value || ""}
                    placeholder={placeholder}
                    disabled={isDisabled}
                    tabIndex={isDisabled ? -1 : undefined}
                    maxLength={maxLength}
                    onBlur={() => {
                      field.onBlur()
                      onBlurEvent?.()
                    }}
                    onChange={(e) => {
                      field.onChange(e.target.value)
                      onChangeEvent?.()
                    }}
                    rows={minRows}
                    style={{
                      minHeight: `${minRows * 1.5}rem`,
                      maxHeight: `${maxRows * 1.5}rem`,
                      resize: "vertical",
                    }}
                    className={cn(
                      "border-input ring-offset-background flex w-full rounded-md border px-3 py-2 text-sm",
                      "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                      showError ? "border-destructive" : "border-input",
                      isOver ? "border-primary ring-primary/20 ring-2" : "",
                      isDisabled
                        ? "cursor-not-allowed border-gray-300 bg-gray-200 text-gray-500 opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        : "bg-muted/5"
                    )}
                  />
                  {isOver && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="bg-primary/10 border-primary text-primary rounded-md border-2 border-dashed px-4 py-2 text-sm font-medium">
                        Drop field here
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-1 flex items-center justify-between">
                  {showError && (
                    <p className="text-destructive text-xs">{error.message}</p>
                  )}
                  {showCharacterCount && maxLength && (
                    <span className="text-sm text-gray-500">
                      {value?.length || 0}/{maxLength}
                    </span>
                  )}
                </div>
              </FormItem>
            )
          }}
        />
      </div>
    )
  }
)

MergeFieldsTextarea.displayName = "MergeFieldsTextarea"

export default MergeFieldsTextarea
