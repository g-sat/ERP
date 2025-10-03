import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agingAsOfDate = searchParams.get("agingAsOfDate")
    const salesperson = searchParams.get("salesperson")
    const customerSegments =
      searchParams.get("customerSegments")?.split(",") || []
    const includeCreditHold = searchParams.get("includeCreditHold") === "true"

    // Mock overdue invoices data
    const overdueInvoicesData = {
      invoices: [
        {
          id: "INV-001",
          invoiceNumber: "INV-2024-001",
          customer: "ABC Corp",
          amount: 15000,
          dueDate: "2024-01-15",
          daysOverdue: 15,
          status: "Overdue",
          salesperson: "John Smith",
          customerSegment: "Enterprise",
          lastContactDate: "2024-01-20",
          nextAction: "Follow up call",
        },
        {
          id: "INV-002",
          invoiceNumber: "INV-2024-002",
          customer: "XYZ Ltd",
          amount: 8500,
          dueDate: "2024-01-20",
          daysOverdue: 10,
          status: "Overdue",
          salesperson: "Jane Doe",
          customerSegment: "Mid-Market",
          lastContactDate: "2024-01-22",
          nextAction: "Send reminder email",
        },
        {
          id: "INV-003",
          invoiceNumber: "INV-2024-003",
          customer: "DEF Inc",
          amount: 12000,
          dueDate: "2024-01-25",
          daysOverdue: 5,
          status: "Overdue",
          salesperson: "Mike Johnson",
          customerSegment: "SMB",
          lastContactDate: "2024-01-28",
          nextAction: "Payment plan discussion",
        },
        {
          id: "INV-004",
          invoiceNumber: "INV-2024-004",
          customer: "GHI Co",
          amount: 22000,
          dueDate: "2024-01-10",
          daysOverdue: 20,
          status: "Overdue",
          salesperson: "Sarah Wilson",
          customerSegment: "Enterprise",
          lastContactDate: "2024-01-18",
          nextAction: "Legal notice",
        },
        {
          id: "INV-005",
          invoiceNumber: "INV-2024-005",
          customer: "JKL Ltd",
          amount: 18000,
          dueDate: "2024-01-12",
          daysOverdue: 18,
          status: "Overdue",
          salesperson: "John Smith",
          customerSegment: "Mid-Market",
          lastContactDate: "2024-01-20",
          nextAction: "Collection agency",
        },
      ],
      summary: {
        totalOverdue: 5,
        totalAmount: 75500,
        averageDaysOverdue: 13.6,
        criticalOverdue: 2, // > 15 days
        moderateOverdue: 3, // 5-15 days
      },
      breakdown: {
        byDaysOverdue: [
          { range: "1-7 days", count: 0, amount: 0 },
          { range: "8-15 days", count: 2, amount: 20500 },
          { range: "16-30 days", count: 2, amount: 40000 },
          { range: "31+ days", count: 1, amount: 15000 },
        ],
        bySalesperson: [
          { salesperson: "John Smith", count: 2, amount: 33000 },
          { salesperson: "Jane Doe", count: 1, amount: 8500 },
          { salesperson: "Mike Johnson", count: 1, amount: 12000 },
          { salesperson: "Sarah Wilson", count: 1, amount: 22000 },
        ],
        byCustomerSegment: [
          { segment: "Enterprise", count: 2, amount: 37000 },
          { segment: "Mid-Market", count: 2, amount: 26500 },
          { segment: "SMB", count: 1, amount: 12000 },
        ],
      },
    }

    return NextResponse.json({
      success: true,
      data: overdueInvoicesData,
      filters: {
        agingAsOfDate,
        salesperson,
        customerSegments,
        includeCreditHold,
      },
    })
  } catch (error) {
    console.error("Overdue Invoices API Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch overdue invoices data" },
      { status: 500 }
    )
  }
}
