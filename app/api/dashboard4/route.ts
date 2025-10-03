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
    const dashboardData = {
      executiveKPIs: {
        dso: {
          current: 42,
          target: 35,
          trend: -8.2,
          benchmark: 45,
          status: "warning",
          sparkline: [48, 45, 43, 44, 42, 41, 42],
        },
        dpo: {
          current: 38,
          target: 42,
          trend: 5.1,
          benchmark: 35,
          status: "good",
          sparkline: [35, 36, 37, 36, 37, 38, 38],
        },
        cashConversionCycle: {
          current: 67,
          target: 60,
          trend: -12.3,
          benchmark: 75,
          status: "good",
          sparkline: [79, 76, 73, 70, 69, 68, 67],
        },
        currentRatio: {
          current: 2.4,
          target: 2.0,
          trend: 0.3,
          benchmark: 2.5,
          status: "good",
          sparkline: [2.1, 2.2, 2.3, 2.2, 2.3, 2.4, 2.4],
        },
        operatingCashFlow: {
          current: 1250000,
          target: 1000000,
          trend: 15.7,
          benchmark: 1200000,
          status: "good",
          sparkline: [
            800000, 900000, 1000000, 1100000, 1200000, 1250000, 1250000,
          ],
        },
        ebitdaMargin: {
          current: 18.5,
          target: 16.0,
          trend: 2.1,
          benchmark: 20.0,
          status: "good",
          sparkline: [16.4, 16.8, 17.2, 17.6, 18.0, 18.3, 18.5],
        },
      },
      customerProfitability: {
        totalRevenue: 8500000,
        totalOutstandingAR: 2300000,
        totalCustomers: 8,
        averageProfitMargin: 18.2,
        customers: [
          {
            id: "1",
            name: "Acme Corporation",
            revenue: 2500000,
            profitMargin: 22.5,
            outstandingAR: 450000,
            tier: "Platinum",
            quadrant: "Stars",
            trend: 15.2,
            riskRating: "Low",
          },
          {
            id: "2",
            name: "TechStart Inc",
            revenue: 1800000,
            profitMargin: 28.3,
            outstandingAR: 320000,
            tier: "Platinum",
            quadrant: "Stars",
            trend: 22.1,
            riskRating: "Low",
          },
          // Add more customers...
        ],
      },
      supplierPerformance: {
        totalSpend: 8200000,
        totalSuppliers: 6,
        averageScore: 4.1,
        onTimeDelivery: 94.2,
        suppliers: [
          {
            id: "1",
            name: "Premium Materials Ltd",
            spend: 1250000,
            spendPercentage: 15.2,
            onTimeDelivery: 98.5,
            qualityAcceptance: 99.2,
            invoiceAccuracy: 96.8,
            overallScore: 4.8,
            riskRating: "Low",
            category: "Raw Materials",
            location: "North America",
            contractStatus: "Active",
            trend: 5.2,
          },
          // Add more suppliers...
        ],
      },
      poLifecycle: {
        totalOpenPOValue: 12500000,
        avgPOCycleTime: 25,
        threeWayMatchExceptions: 12.5,
        grniValue: 2300000,
        stuckPOs: 45,
        stages: [
          {
            stage: "POs Drafted",
            count: 1250,
            value: 8500000,
            percentage: 100,
            avgDays: 2,
            color: "#3b82f6",
          },
          {
            stage: "POs Approved",
            count: 1180,
            value: 8100000,
            percentage: 94.4,
            avgDays: 3,
            color: "#8b5cf6",
          },
          // Add more stages...
        ],
      },
      procurementSpend: {
        totalActualSpend: 8200000,
        totalBudget: 8500000,
        totalVariance: -300000,
        totalVariancePercentage: -3.5,
        departments: [
          {
            department: "Operations",
            actualSpend: 3200000,
            budget: 3000000,
            variance: 200000,
            variancePercentage: 6.7,
            forecast: 3500000,
            category: "Strategic",
            trend: 8.2,
          },
          // Add more departments...
        ],
      },
      cashFlowForecast: {
        currentBalance: 8500000,
        minRequiredBalance: 5000000,
        projectedBalance30Days: 9400000,
        projectedBalance90Days: 11400000,
        avgDailyCashIn: 170000,
        avgDailyCashOut: 120000,
        dso: 42,
        dpo: 38,
        liquidityRatio: 2.4,
        forecastData: [
          {
            week: "W1",
            date: "2024-01-01",
            projectedBalance: 8500000,
            optimistic: 9200000,
            pessimistic: 7800000,
            cashIn: 1200000,
            cashOut: 800000,
            netCashFlow: 400000,
            confidence: 85,
          },
          // Add more forecast data...
        ],
      },
      exceptionAlerts: {
        total: 8,
        critical: 2,
        warning: 3,
        informational: 3,
        open: 4,
        investigating: 3,
        alerts: [
          {
            id: "1",
            type: "Duplicate Payment Risk",
            category: "Control Failures",
            priority: "Critical",
            title: "Potential Duplicate Invoice Payment",
            description:
              "Invoice #INV-2024-001 for $125,000 from Premium Materials Ltd appears to match a previous payment within 7 days.",
            detectedDate: "2024-01-15T10:30:00Z",
            assignedTo: "Finance Team",
            status: "Investigating",
            impact: "High - Potential $125,000 duplicate payment",
            confidence: 95,
            relatedTransactions: ["PAY-2024-045", "INV-2024-001"],
            relatedDocuments: [
              "invoice_inv_2024_001.pdf",
              "payment_pay_2024_045.pdf",
            ],
          },
          // Add more alerts...
        ],
      },
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Dashboard4 API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
