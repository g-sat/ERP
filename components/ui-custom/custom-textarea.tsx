"use client"

import { Path, UseFormReturn } from "react-hook-form"

import { cn } from "@/lib/utils"

import { FormField, FormItem } from "../ui/form"
import { Label } from "../ui/label"

interface CustomTextareaProps<T extends Record<string, unknown>> {
  form: UseFormReturn<T>
  name?: Path<T>
  label?: string
  className?: string
  onBlurEvent?: () => void
  onChangeEvent?: () => void
  isDisabled?: boolean
  isRequired?: boolean
  maxLength?: number
  showCharacterCount?: boolean
  minRows?: number
  maxRows?: number
}

export default function CustomTextarea<T extends Record<string, unknown>>({
  form,
  label,
  name,
  className,
  onBlurEvent,
  onChangeEvent,
  isDisabled = false,
  isRequired = false,
  maxLength,
  showCharacterCount = false,
  minRows = 2,
  maxRows = 6,
}: CustomTextareaProps<T>) {
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
        name={name || ("" as Path<T>)}
        render={({ field, fieldState }) => {
          const { error } = fieldState
          const showError = !!error
          const value = field.value as string

          return (
            <FormItem className={cn("flex flex-col", className)}>
              <div className="relative">
                <textarea
                  {...field}
                  value={value || ""}
                  disabled={isDisabled}
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
                    "border-input ring-offset-background flex w-full rounded-md border bg-white px-3 py-2 text-sm dark:bg-gray-900",
                    "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                    showError ? "border-destructive" : "border-input",
                    isDisabled && "cursor-not-allowed opacity-50"
                  )}
                />
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
