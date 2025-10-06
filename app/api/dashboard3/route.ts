import { NextRequest, NextResponse } from "next/server"
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const widget = searchParams.get("widget")
    const companyId = searchParams.get("companyId")
    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      )
    }
    // Mock data responses for different widgets
    const mockData: { [key: string]: Record<string, unknown> } = {
      "ap-aging": {
        agingData: [
          {
            bucket: "Current (0-30)",
            amount: 1247500,
            count: 127,
            color: "#22c55e",
          },
          {
            bucket: "31-60 Days",
            amount: 892300,
            count: 89,
            color: "#eab308",
          },
          {
            bucket: "61-90 Days",
            amount: 456200,
            count: 42,
            color: "#f97316",
          },
          {
            bucket: "91+ Days",
            amount: 251392,
            count: 23,
            color: "#ef4444",
          },
        ],
        totalAP: 2847392,
        totalDue30Days: 1247500,
      },
      "top-suppliers-balance": {
        suppliers: [
          {
            id: "1",
            name: "Acme Manufacturing Ltd.",
            totalDue: 485750,
            paymentTerms: "Net 30",
            nextPaymentDate: "2024-01-15",
            relationshipStatus: "good",
            invoiceCount: 12,
            avgPaymentDays: 28,
          },
          {
            id: "2",
            name: "Global Logistics Inc.",
            totalDue: 342900,
            paymentTerms: "Net 45",
            nextPaymentDate: "2024-01-18",
            relationshipStatus: "watch",
            invoiceCount: 8,
            avgPaymentDays: 35,
          },
          // Add more suppliers as needed
        ],
      },
      "top-suppliers-spend": {
        suppliers: [
          {
            id: "1",
            name: "Acme Manufacturing Ltd.",
            category: "Raw Materials",
            ytdSpend: 2847500,
            pctOfTotal: 18.5,
            invoiceCount: 45,
            avgInvoiceValue: 63278,
            growthRate: 12.3,
          },
          {
            id: "2",
            name: "Global Logistics Inc.",
            category: "Logistics",
            ytdSpend: 1923400,
            pctOfTotal: 12.5,
            invoiceCount: 32,
            avgInvoiceValue: 60106,
            growthRate: 8.7,
          },
          // Add more suppliers as needed
        ],
        totalYTDSpend: 15350000,
        top10Percentage: 67.8,
      },
      "payments-calendar": {
        payments: [
          {
            id: "1",
            invoiceNumber: "INV-2024-001",
            supplierName: "Acme Manufacturing Ltd.",
            dueDate: "2024-01-08",
            amount: 48500,
            paymentTerms: "Net 30",
            approvalStatus: "approved",
            paymentPriority: "past_due",
            daysUntilDue: -2,
            originalAmount: 50000,
            discountAvailable: true,
            discountAmount: 1500,
          },
          {
            id: "2",
            invoiceNumber: "INV-2024-002",
            supplierName: "Global Logistics Inc.",
            dueDate: "2024-01-10",
            amount: 34200,
            paymentTerms: "Net 45",
            approvalStatus: "approved",
            paymentPriority: "urgent",
            daysUntilDue: 0,
            originalAmount: 34200,
            discountAvailable: false,
          },
          // Add more payments as needed
        ],
      },
      "discount-tracker": {
        opportunities: [
          {
            id: "1",
            supplierName: "Acme Manufacturing Ltd.",
            invoiceNumber: "INV-2024-001",
            dueDate: "2024-01-30",
            discountTerms: "2/10 Net 30",
            discountExpiryDate: "2024-01-10",
            potentialSavings: 1000,
            discountStatus: "active",
            invoiceAmount: 50000,
            discountPercent: 2,
            discountDays: 10,
            daysUntilExpiry: 3,
          },
          {
            id: "2",
            supplierName: "Tech Solutions Corp.",
            invoiceNumber: "INV-2024-003",
            dueDate: "2024-02-12",
            discountTerms: "1.5/15 Net 30",
            discountExpiryDate: "2024-01-12",
            potentialSavings: 447,
            discountStatus: "active",
            invoiceAmount: 29800,
            discountPercent: 1.5,
            discountDays: 15,
            daysUntilExpiry: 5,
          },
          // Add more opportunities as needed
        ],
        totalPotentialSavings: 18450,
        expiringSoonCount: 5,
      },
      "approval-pipeline": {
        columns: [
          {
            id: "received",
            title: "Received (Draft)",
            status: "received",
            count: 15,
            totalAmount: 342500,
            invoices: [
              {
                id: "1",
                invoiceNumber: "INV-2024-012",
                supplierName: "Office Depot Inc.",
                amount: 2500,
                daysInStage: 1,
                currentApprover: "AP Clerk",
                receivedDate: "2024-01-07",
                priority: "low",
                category: "Office Supplies",
              },
              // Add more invoices as needed
            ],
          },
          {
            id: "review",
            title: "In Review",
            status: "review",
            count: 12,
            totalAmount: 287600,
            invoices: [],
          },
          {
            id: "pending",
            title: "Pending Approval",
            status: "pending",
            count: 18,
            totalAmount: 456300,
            invoices: [],
          },
          {
            id: "approved",
            title: "Approved",
            status: "approved",
            count: 25,
            totalAmount: 678900,
            invoices: [],
          },
          {
            id: "rejected",
            title: "Rejected",
            status: "rejected",
            count: 3,
            totalAmount: 15600,
            invoices: [],
          },
        ],
        avgApprovalTime: 4.2,
        invoicesStuckOver7Days: 12,
      },
      "dpo-trend": {
        trendData: [
          {
            quarter: "Q1 2023",
            actualDPO: 28.5,
            targetDPO: 30,
            industryBenchmark: 32,
            avgPaymentTerms: 29,
            totalAP: 2450000,
            cogs: 8500000,
            events: ["New payment terms implemented"],
          },
          {
            quarter: "Q2 2023",
            actualDPO: 31.2,
            targetDPO: 30,
            industryBenchmark: 32,
            avgPaymentTerms: 31,
            totalAP: 2680000,
            cogs: 9200000,
          },
          {
            quarter: "Q3 2023",
            actualDPO: 29.8,
            targetDPO: 30,
            industryBenchmark: 32,
            avgPaymentTerms: 30,
            totalAP: 2510000,
            cogs: 8800000,
          },
          {
            quarter: "Q4 2023",
            actualDPO: 32.4,
            targetDPO: 30,
            industryBenchmark: 32,
            avgPaymentTerms: 32,
            totalAP: 2890000,
            cogs: 8950000,
            events: ["Holiday season impact"],
          },
          {
            quarter: "Q1 2024",
            actualDPO: 30.1,
            targetDPO: 30,
            industryBenchmark: 32,
            avgPaymentTerms: 30,
            totalAP: 2650000,
            cogs: 9100000,
          },
        ],
        currentDPO: 30.1,
        targetDPO: 30,
        industryBenchmark: 32,
      },
    }
    if (widget && mockData[widget]) {
      return NextResponse.json({
        success: true,
        data: mockData[widget],
        timestamp: new Date().toISOString(),
      })
    }
    // Return all dashboard data if no specific widget requested
    return NextResponse.json({
      success: true,
      data: mockData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Dashboard3 API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, widget, companyId, data } = body
    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      )
    }
    // Handle different actions
    switch (action) {
      case "schedule-payment":
        // Mock payment scheduling
        return NextResponse.json({
          success: true,
          message: "Payment scheduled successfully",
          paymentId: `PAY-${Date.now()}`,
          scheduledDate: data.paymentDate,
        })
      case "approve-invoice":
        // Mock invoice approval
        return NextResponse.json({
          success: true,
          message: "Invoice approved successfully",
          approvalId: `APPR-${Date.now()}`,
          approvedBy: data.approvedBy,
          approvedAt: new Date().toISOString(),
        })
      case "reject-invoice":
        // Mock invoice rejection
        return NextResponse.json({
          success: true,
          message: "Invoice rejected successfully",
          rejectionId: `REJ-${Date.now()}`,
          rejectedBy: data.rejectedBy,
          rejectedAt: new Date().toISOString(),
          reason: data.reason,
        })
      case "request-extension":
        // Mock extension request
        return NextResponse.json({
          success: true,
          message: "Extension requested successfully",
          requestId: `EXT-${Date.now()}`,
          requestedBy: data.requestedBy,
          requestedAt: new Date().toISOString(),
          newDueDate: data.newDueDate,
        })
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Dashboard3 POST API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
