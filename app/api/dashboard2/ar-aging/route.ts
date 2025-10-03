import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agingAsOfDate = searchParams.get("agingAsOfDate")
    const salesperson = searchParams.get("salesperson")
    const customerSegments =
      searchParams.get("customerSegments")?.split(",") || []
    const includeCreditHold = searchParams.get("includeCreditHold") === "true"

    // Mock AR aging data
    const arAgingData = {
      summary: {
        current: 125000,
        days31to60: 45000,
        days61to90: 25000,
        over90: 15000,
        totalOutstanding: 210000,
        overdueAmount: 40000,
      },
      agingBuckets: [
        {
          bucket: "Current (0-30 days)",
          amount: 125000,
          percentage: 59.5,
          count: 45,
        },
        {
          bucket: "31-60 days",
          amount: 45000,
          percentage: 21.4,
          count: 18,
        },
        {
          bucket: "61-90 days",
          amount: 25000,
          percentage: 11.9,
          count: 12,
        },
        {
          bucket: "Over 90 days",
          amount: 15000,
          percentage: 7.1,
          count: 8,
        },
      ],
      trends: {
        vsLastMonth: {
          current: 5.2,
          days31to60: -12.3,
          days61to90: 8.7,
          over90: -15.4,
        },
        vsLastYear: {
          current: 12.8,
          days31to60: -8.9,
          days61to90: 15.2,
          over90: -22.1,
        },
      },
    }

    return NextResponse.json({
      success: true,
      data: arAgingData,
      filters: {
        agingAsOfDate,
        salesperson,
        customerSegments,
        includeCreditHold,
      },
    })
  } catch (error) {
    console.error("AR Aging API Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch AR aging data" },
      { status: 500 }
    )
  }
}
