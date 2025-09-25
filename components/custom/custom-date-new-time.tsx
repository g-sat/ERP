import React from "react"
import { format } from "date-fns"
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

interface CustomDateNewProps<T extends FieldValues = FieldValues> {
  form: { control: Control<T> }
  label?: string
  name: Path<T>
  disabled?: boolean
  className?: string
  onBlurEvent?: (e: React.FocusEvent<HTMLInputElement>) => void
  onChangeEvent?: (value: string) => void
  isRequired?: boolean
  placeholder?: string
  minDate?: Date | string
  maxDate?: Date | string
}

export const CustomDateTimeNew = <T extends FieldValues = FieldValues>({
  form,
  label,
  name,
  disabled = false,
  className,
  onBlurEvent,
  onChangeEvent,
  isRequired = false,
  placeholder = "Pick a date and time",
  minDate,
  maxDate,
}: CustomDateNewProps<T>) => {
  // Convert Date or string to "yyyy-MM-ddTHH:mm" format for datetime-local
  const formatToDatetimeLocal = (value: Date | string | undefined) => {
    if (!value) return ""
    if (value instanceof Date) {
      return format(value, "yyyy-MM-dd'T'HH:mm")
    }
    if (typeof value === "string") {
      // Assume the string is already in "yyyy-MM-ddTHH:mm" format
      return value
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
                disabled={disabled}
                placeholder={placeholder}
                min={formatToDatetimeLocal(minDate)}
                max={formatToDatetimeLocal(maxDate)}
                className={cn("w-full")}
                {...field}
                value={formatToDatetimeLocal(field.value)}
                onChange={(e) => {
                  const value = e.target.value // "yyyy-MM-ddTHH:mm"
                  field.onChange(value)
                  onChangeEvent?.(value)
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
