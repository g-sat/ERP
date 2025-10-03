"use client"

import { useState } from "react"
import { DownloadIcon, FilterIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { CustomerProfitabilityMatrix } from "./components/customer-profitability-matrix"
import { ExceptionAlerts } from "./components/exception-alerts"
import { ExecutiveKPIPanel } from "./components/executive-kpi-panel"
import { GlobalFilters } from "./components/global-filters"
import { POLifecycleHealth } from "./components/po-lifecycle-health"
import { ProcurementSpendBudget } from "./components/procurement-spend-budget"
import { RollingCashFlowForecast } from "./components/rolling-cash-flow-forecast"
import { SupplierPerformanceScorecard } from "./components/supplier-performance-scorecard"

export default function Dashboard4Page() {
  const [selectedPeriod, setSelectedPeriod] = useState("ytd")
  const [comparisonPeriod, setComparisonPeriod] = useState("prior-year")
  const [selectedBusinessUnits, setSelectedBusinessUnits] = useState<string[]>(
    []
  )
  const [selectedProductLines, setSelectedProductLines] = useState<string[]>([])
  const [selectedGeography, setSelectedGeography] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"detailed" | "executive">("detailed")

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Management & Procurement Insights
          </h1>
          <p className="text-muted-foreground">
            Strategic decision-making through advanced analytics and KPI
            monitoring
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <GlobalFilters
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            comparisonPeriod={comparisonPeriod}
            onComparisonChange={setComparisonPeriod}
            selectedBusinessUnits={selectedBusinessUnits}
            onBusinessUnitsChange={setSelectedBusinessUnits}
            selectedProductLines={selectedProductLines}
            onProductLinesChange={setSelectedProductLines}
            selectedGeography={selectedGeography}
            onGeographyChange={setSelectedGeography}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          <Button variant="outline" className="w-full sm:w-auto">
            <FilterIcon className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Advanced Filters</span>
            <span className="sm:hidden">Filter</span>
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <DownloadIcon className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-4">
        <Tabs
          value={viewMode}
          onValueChange={(value) =>
            setViewMode(value as "detailed" | "executive")
          }
        >
          <TabsList className="grid w-full grid-cols-2 gap-2 sm:w-auto">
            <TabsTrigger value="detailed" className="text-xs sm:text-sm">
              Detailed View
            </TabsTrigger>
            <TabsTrigger value="executive" className="text-xs sm:text-sm">
              Executive Summary
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {viewMode === "executive" && (
          <Badge variant="outline" className="text-xs">
            <TrendingUpIcon className="mr-1 h-3 w-3" />
            Strategic Focus
          </Badge>
        )}
      </div>

      {/* Executive KPI Panel - Always Visible */}
      <div className="space-y-6">
        <ExecutiveKPIPanel
          period={selectedPeriod}
          comparisonPeriod={comparisonPeriod}
          businessUnits={selectedBusinessUnits}
          productLines={selectedProductLines}
          geography={selectedGeography}
        />

        {/* Exception Alerts - Always Visible */}
        <ExceptionAlerts
          period={selectedPeriod}
          businessUnits={selectedBusinessUnits}
          productLines={selectedProductLines}
          geography={selectedGeography}
        />

        {/* Detailed View Content */}
        {viewMode === "detailed" && (
          <>
            {/* Customer & Supplier Analysis */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <CustomerProfitabilityMatrix
                period={selectedPeriod}
                comparisonPeriod={comparisonPeriod}
                businessUnits={selectedBusinessUnits}
                productLines={selectedProductLines}
                geography={selectedGeography}
              />
              <SupplierPerformanceScorecard
                period={selectedPeriod}
                comparisonPeriod={comparisonPeriod}
                businessUnits={selectedBusinessUnits}
                productLines={selectedProductLines}
                geography={selectedGeography}
              />
            </div>

            {/* Procurement Analysis */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <POLifecycleHealth
                period={selectedPeriod}
                comparisonPeriod={comparisonPeriod}
                businessUnits={selectedBusinessUnits}
                productLines={selectedProductLines}
                geography={selectedGeography}
              />
              <ProcurementSpendBudget
                period={selectedPeriod}
                comparisonPeriod={comparisonPeriod}
                businessUnits={selectedBusinessUnits}
                productLines={selectedProductLines}
                geography={selectedGeography}
              />
            </div>

            {/* Cash Flow Forecast - Full Width */}
            <div>
              <RollingCashFlowForecast
                period={selectedPeriod}
                comparisonPeriod={comparisonPeriod}
                businessUnits={selectedBusinessUnits}
                productLines={selectedProductLines}
                geography={selectedGeography}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
