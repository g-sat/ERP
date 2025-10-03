"use client"

import {
  BuildingIcon,
  CalendarIcon,
  EyeIcon,
  GlobeIcon,
  PackageIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface GlobalFiltersProps {
  selectedPeriod: string
  onPeriodChange: (period: string) => void
  comparisonPeriod: string
  onComparisonChange: (period: string) => void
  selectedBusinessUnits: string[]
  onBusinessUnitsChange: (units: string[]) => void
  selectedProductLines: string[]
  onProductLinesChange: (lines: string[]) => void
  selectedGeography: string[]
  onGeographyChange: (geography: string[]) => void
  viewMode: "detailed" | "executive"
  onViewModeChange: (mode: "detailed" | "executive") => void
}

export function GlobalFilters({
  selectedPeriod,
  onPeriodChange,
  comparisonPeriod,
  onComparisonChange,
  selectedBusinessUnits,
  onBusinessUnitsChange,
  selectedProductLines,
  onProductLinesChange,
  selectedGeography,
  onGeographyChange,
  viewMode,
  onViewModeChange,
}: GlobalFiltersProps) {
  const periodOptions = [
    { value: "ytd", label: "Year-to-Date" },
    { value: "mtd", label: "Month-to-Date" },
    { value: "qtd", label: "Quarter-to-Date" },
    { value: "12m", label: "Rolling 12 Months" },
    { value: "custom", label: "Custom Range" },
  ]

  const comparisonOptions = [
    { value: "prior-year", label: "Prior Year" },
    { value: "prior-period", label: "Prior Period" },
    { value: "budget", label: "Budget" },
    { value: "forecast", label: "Forecast" },
  ]

  const businessUnitOptions = [
    "Corporate",
    "Operations",
    "Procurement",
    "Finance",
    "Human Resources",
    "Information Technology",
    "Sales & Marketing",
  ]

  const productLineOptions = [
    "Strategic Procurement",
    "Tactical Procurement",
    "Capital Expenditures",
    "Operating Expenses",
    "Services",
    "Raw Materials",
  ]

  const geographyOptions = [
    "North America",
    "Europe",
    "Asia Pacific",
    "Middle East",
    "Latin America",
  ]

  return (
    <Card className="w-full sm:w-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <CalendarIcon className="h-4 w-4" />
          Strategic Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Period Selection */}
        <div className="space-y-2">
          <label className="text-muted-foreground text-xs font-medium">
            Time Period
          </label>
          <Select value={selectedPeriod} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Comparison Period */}
        <div className="space-y-2">
          <label className="text-muted-foreground text-xs font-medium">
            Compare To
          </label>
          <Select value={comparisonPeriod} onValueChange={onComparisonChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {comparisonOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Business Unit Filter */}
        <div className="space-y-2">
          <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
            <BuildingIcon className="h-3 w-3" />
            Business Units
          </label>
          <div className="flex flex-wrap gap-1">
            {selectedBusinessUnits.length === 0 ? (
              <Badge variant="outline" className="text-xs">
                All Units
              </Badge>
            ) : (
              selectedBusinessUnits.map((unit) => (
                <Badge
                  key={unit}
                  variant="secondary"
                  className="cursor-pointer text-xs"
                  onClick={() =>
                    onBusinessUnitsChange(
                      selectedBusinessUnits.filter((u) => u !== unit)
                    )
                  }
                >
                  {unit} ×
                </Badge>
              ))
            )}
          </div>
          <Select
            value=""
            onValueChange={(value) => {
              if (value && !selectedBusinessUnits.includes(value)) {
                onBusinessUnitsChange([...selectedBusinessUnits, value])
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Add Business Unit" />
            </SelectTrigger>
            <SelectContent>
              {businessUnitOptions
                .filter((unit) => !selectedBusinessUnits.includes(unit))
                .map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Product Line Filter */}
        <div className="space-y-2">
          <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
            <PackageIcon className="h-3 w-3" />
            Product Lines
          </label>
          <div className="flex flex-wrap gap-1">
            {selectedProductLines.length === 0 ? (
              <Badge variant="outline" className="text-xs">
                All Lines
              </Badge>
            ) : (
              selectedProductLines.map((line) => (
                <Badge
                  key={line}
                  variant="secondary"
                  className="cursor-pointer text-xs"
                  onClick={() =>
                    onProductLinesChange(
                      selectedProductLines.filter((l) => l !== line)
                    )
                  }
                >
                  {line} ×
                </Badge>
              ))
            )}
          </div>
          <Select
            value=""
            onValueChange={(value) => {
              if (value && !selectedProductLines.includes(value)) {
                onProductLinesChange([...selectedProductLines, value])
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Add Product Line" />
            </SelectTrigger>
            <SelectContent>
              {productLineOptions
                .filter((line) => !selectedProductLines.includes(line))
                .map((line) => (
                  <SelectItem key={line} value={line}>
                    {line}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Geography Filter */}
        <div className="space-y-2">
          <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
            <GlobeIcon className="h-3 w-3" />
            Geography
          </label>
          <div className="flex flex-wrap gap-1">
            {selectedGeography.length === 0 ? (
              <Badge variant="outline" className="text-xs">
                Global
              </Badge>
            ) : (
              selectedGeography.map((geo) => (
                <Badge
                  key={geo}
                  variant="secondary"
                  className="cursor-pointer text-xs"
                  onClick={() =>
                    onGeographyChange(
                      selectedGeography.filter((g) => g !== geo)
                    )
                  }
                >
                  {geo} ×
                </Badge>
              ))
            )}
          </div>
          <Select
            value=""
            onValueChange={(value) => {
              if (value && !selectedGeography.includes(value)) {
                onGeographyChange([...selectedGeography, value])
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Add Region" />
            </SelectTrigger>
            <SelectContent>
              {geographyOptions
                .filter((geo) => !selectedGeography.includes(geo))
                .map((geo) => (
                  <SelectItem key={geo} value={geo}>
                    {geo}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Strategic vs Tactical Toggle */}
        <div className="space-y-2">
          <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
            <EyeIcon className="h-3 w-3" />
            View Mode
          </label>
          <div className="flex gap-1">
            <Button
              variant={viewMode === "detailed" ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => onViewModeChange("detailed")}
            >
              Detailed
            </Button>
            <Button
              variant={viewMode === "executive" ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => onViewModeChange("executive")}
            >
              Executive
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
