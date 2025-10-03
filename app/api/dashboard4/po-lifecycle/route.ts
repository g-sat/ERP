import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "ytd"
    const comparisonPeriod =
      searchParams.get("comparisonPeriod") || "prior-year"
    const businessUnits = searchParams.get("businessUnits")?.split(",") || []
    const productLines = searchParams.get("productLines")?.split(",") || []
    const geography = searchParams.get("geography")?.split(",") || []

    // Mock data - in real implementation, this would come from database
    const poLifecycleData = {
      summary: {
        totalOpenPOValue: 12500000,
        avgPOCycleTime: 25,
        threeWayMatchExceptions: 12.5,
        grniValue: 2300000,
        stuckPOs: 45,
        totalPOs: 1250,
      },
      lifecycleStages: [
        {
          stage: "POs Drafted",
          count: 1250,
          value: 8500000,
          percentage: 100,
          avgDays: 2,
          color: "#3b82f6",
          trend: 5.2,
          bottlenecks: [],
          efficiency: 95,
        },
        {
          stage: "POs Approved",
          count: 1180,
          value: 8100000,
          percentage: 94.4,
          avgDays: 3,
          color: "#8b5cf6",
          trend: -2.1,
          bottlenecks: ["Approval delays"],
          efficiency: 88,
        },
        {
          stage: "POs Sent",
          count: 1100,
          value: 7500000,
          percentage: 88.0,
          avgDays: 5,
          color: "#06b6d4",
          trend: 1.8,
          bottlenecks: [],
          efficiency: 92,
        },
        {
          stage: "Goods Received",
          count: 980,
          value: 6800000,
          percentage: 78.4,
          avgDays: 12,
          color: "#10b981",
          trend: -0.5,
          bottlenecks: ["Receipt processing delays"],
          efficiency: 85,
        },
        {
          stage: "Invoiced",
          count: 920,
          value: 6200000,
          percentage: 73.6,
          avgDays: 18,
          color: "#f59e0b",
          trend: 3.2,
          bottlenecks: ["Invoice matching issues"],
          efficiency: 78,
        },
        {
          stage: "Paid",
          count: 890,
          value: 5900000,
          percentage: 71.2,
          avgDays: 25,
          color: "#ef4444",
          trend: 2.1,
          bottlenecks: ["Payment processing delays"],
          efficiency: 82,
        },
      ],
      cycleTimeAnalysis: {
        monthlyTrend: [
          { month: "Jan", avgDays: 28, target: 20, count: 125 },
          { month: "Feb", avgDays: 26, target: 20, count: 118 },
          { month: "Mar", avgDays: 25, target: 20, count: 132 },
          { month: "Apr", avgDays: 24, target: 20, count: 145 },
          { month: "May", avgDays: 25, target: 20, count: 138 },
          { month: "Jun", avgDays: 25, target: 20, count: 142 },
        ],
        byCategory: [
          { category: "Raw Materials", avgDays: 22, count: 450 },
          { category: "Technology", avgDays: 18, count: 320 },
          { category: "Services", avgDays: 15, count: 280 },
          { category: "Logistics", avgDays: 12, count: 200 },
        ],
        byDepartment: [
          { department: "Operations", avgDays: 28, count: 650 },
          { department: "IT", avgDays: 20, count: 300 },
          { department: "Procurement", avgDays: 22, count: 300 },
        ],
      },
      exceptionAnalysis: {
        threeWayMatchExceptions: [
          { type: "Price Mismatch", count: 8, percentage: 32, impact: "High" },
          {
            type: "Quantity Variance",
            count: 6,
            percentage: 24,
            impact: "Medium",
          },
          { type: "Missing Receipt", count: 5, percentage: 20, impact: "High" },
          {
            type: "Invoice Discrepancy",
            count: 4,
            percentage: 16,
            impact: "Medium",
          },
          { type: "Other", count: 2, percentage: 8, impact: "Low" },
        ],
        exceptionTrend: [15.2, 14.8, 13.5, 12.9, 12.5, 12.5],
        resolutionTime: {
          average: 3.2,
          target: 2.0,
          trend: -0.5,
        },
      },
      stuckPOs: [
        {
          id: "PO-2024-089",
          supplier: "Tech Solutions Corp",
          value: 125000,
          stage: "Approval",
          daysStuck: 12,
          reason: "Awaiting budget approval",
          assignedTo: "John Smith",
          priority: "High",
        },
        {
          id: "PO-2024-092",
          supplier: "Energy Systems LLC",
          value: 850000,
          stage: "Receipt",
          daysStuck: 8,
          reason: "Goods received but not processed",
          assignedTo: "Sarah Johnson",
          priority: "Critical",
        },
        {
          id: "PO-2024-095",
          supplier: "Manufacturing Partners",
          value: 320000,
          stage: "Invoice",
          daysStuck: 15,
          reason: "Three-way match exception",
          assignedTo: "Mike Davis",
          priority: "Medium",
        },
      ],
      grniAnalysis: {
        totalValue: 2300000,
        byAge: [
          { age: "0-30 days", value: 1200000, percentage: 52.2 },
          { age: "31-60 days", value: 680000, percentage: 29.6 },
          { age: "61-90 days", value: 320000, percentage: 13.9 },
          { age: "90+ days", value: 100000, percentage: 4.3 },
        ],
        bySupplier: [
          {
            supplier: "Manufacturing Partners",
            value: 850000,
            percentage: 37.0,
          },
          { supplier: "Global Logistics Inc", value: 420000, percentage: 18.3 },
          {
            supplier: "Premium Materials Ltd",
            value: 380000,
            percentage: 16.5,
          },
          { supplier: "Others", value: 650000, percentage: 28.2 },
        ],
        impact: "Working capital tied up",
        actionRequired: "Accelerate invoice processing",
      },
      complianceMetrics: {
        policyCompliance: 94.2,
        approvalCompliance: 96.8,
        threeWayMatchCompliance: 87.5,
        contractCompliance: 91.3,
        segregationOfDuties: 98.5,
      },
      performanceTargets: {
        cycleTimeTarget: 20,
        exceptionRateTarget: 10.0,
        grniTarget: 1500000,
        complianceTarget: 95.0,
        efficiencyTarget: 85.0,
      },
      actionItems: [
        {
          priority: "Critical",
          action: "Resolve 45 stuck POs",
          owner: "Procurement Team",
          dueDate: "2024-01-31",
          status: "In Progress",
        },
        {
          priority: "High",
          action: "Reduce GRNI by $800K",
          owner: "AP Team",
          dueDate: "2024-02-15",
          status: "Not Started",
        },
        {
          priority: "Medium",
          action: "Improve cycle time to 20 days",
          owner: "Process Team",
          dueDate: "2024-03-31",
          status: "Planning",
        },
      ],
    }

    return NextResponse.json(poLifecycleData)
  } catch (error) {
    console.error("PO Lifecycle API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch PO lifecycle data" },
      { status: 500 }
    )
  }
}
