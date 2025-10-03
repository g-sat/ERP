"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface GlobalFiltersProps {
  agingAsOfDate: Date
  onAgingAsOfDateChangeAction: (date: Date) => void
  selectedSalesperson: string
  onSalespersonChangeAction: (salesperson: string) => void
  selectedCustomerSegments: string[]
  onCustomerSegmentsChangeAction: (segments: string[]) => void
  includeCreditHold: boolean
  onIncludeCreditHoldChangeAction: (include: boolean) => void
  dateRange: { from: Date; to: Date }
  onDateRangeChangeAction: (range: { from: Date; to: Date }) => void
}

export function GlobalFilters({
  agingAsOfDate,
  onAgingAsOfDateChangeAction,
  selectedSalesperson,
  onSalespersonChangeAction,
  selectedCustomerSegments,
  onCustomerSegmentsChangeAction,
  includeCreditHold,
  onIncludeCreditHoldChangeAction,
  dateRange,
  onDateRangeChangeAction,
}: GlobalFiltersProps) {
  const salespersonOptions = [
    "All Salespeople",
    "John Smith",
    "Jane Doe",
    "Mike Johnson",
    "Sarah Wilson",
  ]

  const customerSegmentOptions = [
    "Enterprise",
    "Mid-Market",
    "SMB",
    "Government",
    "Non-Profit",
  ]

  return (
    <div className="flex flex-wrap gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-fit">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(agingAsOfDate, "MMM dd, yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={agingAsOfDate}
            onSelect={(date) => date && onAgingAsOfDateChangeAction(date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Select
        value={selectedSalesperson}
        onValueChange={onSalespersonChangeAction}
      >
        <SelectTrigger className="w-fit">
          <SelectValue placeholder="Salesperson" />
        </SelectTrigger>
        <SelectContent>
          {salespersonOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedCustomerSegments.join(",")}
        onValueChange={(value) =>
          onCustomerSegmentsChangeAction(value ? value.split(",") : [])
        }
      >
        <SelectTrigger className="w-fit">
          <SelectValue placeholder="Customer Segments" />
        </SelectTrigger>
        <SelectContent>
          {customerSegmentOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant={includeCreditHold ? "default" : "outline"}
        onClick={() => onIncludeCreditHoldChangeAction(!includeCreditHold)}
        className="w-fit"
      >
        {includeCreditHold ? "Include Credit Hold" : "Exclude Credit Hold"}
      </Button>
    </div>
  )
}
