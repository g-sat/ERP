"use client"

import { useFormContext } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CustomSelectProps {
  name: string
  label: string
  options: { value: string | number; label: string }[]
  isRequired?: boolean
  isDisabled?: boolean
  placeholder?: string
  className?: string
}

export default function CustomSelect({
  name,
  label,
  options,
  isRequired = false,
  isDisabled = false,
  placeholder = "Select an option",
  className,
}: CustomSelectProps) {
  const form = useFormContext()
  const {
    formState: { errors },
  } = form

  const error = errors[name]

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {isRequired && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select
        onValueChange={(value) => {
          // Convert string to number if the option value is a number
          const numericValue = options.find(
            (opt) => opt.value.toString() === value
          )?.value
          form.setValue(
            name,
            typeof numericValue === "number" ? numericValue : value
          )
        }}
        defaultValue={form.getValues(name)?.toString()}
        disabled={isDisabled}
      >
        <SelectTrigger
          className={cn(
            "w-full",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value.toString()}
              className="cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-destructive text-xs">{error.message as string}</p>
      )}
    </div>
  )
}
