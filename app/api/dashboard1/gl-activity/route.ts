import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "mtd"
    const _comparisonPeriod =
      searchParams.get("comparisonPeriod") || "prior-period"
    const _entities = searchParams.get("entities")?.split(",") || []
    const viewMode = searchParams.get("viewMode") || "balance-change"

    // In a real implementation, this would query the GL_Journal_Lines and GL_Accounts tables
    // For now, we'll return mock data
    const accounts = [
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

    const baseActivity = period === "qtd" ? 150 : period === "ytd" ? 450 : 45

    const glActivityData = accounts.map((account, index) => {
      const transactionCount = Math.floor(
        baseActivity * (0.8 + Math.random() * 0.4)
      )
      const absoluteBalanceChange = Math.floor(
        transactionCount * (500 + Math.random() * 2000)
      )
      const variancePercentage = (Math.random() - 0.5) * 100 // -50% to +50%

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

    // Sort based on view mode and return top 10
    const sortedData = glActivityData
      .sort((a, b) => {
        if (viewMode === "transaction-count") {
          return b.transactionCount - a.transactionCount
        }
        return b.absoluteBalanceChange - a.absoluteBalanceChange
      })
      .slice(0, 10)

    return NextResponse.json(sortedData)
  } catch (error) {
    console.error("Error fetching GL activity data:", error)
    return NextResponse.json(
      { error: "Failed to fetch GL activity data" },
      { status: 500 }
    )
  }
}
