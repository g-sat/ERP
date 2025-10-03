import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "mtd"
    const _comparisonPeriod =
      searchParams.get("comparisonPeriod") || "prior-period"
    const _entities = searchParams.get("entities")?.split(",") || []

    // In a real implementation, this would query the database
    // For now, we'll return mock data
    const baseAmount =
      period === "qtd" ? 2500000 : period === "ytd" ? 15000000 : 850000

    const trialBalanceData = {
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
    }

    return NextResponse.json(trialBalanceData)
  } catch (error) {
    console.error("Error fetching trial balance data:", error)
    return NextResponse.json(
      { error: "Failed to fetch trial balance data" },
      { status: 500 }
    )
  }
}
