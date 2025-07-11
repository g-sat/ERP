import React from "react"
import { useAuthStore } from "@/stores/auth-store"
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

interface CustomDateNewProps<T extends FieldValues = FieldValues> {
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
  dateFormat?: string
  size?: "default" | "sm" | "lg"
  isFutureShow?: boolean
}

export const CustomDateNew = <T extends FieldValues = FieldValues>({
  form,
  label,
  name,
  className,
  onBlurEvent,
  onChangeEvent,
  isDisabled = false,
  isRequired = false,
  placeholder = "Pick a date",
  minDate,
  maxDate,
  dateFormat = "dd/MM/yyyy",
  size = "default",
  isFutureShow = false,
}: CustomDateNewProps<T>) => {
  const { decimals } = useAuthStore()
  const decimalDateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  // Convert Date or string to "yyyy-MM-dd" format
  const parseDateInput = (value: Date | string | undefined) => {
    if (!value) return ""
    if (value instanceof Date) {
      return format(value, decimalDateFormat)
    }
    if (typeof value === "string") {
      const parsedDate = parse(value, dateFormat, new Date())
      return isValid(parsedDate) ? format(parsedDate, decimalDateFormat) : value
    }
    return ""
  }

  // Get today's date in yyyy-MM-dd format
  const today = format(new Date(), decimalDateFormat)

  // Determine max date based on isFutureShow prop
  const effectiveMaxDate = isFutureShow ? maxDate : today

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
                type="date"
                id={name}
                disabled={isDisabled}
                placeholder={placeholder}
                min={parseDateInput(minDate)}
                max={parseDateInput(effectiveMaxDate)}
                className={cn("w-full", {
                  "h-8 text-sm": size === "sm",
                  "h-9": size === "default",
                  "h-12 text-lg": size === "lg",
                })}
                {...field}
                value={parseDateInput(field.value)}
                onChange={(e) => {
                  const value = e.target.value // Already in "yyyy-MM-dd"
                  const date = value ? new Date(value) : null
                  field.onChange(value)
                  if (onChangeEvent) {
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
