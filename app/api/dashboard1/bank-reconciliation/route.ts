import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "mtd"

    // In a real implementation, this would query the Bank_Transactions table
    // For now, we'll return mock data
    const totalTransactions =
      period === "qtd" ? 1250 : period === "ytd" ? 5500 : 425
    const reconciliationRate = 0.85 + Math.random() * 0.1 // 85-95% reconciled
    const reconciledTransactions = Math.floor(
      totalTransactions * reconciliationRate
    )
    const unreconciledTransactions = totalTransactions - reconciledTransactions
    const percentageReconciled =
      (reconciledTransactions / totalTransactions) * 100
    const overdueReconciliations = Math.floor(unreconciledTransactions * 0.3)

    const reconciliationData = {
      totalTransactions,
      reconciledTransactions,
      unreconciledTransactions,
      percentageReconciled,
      lastReconciledDate: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      overdueReconciliations,
      reconciliationCycleStart: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toISOString(),
      reconciliationCycleEnd: new Date().toISOString(),
    }

    return NextResponse.json(reconciliationData)
  } catch (error) {
    console.error("Error fetching bank reconciliation data:", error)
    return NextResponse.json(
      { error: "Failed to fetch bank reconciliation data" },
      { status: 500 }
    )
  }
}
