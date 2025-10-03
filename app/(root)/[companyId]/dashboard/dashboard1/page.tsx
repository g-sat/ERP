"use client"

import { useState } from "react"
import { DownloadIcon, FilterIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

import { BankBalancesAlerts } from "./components/bank-balances-alerts"
import { BankReconciliationStatus } from "./components/bank-reconciliation-status"
import { CashFlowStatement } from "./components/cash-flow-statement"
import { GeneralLedgerHeatmap } from "./components/general-ledger-heatmap"
import { GlobalFilters } from "./components/global-filters"
import { KeyFinancialRatios } from "./components/key-financial-ratios"
import { PLPerformance } from "./components/pl-performance"
import { TrialBalanceSnapshot } from "./components/trial-balance-snapshot"

export default function Dashboard1Page() {
  const [selectedPeriod, setSelectedPeriod] = useState("mtd")
  const [comparisonPeriod, setComparisonPeriod] = useState("prior-period")
  const [selectedEntities, setSelectedEntities] = useState<string[]>([])

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Finance & Accounting Overview
          </h1>
          <p className="text-muted-foreground">
            Mission Control for your organization&apos;s financial health
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <GlobalFilters
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            comparisonPeriod={comparisonPeriod}
            onComparisonChange={setComparisonPeriod}
            selectedEntities={selectedEntities}
            onEntitiesChange={setSelectedEntities}
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

      {/* Main Dashboard Content */}
      <div className="space-y-6">
        {/* Top Row - Trial Balance and Key Ratios */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TrialBalanceSnapshot
              period={selectedPeriod}
              comparisonPeriod={comparisonPeriod}
              entities={selectedEntities}
            />
          </div>
          <div>
            <KeyFinancialRatios
              period={selectedPeriod}
              comparisonPeriod={comparisonPeriod}
              entities={selectedEntities}
            />
          </div>
        </div>

        {/* Second Row - Bank Information */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BankBalancesAlerts
            period={selectedPeriod}
            entities={selectedEntities}
          />
          <BankReconciliationStatus
            period={selectedPeriod}
            entities={selectedEntities}
          />
        </div>

        {/* Third Row - GL Activity and P&L Performance */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GeneralLedgerHeatmap
            period={selectedPeriod}
            comparisonPeriod={comparisonPeriod}
            entities={selectedEntities}
          />
          <PLPerformance
            period={selectedPeriod}
            comparisonPeriod={comparisonPeriod}
            entities={selectedEntities}
          />
        </div>

        {/* Fourth Row - Cash Flow Statement (Full Width) */}
        <div>
          <CashFlowStatement
            period={selectedPeriod}
            comparisonPeriod={comparisonPeriod}
            entities={selectedEntities}
          />
        </div>
      </div>
    </div>
  )
}
