import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "mtd"
    const comparisonPeriod =
      searchParams.get("comparisonPeriod") || "prior-period"
    const entities = searchParams.get("entities")?.split(",") || []

    // In a real implementation, this would:
    // 1. Query GL_Journal_Lines filtered where Is_PL_Account = TRUE
    // 2. Group accounts by GL_Account_Category
    // 3. Compare current period vs selected comparison period
    // For now, we'll return mock data

    const baseAmount =
      period === "qtd" ? 2500000 : period === "ytd" ? 15000000 : 850000

    const categories = [
      { name: "Revenue", base: baseAmount * 2, isPositive: true },
      { name: "COGS", base: baseAmount * 1.2, isPositive: false },
      { name: "Gross Profit", base: baseAmount * 0.8, isPositive: true },
      { name: "Operating Expenses", base: baseAmount * 0.6, isPositive: false },
      { name: "EBITDA", base: baseAmount * 0.3, isPositive: true },
      { name: "Net Income", base: baseAmount * 0.2, isPositive: true },
    ]

    const plPerformanceData = categories.map((category, index) => {
      const currentPeriodAmount = category.base * (0.9 + Math.random() * 0.2)
      const priorPeriodAmount = category.base * (0.85 + Math.random() * 0.3)
      const variance = currentPeriodAmount - priorPeriodAmount
      const variancePercentage = (variance / Math.abs(priorPeriodAmount)) * 100

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
    })

    return NextResponse.json(plPerformanceData)
  } catch (error) {
    console.error("Error fetching P&L performance data:", error)
    return NextResponse.json(
      { error: "Failed to fetch P&L performance data" },
      { status: 500 }
    )
  }
}
