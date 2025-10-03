import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agingAsOfDate = searchParams.get("agingAsOfDate")
    const salesperson = searchParams.get("salesperson")
    const customerSegments =
      searchParams.get("customerSegments")?.split(",") || []
    const includeCreditHold = searchParams.get("includeCreditHold") === "true"
    const dateRange = searchParams.get("dateRange")

    // Mock data for AR & Collections dashboard
    const dashboardData = {
      arAgingSummary: {
        current: 125000,
        days31to60: 45000,
        days61to90: 25000,
        over90: 15000,
        totalOutstanding: 210000,
        overdueAmount: 40000,
      },
      collectionEffectiveness: {
        collectionRate: 85.2,
        averageDSO: 32,
        cashCollected: 180000,
        outstandingReduction: -12.5,
      },
      creditLimitAlerts: [
        {
          customerName: "ABC Corp",
          creditLimit: 50000,
          utilization: 95,
          status: "critical",
        },
        {
          customerName: "XYZ Ltd",
          creditLimit: 25000,
          utilization: 80,
          status: "warning",
        },
        {
          customerName: "DEF Inc",
          creditLimit: 30000,
          utilization: 105,
          status: "exceeded",
        },
      ],
      dsoTrend: {
        currentDSO: 32,
        changeFromLastMonth: -3,
        industryAverage: 35,
        targetDSO: 30,
        performance: "above-target",
      },
      overdueInvoices: [
        {
          id: "INV-001",
          customer: "ABC Corp",
          amount: 15000,
          dueDate: "2024-01-15",
          daysOverdue: 15,
          status: "Overdue",
        },
        {
          id: "INV-002",
          customer: "XYZ Ltd",
          amount: 8500,
          dueDate: "2024-01-20",
          daysOverdue: 10,
          status: "Overdue",
        },
        {
          id: "INV-003",
          customer: "DEF Inc",
          amount: 12000,
          dueDate: "2024-01-25",
          daysOverdue: 5,
          status: "Overdue",
        },
      ],
      topCustomersByOutstanding: [
        {
          name: "ABC Corp",
          outstanding: 45000,
          creditLimit: 50000,
          utilization: 90,
        },
        {
          name: "XYZ Ltd",
          outstanding: 32000,
          creditLimit: 40000,
          utilization: 80,
        },
        {
          name: "DEF Inc",
          outstanding: 28000,
          creditLimit: 35000,
          utilization: 80,
        },
        {
          name: "GHI Co",
          outstanding: 22000,
          creditLimit: 30000,
          utilization: 73,
        },
        {
          name: "JKL Ltd",
          outstanding: 18000,
          creditLimit: 25000,
          utilization: 72,
        },
      ],
      topCustomersByRevenue: [
        {
          name: "ABC Corp",
          revenue: 125000,
          growth: 15.2,
          status: "Growing",
        },
        {
          name: "XYZ Ltd",
          revenue: 98000,
          growth: 8.5,
          status: "Stable",
        },
        {
          name: "DEF Inc",
          revenue: 87000,
          growth: -5.2,
          status: "Declining",
        },
        {
          name: "GHI Co",
          revenue: 72000,
          growth: 22.1,
          status: "Growing",
        },
        {
          name: "JKL Ltd",
          revenue: 65000,
          growth: 12.3,
          status: "Growing",
        },
      ],
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
      filters: {
        agingAsOfDate,
        salesperson,
        customerSegments,
        includeCreditHold,
        dateRange,
      },
    })
  } catch (error) {
    console.error("Dashboard2 API Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
