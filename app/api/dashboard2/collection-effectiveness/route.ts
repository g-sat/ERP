import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get("dateRange")
    const salesperson = searchParams.get("salesperson")
    const customerSegments =
      searchParams.get("customerSegments")?.split(",") || []

    // Mock collection effectiveness data
    const collectionData = {
      metrics: {
        collectionRate: 85.2,
        averageDSO: 32,
        cashCollected: 180000,
        outstandingReduction: -12.5,
      },
      trends: {
        collectionRate: {
          current: 85.2,
          previous: 82.1,
          change: 3.1,
          trend: "up",
        },
        dso: {
          current: 32,
          previous: 35,
          change: -3,
          trend: "down",
        },
        cashCollected: {
          current: 180000,
          previous: 165000,
          change: 15000,
          trend: "up",
        },
      },
      performance: {
        vsTarget: {
          collectionRate: 5.2, // above target
          dso: -2, // below target (good)
        },
        vsIndustry: {
          collectionRate: 8.7, // above industry
          dso: -3, // below industry (good)
        },
      },
      monthlyBreakdown: [
        { month: "Jan", collectionRate: 82.1, dso: 35, cashCollected: 165000 },
        { month: "Feb", collectionRate: 83.5, dso: 34, cashCollected: 172000 },
        { month: "Mar", collectionRate: 85.2, dso: 32, cashCollected: 180000 },
      ],
    }

    return NextResponse.json({
      success: true,
      data: collectionData,
      filters: {
        dateRange,
        salesperson,
        customerSegments,
      },
    })
  } catch (error) {
    console.error("Collection Effectiveness API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch collection effectiveness data",
      },
      { status: 500 }
    )
  }
}
