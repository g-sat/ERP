"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
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
  selectedPeriod: string
  onPeriodChangeAction: (period: string) => void
  comparisonPeriod: string
  onComparisonChangeAction: (comparison: string) => void
  selectedEntities: string[]
  onEntitiesChangeAction: (entities: string[]) => void
}

export function GlobalFilters({
  selectedPeriod,
  onPeriodChangeAction,
  comparisonPeriod,
  onComparisonChangeAction,
  selectedEntities,
  onEntitiesChangeAction,
}: GlobalFiltersProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    to: new Date(), // Today
  })

  const [isEntityPopoverOpen, setIsEntityPopoverOpen] = useState(false)

  // Mock entity data - in real implementation, this would come from API
  const availableEntities = [
    { id: "entity-1", name: "Main Company", code: "MAIN" },
    { id: "entity-2", name: "Subsidiary A", code: "SUB-A" },
    { id: "entity-3", name: "Subsidiary B", code: "SUB-B" },
    { id: "entity-4", name: "Joint Venture", code: "JV-1" },
  ]

  const handleEntityToggle = (entityId: string) => {
    if (selectedEntities.includes(entityId)) {
      onEntitiesChangeAction(selectedEntities.filter((id) => id !== entityId))
    } else {
      onEntitiesChangeAction([...selectedEntities, entityId])
    }
  }

  const getPeriodDisplayName = (period: string) => {
    switch (period) {
      case "mtd":
        return "Month-to-Date"
      case "qtd":
        return "Quarter-to-Date"
      case "ytd":
        return "Year-to-Date"
      case "custom":
        return "Custom Range"
      default:
        return "Month-to-Date"
    }
  }

  const getComparisonDisplayName = (comparison: string) => {
    switch (comparison) {
      case "prior-period":
        return "Prior Period"
      case "prior-year":
        return "Prior Year"
      case "budget":
        return "Budget"
      default:
        return "Prior Period"
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Fiscal Period Selector */}
      <Select value={selectedPeriod} onValueChange={onPeriodChangeAction}>
        <SelectTrigger className="h-9 w-[140px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mtd">Month-to-Date</SelectItem>
          <SelectItem value="qtd">Quarter-to-Date</SelectItem>
          <SelectItem value="ytd">Year-to-Date</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {/* Custom Date Range Picker (shown when custom is selected) */}
      {selectedPeriod === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-9 w-[260px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}

      {/* Comparison Period Toggle */}
      <Select value={comparisonPeriod} onValueChange={onComparisonChangeAction}>
        <SelectTrigger className="h-9 w-[130px]">
          <SelectValue placeholder="Compare to" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="prior-period">Prior Period</SelectItem>
          <SelectItem value="prior-year">Prior Year</SelectItem>
          <SelectItem value="budget">Budget</SelectItem>
        </SelectContent>
      </Select>

      {/* Legal Entity / Cost Center Multi-select */}
      <Popover open={isEntityPopoverOpen} onOpenChange={setIsEntityPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-9 min-w-[120px] justify-between"
          >
            <span className="truncate">
              {selectedEntities.length === 0
                ? "All Entities"
                : selectedEntities.length === 1
                  ? availableEntities.find((e) => e.id === selectedEntities[0])
                      ?.name || "All Entities"
                  : `${selectedEntities.length} Entities`}
            </span>
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-2">
            <div className="text-muted-foreground text-sm font-medium">
              Legal Entities / Cost Centers
            </div>
            {availableEntities.map((entity) => (
              <div
                key={entity.id}
                className="hover:bg-muted/50 flex cursor-pointer items-center space-x-2 rounded-md p-2"
                onClick={() => handleEntityToggle(entity.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedEntities.includes(entity.id)}
                  onChange={() => handleEntityToggle(entity.id)}
                  className="rounded border-gray-300"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {entity.name}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {entity.code}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {(selectedPeriod !== "mtd" ||
        comparisonPeriod !== "prior-period" ||
        selectedEntities.length > 0) && (
        <div className="flex flex-wrap gap-1">
          {selectedPeriod !== "mtd" && (
            <Badge variant="secondary" className="text-xs">
              Period: {getPeriodDisplayName(selectedPeriod)}
            </Badge>
          )}
          {comparisonPeriod !== "prior-period" && (
            <Badge variant="secondary" className="text-xs">
              Compare: {getComparisonDisplayName(comparisonPeriod)}
            </Badge>
          )}
          {selectedEntities.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              Entities: {selectedEntities.length}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
