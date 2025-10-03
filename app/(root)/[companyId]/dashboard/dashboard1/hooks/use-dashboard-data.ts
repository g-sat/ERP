"use client"

import { useEffect, useMemo, useState } from "react"

export interface DashboardFilters {
  period: string
  comparisonPeriod: string
  entities: string[]
  dateRange?: {
    from: Date
    to: Date
  }
}

export interface TrialBalanceData {
  totalDebits: number
  totalCredits: number
  netChange: number
  varianceThreshold: number
  historicalData: Array<{
    period: string
    netChange: number
  }>
  lastUpdated: string
}

export interface GLAccountActivity {
  accountId: string
  accountName: string
  accountCode: string
  transactionCount: number
  absoluteBalanceChange: number
  variancePercentage: number
  accountType: string
}

export interface BankAccount {
  accountId: string
  bankName: string
  accountNickname: string
  currentBalance: number
  alertThreshold: number
  lastUpdated: string
  isConnected: boolean
  currency: string
  accountType: "operating" | "savings" | "investment" | "petty-cash"
}

export interface ReconciliationData {
  totalTransactions: number
  reconciledTransactions: number
  unreconciledTransactions: number
  percentageReconciled: number
  lastReconciledDate: string
  overdueReconciliations: number
  reconciliationCycleStart: string
  reconciliationCycleEnd: string
}

export interface CashFlowData {
  beginningCash: number
  cashFromOperations: number
  cashFromInvesting: number
  cashFromFinancing: number
  otherCashFlows: number
  endingCash: number
  budgetedOperations: number
  budgetedInvesting: number
  budgetedFinancing: number
  period: string
}

export interface PLCategory {
  name: string
  currentPeriod: number
  priorPeriod: number
  variance: number
  variancePercentage: number
  color: string
  isPositive: boolean
}

export interface FinancialRatio {
  name: string
  currentValue: number
  priorValue: number
  change: number
  changePercentage: number
  unit: string
  formula: string
  description: string
  historicalData: number[]
  benchmark: {
    excellent: number
    good: number
    poor: number
  }
  isHigherBetter: boolean
}

export interface DashboardData {
  trialBalance: TrialBalanceData
  glActivity: GLAccountActivity[]
  bankAccounts: BankAccount[]
  reconciliation: ReconciliationData
  cashFlow: CashFlowData
  plPerformance: PLCategory[]
  financialRatios: FinancialRatio[]
}

export function useDashboardData(filters: DashboardFilters) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock data generator - in real implementation, this would call actual API endpoints
  const generateMockData = useMemo(() => {
    const baseAmount =
      filters.period === "qtd"
        ? 2500000
        : filters.period === "ytd"
          ? 15000000
          : 850000

    return {
      trialBalance: {
        totalDebits: baseAmount * 1.02,
        totalCredits: baseAmount * 0.98,
        netChange: baseAmount * 0.04,
        varianceThreshold: 1000,
        historicalData: Array.from({ length: 12 }, (_, i) => ({
          period: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 7),
          netChange: baseAmount * (0.02 + Math.random() * 0.06 - 0.03),
        })),
        lastUpdated: new Date().toISOString(),
      },

      glActivity: [
        { name: "Cash - Operating", code: "1000", type: "Asset" },
        { name: "Accounts Receivable", code: "1100", type: "Asset" },
        { name: "Inventory", code: "1200", type: "Asset" },
        { name: "Accounts Payable", code: "2000", type: "Liability" },
        { name: "Accrued Expenses", code: "2100", type: "Liability" },
        { name: "Software Expense", code: "5000", type: "Expense" },
        { name: "Office Supplies", code: "5100", type: "Expense" },
        { name: "Professional Services", code: "5200", type: "Expense" },
        { name: "Sales Revenue", code: "4000", type: "Revenue" },
        { name: "Service Revenue", code: "4100", type: "Revenue" },
      ]
        .map((account, index) => {
          const baseActivity =
            filters.period === "qtd" ? 150 : filters.period === "ytd" ? 450 : 45
          const transactionCount = Math.floor(
            baseActivity * (0.8 + Math.random() * 0.4)
          )
          const absoluteBalanceChange = Math.floor(
            transactionCount * (500 + Math.random() * 2000)
          )
          const variancePercentage = (Math.random() - 0.5) * 100

          return {
            accountId: `acc-${index + 1}`,
            accountName: account.name,
            accountCode: account.code,
            transactionCount,
            absoluteBalanceChange,
            variancePercentage,
            accountType: account.type,
          }
        })
        .sort((a, b) => b.absoluteBalanceChange - a.absoluteBalanceChange)
        .slice(0, 10),

      bankAccounts: [
        {
          name: "JPMorgan Chase",
          nickname: "Operating",
          type: "operating" as const,
        },
        {
          name: "Bank of America",
          nickname: "Savings",
          type: "savings" as const,
        },
        {
          name: "Wells Fargo",
          nickname: "Investment",
          type: "investment" as const,
        },
        {
          name: "Local Credit Union",
          nickname: "Petty Cash",
          type: "petty-cash" as const,
        },
      ].map((bank, index) => {
        const baseBalance = 500000 + index * 200000 + Math.random() * 300000
        const alertThreshold = baseBalance * 0.1
        const isLowBalance = baseBalance < alertThreshold * 2
        const isConnected = Math.random() > 0.1

        return {
          accountId: `bank-${index + 1}`,
          bankName: bank.name,
          accountNickname: bank.nickname,
          currentBalance: isLowBalance ? alertThreshold * 1.5 : baseBalance,
          alertThreshold,
          lastUpdated: new Date(
            Date.now() - Math.random() * 300000
          ).toISOString(),
          isConnected,
          currency: "USD",
          accountType: bank.type,
        }
      }),

      reconciliation: {
        totalTransactions:
          filters.period === "qtd"
            ? 1250
            : filters.period === "ytd"
              ? 5500
              : 425,
        reconciledTransactions: Math.floor(
          (filters.period === "qtd"
            ? 1250
            : filters.period === "ytd"
              ? 5500
              : 425) *
            (0.85 + Math.random() * 0.1)
        ),
        unreconciledTransactions: 0, // Will be calculated
        percentageReconciled: 0, // Will be calculated
        lastReconciledDate: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        overdueReconciliations: 0, // Will be calculated
        reconciliationCycleStart: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ).toISOString(),
        reconciliationCycleEnd: new Date().toISOString(),
      },

      cashFlow: {
        beginningCash: baseAmount * 2,
        cashFromOperations: baseAmount * 1.5,
        cashFromInvesting: -baseAmount * 0.8,
        cashFromFinancing: baseAmount * 0.3,
        otherCashFlows: baseAmount * 0.1,
        endingCash: baseAmount * 3,
        budgetedOperations: baseAmount * 1.3,
        budgetedInvesting: -baseAmount * 0.6,
        budgetedFinancing: baseAmount * 0.4,
        period:
          filters.period === "mtd"
            ? "Month-to-Date"
            : filters.period === "qtd"
              ? "Quarter-to-Date"
              : "Year-to-Date",
      },

      plPerformance: [
        { name: "Revenue", base: baseAmount * 2, isPositive: true },
        { name: "COGS", base: baseAmount * 1.2, isPositive: false },
        { name: "Gross Profit", base: baseAmount * 0.8, isPositive: true },
        {
          name: "Operating Expenses",
          base: baseAmount * 0.6,
          isPositive: false,
        },
        { name: "EBITDA", base: baseAmount * 0.3, isPositive: true },
        { name: "Net Income", base: baseAmount * 0.2, isPositive: true },
      ].map((category, index) => {
        const currentPeriodAmount = category.base * (0.9 + Math.random() * 0.2)
        const priorPeriodAmount = category.base * (0.85 + Math.random() * 0.3)
        const variance = currentPeriodAmount - priorPeriodAmount
        const variancePercentage =
          (variance / Math.abs(priorPeriodAmount)) * 100

        return {
          name: category.name,
          currentPeriod: currentPeriodAmount,
          priorPeriod: priorPeriodAmount,
          variance,
          variancePercentage,
          color:
            index === 0
              ? "bg-blue-500"
              : index === 1
                ? "bg-red-500"
                : index === 2
                  ? "bg-green-500"
                  : index === 3
                    ? "bg-orange-500"
                    : index === 4
                      ? "bg-purple-500"
                      : "bg-emerald-500",
          isPositive: category.isPositive,
        }
      }),

      financialRatios: [
        {
          name: "Current Ratio",
          current: 1.65,
          prior: 1.5,
          formula: "Current Assets / Current Liabilities",
          description:
            "Measures short-term liquidity and ability to pay current obligations",
          benchmark: { excellent: 2.0, good: 1.5, poor: 1.0 },
          isHigherBetter: true,
        },
        {
          name: "Quick Ratio",
          current: 1.25,
          prior: 1.15,
          formula:
            "(Cash + Marketable Securities + Net Receivables) / Current Liabilities",
          description:
            "More stringent measure of short-term liquidity excluding inventory",
          benchmark: { excellent: 1.5, good: 1.0, poor: 0.5 },
          isHigherBetter: true,
        },
        {
          name: "Debt-to-Equity",
          current: 0.45,
          prior: 0.52,
          formula: "Total Liabilities / Total Shareholders' Equity",
          description: "Measures financial leverage and risk level",
          benchmark: { excellent: 0.3, good: 0.5, poor: 1.0 },
          isHigherBetter: false,
        },
        {
          name: "Gross Margin %",
          current: 42.5,
          prior: 38.2,
          formula: "((Revenue - COGS) / Revenue) × 100",
          description: "Percentage of revenue remaining after direct costs",
          benchmark: { excellent: 50, good: 35, poor: 20 },
          isHigherBetter: true,
        },
        {
          name: "Operating Cash Flow Ratio",
          current: 0.85,
          prior: 0.72,
          formula: "Cash from Operations / Current Liabilities",
          description:
            "Ability to cover current liabilities with operating cash flow",
          benchmark: { excellent: 1.0, good: 0.8, poor: 0.5 },
          isHigherBetter: true,
        },
        {
          name: "Return on Equity",
          current: 18.5,
          prior: 15.2,
          formula: "Net Income / Average Shareholders' Equity × 100",
          description: "Return generated on shareholders' investment",
          benchmark: { excellent: 20, good: 15, poor: 10 },
          isHigherBetter: true,
        },
      ].map((ratio, _index) => {
        const change = ratio.current - ratio.prior
        const changePercentage = (change / ratio.prior) * 100

        const historicalData = Array.from({ length: 12 }, (_, i) => {
          const baseValue = ratio.prior
          const trend = (ratio.current - ratio.prior) / 12
          const noise = (Math.random() - 0.5) * ratio.prior * 0.1
          return baseValue + trend * i + noise
        })

        return {
          name: ratio.name,
          currentValue: ratio.current,
          priorValue: ratio.prior,
          change,
          changePercentage,
          unit:
            ratio.name.includes("%") || ratio.name.includes("Margin")
              ? "%"
              : "x",
          formula: ratio.formula,
          description: ratio.description,
          historicalData,
          benchmark: ratio.benchmark,
          isHigherBetter: ratio.isHigherBetter,
        }
      }),
    }
  }, [filters])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Calculate derived values
        const mockData = { ...generateMockData }
        mockData.reconciliation.unreconciledTransactions =
          mockData.reconciliation.totalTransactions -
          mockData.reconciliation.reconciledTransactions
        mockData.reconciliation.percentageReconciled =
          (mockData.reconciliation.reconciledTransactions /
            mockData.reconciliation.totalTransactions) *
          100
        mockData.reconciliation.overdueReconciliations = Math.floor(
          mockData.reconciliation.unreconciledTransactions * 0.3
        )

        setData(mockData)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch dashboard data"
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [filters, generateMockData])

  return {
    data,
    isLoading,
    error,
    refetch: () => {
      // Trigger a refetch by updating the timestamp
      setData(null)
      setIsLoading(true)
    },
  }
}
