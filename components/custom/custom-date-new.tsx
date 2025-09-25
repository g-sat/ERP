import React, { useState, useEffect, useCallback } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { format, isValid, parse } from "date-fns"
import { FieldValues, Path, UseFormReturn } from "react-hook-form"

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
  form: UseFormReturn<T>
  label?: string
  name: Path<T>

  className?: string
  onBlurEvent?: (e: React.FocusEvent<HTMLInputElement>) => void
  onChangeEvent?: (date: Date | null) => void
  isDisabled?: boolean
  isRequired?: boolean
  placeholder?: string
  size?: "default" | "sm" | "lg"
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
  placeholder = "dd/MM/yyyy",
  size = "default",
}: CustomDateNewProps<T>) => {
  const { decimals } = useAuthStore()
  const decimalDateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const [inputValue, setInputValue] = useState("")

  // Convert Date or string to dd/MM/yyyy format for display
  const formatDateForDisplay = useCallback((value: Date | string | undefined) => {
    if (!value) return ""
    if (value instanceof Date) {
      return format(value, decimalDateFormat)
    }
    if (typeof value === "string") {
      // Try to parse the string and format it
      const parsedDate = parse(value, decimalDateFormat, new Date())
      if (isValid(parsedDate)) {
        return format(parsedDate, decimalDateFormat)
      }
      // Try to parse as other common formats
      const otherFormats = ["yyyy-MM-dd", "MM/dd/yyyy", "dd-MM-yyyy"]
      for (const fmt of otherFormats) {
        const parsed = parse(value, fmt, new Date())
        if (isValid(parsed)) {
          return format(parsed, decimalDateFormat)
        }
      }
      return value // Return as-is if can't parse
    }
    return ""
  }, [decimalDateFormat])


  // Handle input change with formatting
  const handleInputChange = (value: string) => {
    setInputValue(value)
    
    // Try to parse the input as dd/MM/yyyy
    const parsedDate = parse(value, decimalDateFormat, new Date())
    
    if (isValid(parsedDate)) {
      // Valid date, store as Date object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      form.setValue(name, parsedDate as any)
      if (onChangeEvent) {
        onChangeEvent(parsedDate)
      }
    } else if (value === "") {
      // Empty input, clear the field
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      form.setValue(name, undefined as any)
      if (onChangeEvent) {
        onChangeEvent(null)
      }
    }
    // If invalid but not empty, don't update the form value (let validation handle it)
  }

  // Sync input value with form field value when form is reset or external data changes
  const watchedValue = form.watch(name)
  useEffect(() => {
    if (watchedValue) {
      let formattedValue = ""
      if (watchedValue && typeof watchedValue === 'object' && 'getTime' in watchedValue) {
        formattedValue = format(watchedValue as Date, decimalDateFormat)
      } else if (typeof watchedValue === "string") {
        // Try to parse the string and format it
        const parsedDate = parse(watchedValue, decimalDateFormat, new Date())
        if (isValid(parsedDate)) {
          formattedValue = format(parsedDate, decimalDateFormat)
        } else {
          // Try to parse as other common formats
          const otherFormats = ["yyyy-MM-dd", "MM/dd/yyyy", "dd-MM-yyyy"]
          for (const fmt of otherFormats) {
            const parsed = parse(watchedValue, fmt, new Date())
            if (isValid(parsed)) {
              formattedValue = format(parsed, decimalDateFormat)
              break
            }
          }
          if (!formattedValue) {
            formattedValue = watchedValue // Return as-is if can't parse
          }
        }
      }
      setInputValue(formattedValue)
    } else {
      setInputValue("")
    }
  }, [watchedValue, decimalDateFormat])

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
                value={inputValue || formatDateForDisplay(field.value)}
                onChange={(e) => {
                  const value = e.target.value
                  handleInputChange(value)
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
