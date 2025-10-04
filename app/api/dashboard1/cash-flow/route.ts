import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "mtd"

    // In a real implementation, this would:
    // 1. Query GL_Journal_Lines with CashFlow_Category mapping
    // 2. Use pre-calculated materialized views for performance
    // 3. Apply Row-Level Security (RLS) based on user permissions
    // For now, we'll return mock data

    const baseAmount =
      period === "qtd" ? 2500000 : period === "ytd" ? 15000000 : 850000

    const cashFlowData = {
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
        period === "mtd"
          ? "Month-to-Date"
          : period === "qtd"
            ? "Quarter-to-Date"
            : "Year-to-Date",
    }

    return NextResponse.json(cashFlowData)
  } catch (error) {
    console.error("Error fetching cash flow data:", error)
    return NextResponse.json(
      { error: "Failed to fetch cash flow data" },
      { status: 500 }
    )
  }
}
