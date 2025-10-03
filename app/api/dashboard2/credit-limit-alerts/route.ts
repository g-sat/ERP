import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agingAsOfDate = searchParams.get("agingAsOfDate")
    const salesperson = searchParams.get("salesperson")
    const customerSegments =
      searchParams.get("customerSegments")?.split(",") || []
    const includeCreditHold = searchParams.get("includeCreditHold") === "true"

    // Mock credit limit alerts data
    const creditLimitData = {
      alerts: [
        {
          customerName: "ABC Corp",
          creditLimit: 50000,
          currentOutstanding: 47500,
          utilization: 95,
          status: "critical",
          daysOverdue: 0,
          lastPaymentDate: "2024-01-10",
        },
        {
          customerName: "XYZ Ltd",
          creditLimit: 25000,
          currentOutstanding: 20000,
          utilization: 80,
          status: "warning",
          daysOverdue: 0,
          lastPaymentDate: "2024-01-15",
        },
        {
          customerName: "DEF Inc",
          creditLimit: 30000,
          currentOutstanding: 31500,
          utilization: 105,
          status: "exceeded",
          daysOverdue: 5,
          lastPaymentDate: "2023-12-20",
        },
        {
          customerName: "GHI Co",
          creditLimit: 40000,
          currentOutstanding: 32000,
          utilization: 80,
          status: "warning",
          daysOverdue: 0,
          lastPaymentDate: "2024-01-12",
        },
        {
          customerName: "JKL Ltd",
          creditLimit: 20000,
          currentOutstanding: 19000,
          utilization: 95,
          status: "critical",
          daysOverdue: 2,
          lastPaymentDate: "2024-01-08",
        },
      ],
      summary: {
        totalCustomers: 5,
        criticalAlerts: 2,
        warningAlerts: 2,
        exceededLimit: 1,
        totalExposure: 150500,
        averageUtilization: 91,
      },
      trends: {
        vsLastMonth: {
          criticalAlerts: -1,
          warningAlerts: 0,
          exceededLimit: 1,
          averageUtilization: 2.5,
        },
      },
    }

    return NextResponse.json({
      success: true,
      data: creditLimitData,
      filters: {
        agingAsOfDate,
        salesperson,
        customerSegments,
        includeCreditHold,
      },
    })
  } catch (error) {
    console.error("Credit Limit Alerts API Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch credit limit alerts data" },
      { status: 500 }
    )
  }
}
