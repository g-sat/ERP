import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agingAsOfDate = searchParams.get("agingAsOfDate")
    const dateRange = searchParams.get("dateRange")
    const salesperson = searchParams.get("salesperson")
    const customerSegments =
      searchParams.get("customerSegments")?.split(",") || []
    const includeCreditHold = searchParams.get("includeCreditHold") === "true"
    const type = searchParams.get("type") || "outstanding" // or "revenue"

    // Mock top customers data
    const topCustomersData = {
      byOutstanding: [
        {
          name: "ABC Corp",
          outstanding: 45000,
          creditLimit: 50000,
          utilization: 90,
          daysOverdue: 0,
          lastPaymentDate: "2024-01-10",
          customerSegment: "Enterprise",
          salesperson: "John Smith",
        },
        {
          name: "XYZ Ltd",
          outstanding: 32000,
          creditLimit: 40000,
          utilization: 80,
          daysOverdue: 0,
          lastPaymentDate: "2024-01-15",
          customerSegment: "Mid-Market",
          salesperson: "Jane Doe",
        },
        {
          name: "DEF Inc",
          outstanding: 28000,
          creditLimit: 35000,
          utilization: 80,
          daysOverdue: 5,
          lastPaymentDate: "2023-12-20",
          customerSegment: "SMB",
          salesperson: "Mike Johnson",
        },
        {
          name: "GHI Co",
          outstanding: 22000,
          creditLimit: 30000,
          utilization: 73,
          daysOverdue: 0,
          lastPaymentDate: "2024-01-12",
          customerSegment: "Enterprise",
          salesperson: "Sarah Wilson",
        },
        {
          name: "JKL Ltd",
          outstanding: 18000,
          creditLimit: 25000,
          utilization: 72,
          daysOverdue: 2,
          lastPaymentDate: "2024-01-08",
          customerSegment: "Mid-Market",
          salesperson: "John Smith",
        },
      ],
      byRevenue: [
        {
          name: "ABC Corp",
          revenue: 125000,
          growth: 15.2,
          status: "Growing",
          customerSegment: "Enterprise",
          salesperson: "John Smith",
          lastOrderDate: "2024-01-25",
        },
        {
          name: "XYZ Ltd",
          revenue: 98000,
          growth: 8.5,
          status: "Stable",
          customerSegment: "Mid-Market",
          salesperson: "Jane Doe",
          lastOrderDate: "2024-01-20",
        },
        {
          name: "DEF Inc",
          revenue: 87000,
          growth: -5.2,
          status: "Declining",
          customerSegment: "SMB",
          salesperson: "Mike Johnson",
          lastOrderDate: "2024-01-15",
        },
        {
          name: "GHI Co",
          revenue: 72000,
          growth: 22.1,
          status: "Growing",
          customerSegment: "Enterprise",
          salesperson: "Sarah Wilson",
          lastOrderDate: "2024-01-22",
        },
        {
          name: "JKL Ltd",
          revenue: 65000,
          growth: 12.3,
          status: "Growing",
          customerSegment: "Mid-Market",
          salesperson: "John Smith",
          lastOrderDate: "2024-01-18",
        },
      ],
      summary: {
        totalCustomers: 5,
        totalOutstanding: 145000,
        totalRevenue: 447000,
        averageUtilization: 78.5,
        averageGrowth: 10.6,
      },
      trends: {
        vsLastMonth: {
          outstandingChange: 5.2,
          revenueChange: 8.7,
          newCustomers: 2,
          lostCustomers: 1,
        },
        vsLastYear: {
          outstandingChange: 12.8,
          revenueChange: 15.3,
          newCustomers: 8,
          lostCustomers: 3,
        },
      },
    }

    return NextResponse.json({
      success: true,
      data: topCustomersData,
      filters: {
        agingAsOfDate,
        dateRange,
        salesperson,
        customerSegments,
        includeCreditHold,
        type,
      },
    })
  } catch (error) {
    console.error("Top Customers API Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch top customers data" },
      { status: 500 }
    )
  }
}
