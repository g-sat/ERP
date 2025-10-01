"use client"

import { Path, UseFormReturn } from "react-hook-form"

import { cn } from "@/lib/utils"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { Label } from "../ui/label"

interface CustomInputProps<T extends Record<string, unknown>> {
  form: UseFormReturn<T>
  name: Path<T>
  label?: string
  placeholder?: string
  className?: string
  onBlurEvent?: (e: React.FocusEvent<HTMLInputElement>) => void
  onChangeEvent?: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  isRequired?: boolean
  isDisabled?: boolean
}

export default function CustomInput<T extends Record<string, unknown>>({
  form,
  name,
  label,
  placeholder,
  className,
  onBlurEvent,
  onChangeEvent,
  type = "text",
  isRequired = false,
  isDisabled = false,
}: CustomInputProps<T>) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (type === "number" && !/[0-9]/.test(e.key) && e.key !== "Tab") {
      e.preventDefault() // Block non-numeric keys except Tab
    }
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
                onKeyDown={(e) => {
                  handleKeyPress(e)
                }}
                type={type}
                placeholder={placeholder}
                disabled={isDisabled}
                value={
                  type === "number"
                    ? field.value === undefined || field.value === null
                      ? ""
                      : String(field.value)
                    : String(field.value || "")
                }
                onChange={(e) => {
                  const value =
                    type === "number"
                      ? e.target.value === ""
                        ? 0
                        : Number(e.target.value)
                      : e.target.value
                  field.onChange(value)
                  if (onChangeEvent) {
                    onChangeEvent(e)
                  }
                }}
                onBlur={(e) => {
                  field.onBlur()
                  if (onBlurEvent) {
                    onBlurEvent(e)
                  }
                }}
                className={cn("bg-muted/5", className)} //Newly added harshad
                tabIndex={0}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
