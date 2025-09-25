import React from "react"
import { format, isValid, parse } from "date-fns"
import { Control, FieldValues, Path } from "react-hook-form"

import { cn } from "@/lib/utils"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CustomDateTimeNewProps<T extends FieldValues = FieldValues> {
  form: { control: Control<T> }
  label?: string
  name: Path<T>
  className?: string
  onBlurEvent?: (e: React.FocusEvent<HTMLInputElement>) => void
  onChangeEvent?: (date: Date | null) => void
  isDisabled?: boolean
  isRequired?: boolean
  placeholder?: string
  minDate?: Date | string
  maxDate?: Date | string
  dateTimeFormat?: string
  size?: "default" | "sm" | "lg"
}

export const CustomDateTimeNew = <T extends FieldValues = FieldValues>({
  form,
  label,
  name,
  className,
  onBlurEvent,
  onChangeEvent,
  isDisabled = false,
  isRequired = false,
  placeholder = "Pick a date and time",
  minDate,
  maxDate,
  dateTimeFormat = "yyyy-MM-dd HH:mm",
  size = "default",
}: CustomDateTimeNewProps<T>) => {
  const formatDateTime = (value: Date | string | undefined) => {
    if (!value) return ""
    if (value instanceof Date) {
      return format(value, dateTimeFormat)
    }
    if (typeof value === "string") {
      const parsedDate = parse(value, dateTimeFormat, new Date())
      return isValid(parsedDate) ? format(parsedDate, dateTimeFormat) : value
    }
    return ""
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
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                type="datetime-local"
                id={name}
                disabled={isDisabled}
                placeholder={placeholder}
                min={formatDateTime(minDate)}
                max={formatDateTime(maxDate)}
                className={cn("w-full", {
                  "h-8 text-sm": size === "sm",
                  "h-9": size === "default",
                  "h-12 text-lg": size === "lg",
                })}
                {...field}
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value
                  field.onChange(value)
                  if (onChangeEvent) {
                    const date = value ? new Date(value) : null
                    onChangeEvent(date)
                  }
                }}
                onBlur={(e) => {
                  field.onBlur()
                  onBlurEvent?.(e)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
