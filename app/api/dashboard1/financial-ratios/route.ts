import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, this would:
    // 1. Query GL_Accounts for current balances
    // 2. Calculate ratios using the formulas
    // 3. Compare with historical data
    // 4. Apply RLS based on user permissions
    // For now, we'll return mock data

    const ratios = [
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
    ]

    const financialRatiosData = ratios.map((ratio, index) => {
      const change = ratio.current - ratio.prior
      const changePercentage = (change / ratio.prior) * 100

      // Generate historical data (12 months)
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
          ratio.name.includes("%") || ratio.name.includes("Margin") ? "%" : "x",
        formula: ratio.formula,
        description: ratio.description,
        historicalData,
        benchmark: ratio.benchmark,
        isHigherBetter: ratio.isHigherBetter,
      }
    })

    return NextResponse.json(financialRatiosData)
  } catch (error) {
    console.error("Error fetching financial ratios data:", error)
    return NextResponse.json(
      { error: "Failed to fetch financial ratios data" },
      { status: 500 }
    )
  }
}
