import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const _period = searchParams.get("period") || "mtd"
    const _entities = searchParams.get("entities")?.split(",") || []

    // In a real implementation, this would:
    // 1. Query the Bank_Accounts table for account details
    // 2. Make real-time API calls to banking services (e.g., Plaid)
    // 3. Fall back to Last_Known_Balance if API is unavailable
    // For now, we'll return mock data

    const banks = [
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
    ]

    const bankAccountsData = banks.map((bank, index) => {
      const baseBalance = 500000 + index * 200000 + Math.random() * 300000
      const alertThreshold = baseBalance * 0.1 // 10% of balance as threshold
      const isLowBalance = baseBalance < alertThreshold * 2
      const isConnected = Math.random() > 0.1 // 90% connection rate

      return {
        accountId: `bank-${index + 1}`,
        bankName: bank.name,
        accountNickname: bank.nickname,
        currentBalance: isLowBalance ? alertThreshold * 1.5 : baseBalance,
        alertThreshold,
        lastUpdated: new Date(
          Date.now() - Math.random() * 300000
        ).toISOString(), // Last 5 minutes
        isConnected,
        currency: "USD",
        accountType: bank.type,
      }
    })

    return NextResponse.json(bankAccountsData)
  } catch (error) {
    console.error("Error fetching bank balances data:", error)
    return NextResponse.json(
      { error: "Failed to fetch bank balances data" },
      { status: 500 }
    )
  }
}
