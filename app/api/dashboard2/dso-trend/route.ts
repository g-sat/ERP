import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get("dateRange")
    const salesperson = searchParams.get("salesperson")
    const customerSegments =
      searchParams.get("customerSegments")?.split(",") || []
    const includeCreditHold = searchParams.get("includeCreditHold") === "true"

    // Mock DSO trend data
    const dsoTrendData = {
      current: {
        dso: 32,
        changeFromLastMonth: -3,
        changeFromLastYear: -5,
      },
      benchmarks: {
        industryAverage: 35,
        targetDSO: 30,
        companyAverage: 32,
      },
      performance: {
        vsTarget: -2, // 2 days below target (good)
        vsIndustry: -3, // 3 days below industry (good)
        vsLastMonth: -3, // improved by 3 days
        vsLastYear: -5, // improved by 5 days
      },
      monthlyTrend: [
        { month: "Jan 2023", dso: 37, sales: 150000, receivables: 185000 },
        { month: "Feb 2023", dso: 35, sales: 165000, receivables: 192000 },
        { month: "Mar 2023", dso: 33, sales: 180000, receivables: 198000 },
        { month: "Apr 2023", dso: 35, sales: 175000, receivables: 204000 },
        { month: "May 2023", dso: 34, sales: 190000, receivables: 215000 },
        { month: "Jun 2023", dso: 32, sales: 200000, receivables: 220000 },
        { month: "Jul 2023", dso: 33, sales: 195000, receivables: 225000 },
        { month: "Aug 2023", dso: 31, sales: 210000, receivables: 230000 },
        { month: "Sep 2023", dso: 30, sales: 220000, receivables: 235000 },
        { month: "Oct 2023", dso: 32, sales: 215000, receivables: 240000 },
        { month: "Nov 2023", dso: 33, sales: 225000, receivables: 245000 },
        { month: "Dec 2023", dso: 32, sales: 230000, receivables: 250000 },
      ],
      customerSegments: [
        { segment: "Enterprise", dso: 28, count: 15 },
        { segment: "Mid-Market", dso: 35, count: 25 },
        { segment: "SMB", dso: 38, count: 40 },
        { segment: "Government", dso: 45, count: 8 },
      ],
      recommendations: [
        "Focus on SMB segment - highest DSO at 38 days",
        "Implement automated payment reminders for overdue accounts",
        "Consider offering early payment discounts",
        "Review credit terms for government contracts",
      ],
    }

    return NextResponse.json({
      success: true,
      data: dsoTrendData,
      filters: {
        dateRange,
        salesperson,
        customerSegments,
        includeCreditHold,
      },
    })
  } catch (error) {
    console.error("DSO Trend API Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch DSO trend data" },
      { status: 500 }
    )
  }
}
