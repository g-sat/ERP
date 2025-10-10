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
  placeholder = "dd/mm/yyyy",
  minDate,
  maxDate,
  dateFormat = "dd/mm/yyyy",
  size = "default",
  isFutureShow = false,
}: CustomDateNewProps<T>) => {
  const { decimals } = useAuthStore()
  const decimalDateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  // Parse prop date (Date or string in dateFormat)
  const parsePropDate = (d: Date | string | undefined): Date | null => {
    if (!d) return null
    if (d instanceof Date) return d
    const p = parse(d as string, dateFormat, new Date())
    return isValid(p) ? p : null
  }

  const minParsed = parsePropDate(minDate)
  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)
  const maxParsed = isFutureShow ? parsePropDate(maxDate) : todayDate

  // Custom parse handling dd/mm/yyyy or dd/mm/yy (assuming 20yy for yy)
  const parseCustomDate = (input: string): Date | null => {
    if (!input || input.trim() === "") return null
    const parts = input.split("/")
    if (parts.length !== 3) return null
    const dayStr = parts[0].trim()
    const monStr = parts[1].trim()
    const yearStr = parts[2].trim()
    const day = parseInt(dayStr, 10)
    const mon = parseInt(monStr, 10)
    let year: number
    if (yearStr.length === 2) {
      year = 2000 + parseInt(yearStr, 10)
    } else if (yearStr.length === 4) {
      year = parseInt(yearStr, 10)
    } else {
      return null
    }
    if (
      isNaN(day) ||
      isNaN(mon) ||
      isNaN(year) ||
      day < 1 ||
      day > 31 ||
      mon < 1 ||
      mon > 12
    ) {
      return null
    }
    const date = new Date(year, mon - 1, day)
    if (
      isValid(date) &&
      date.getDate() === day &&
      date.getMonth() === mon - 1
    ) {
      return date
    }
    return null
  }

  // Format value for display (assume field.value is already in decimalDateFormat, or handle legacy yyyy-mm-dd)
  const getDisplayValue = (value: string): string => {
    if (!value) return ""
    if (typeof value !== "string") return ""
    // If it's yyyy-mm-dd (legacy), parse and format
    if (value.includes("-") && !value.includes("/")) {
      const legacyParsed = parse(value, "dd/mm/yyyy", new Date())
      return isValid(legacyParsed)
        ? format(legacyParsed, decimalDateFormat)
        : value
    }
    // Assume it's already formatted or raw
    return value
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
                type="text"
                id={name}
                disabled={isDisabled}
                placeholder={placeholder}
                className={cn("w-full", {
                  "h-8 text-sm": size === "sm",
                  "h-9": size === "default",
                  "h-12 text-lg": size === "lg",
                })}
                {...field}
                value={getDisplayValue(field.value)}
                onChange={(e) => {
                  field.onChange(e.target.value)
                }}
                onBlur={(e) => {
                  const inputValue = e.target.value
                  const parsed = parseCustomDate(inputValue)
                  if (
                    parsed &&
                    (!minParsed || parsed >= minParsed) &&
                    (!maxParsed || parsed <= maxParsed)
                  ) {
                    const formatted = format(parsed, decimalDateFormat)
                    field.onChange(formatted)
                    onChangeEvent?.(parsed)
                  } else {
                    field.onChange("")
                    onChangeEvent?.(null)
                  }
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
