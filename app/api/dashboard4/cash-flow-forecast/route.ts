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
    const forecastDays = parseInt(searchParams.get("forecastDays") || "90")

    // Mock data - in real implementation, this would come from database
    const cashFlowForecastData = {
      currentMetrics: {
        currentBalance: 8500000,
        minRequiredBalance: 5000000,
        liquidityBuffer: 3500000,
        dso: 42,
        dpo: 38,
        dio: 63,
        cashConversionCycle: 67,
        liquidityRatio: 2.4,
        quickRatio: 1.8,
        operatingCashFlow: 1250000,
      },
      forecastMetrics: {
        projectedBalance30Days: 9400000,
        projectedBalance60Days: 10200000,
        projectedBalance90Days: 11400000,
        avgDailyCashIn: 170000,
        avgDailyCashOut: 120000,
        netDailyCashFlow: 50000,
        confidenceLevel: 78,
      },
      forecastData: generateForecastData(forecastDays),
      cashInflowSources: {
        arCollections: {
          amount: 119000,
          percentage: 70,
          description: "Accounts Receivable collections",
          confidence: 85,
          trend: 5.2,
          aging: [
            { bucket: "0-30 days", amount: 850000, probability: 95 },
            { bucket: "31-60 days", amount: 420000, probability: 85 },
            { bucket: "61-90 days", amount: 180000, probability: 70 },
            { bucket: "90+ days", amount: 95000, probability: 45 },
          ],
        },
        newSales: {
          amount: 51000,
          percentage: 30,
          description: "New sales revenue",
          confidence: 75,
          trend: 8.1,
          pipeline: [
            { stage: "Qualified", amount: 280000, probability: 80 },
            { stage: "Proposal", amount: 180000, probability: 60 },
            { stage: "Negotiation", amount: 120000, probability: 40 },
            { stage: "Closed Won", amount: 95000, probability: 95 },
          ],
        },
        otherIncome: {
          amount: 17000,
          percentage: 10,
          description: "Interest, dividends, other income",
          confidence: 90,
          trend: 2.3,
          sources: [
            { source: "Interest Income", amount: 12000 },
            { source: "Dividends", amount: 3000 },
            { source: "Other", amount: 2000 },
          ],
        },
      },
      cashOutflowSources: {
        apPayments: {
          amount: 72000,
          percentage: 60,
          description: "Accounts Payable payments",
          confidence: 95,
          trend: 1.8,
          scheduled: [
            {
              supplier: "Premium Materials Ltd",
              amount: 85000,
              dueDate: "2024-01-20",
            },
            {
              supplier: "Global Logistics Inc",
              amount: 65000,
              dueDate: "2024-01-25",
            },
            {
              supplier: "Manufacturing Partners",
              amount: 180000,
              dueDate: "2024-01-30",
            },
            { supplier: "Others", amount: 320000, dueDate: "Various" },
          ],
        },
        payroll: {
          amount: 30000,
          percentage: 25,
          description: "Employee payroll and benefits",
          confidence: 100,
          trend: 3.2,
          components: [
            { component: "Salaries", amount: 22000 },
            { component: "Benefits", amount: 5000 },
            { component: "Taxes", amount: 3000 },
          ],
        },
        operatingExpenses: {
          amount: 18000,
          percentage: 15,
          description: "Operating expenses",
          confidence: 80,
          trend: 4.5,
          categories: [
            { category: "Utilities", amount: 8000 },
            { category: "Insurance", amount: 4000 },
            { category: "Professional Services", amount: 3000 },
            { category: "Other", amount: 3000 },
          ],
        },
      },
      scenarioAnalysis: {
        optimistic: {
          description: "Best case scenario (DSO - 5 days, DPO + 5 days)",
          projectedBalance90Days: 12500000,
          variance: 1100000,
          probability: 25,
        },
        base: {
          description: "Most likely scenario",
          projectedBalance90Days: 11400000,
          variance: 0,
          probability: 50,
        },
        pessimistic: {
          description: "Worst case scenario (DSO + 10 days, DPO - 5 days)",
          projectedBalance90Days: 10200000,
          variance: -1200000,
          probability: 25,
        },
      },
      keyAssumptions: [
        {
          assumption: "DSO improvement",
          current: 42,
          target: 38,
          timeframe: "90 days",
          confidence: 75,
        },
        {
          assumption: "DPO optimization",
          current: 38,
          target: 42,
          timeframe: "90 days",
          confidence: 80,
        },
        {
          assumption: "Collection probability",
          current: 85,
          target: 85,
          timeframe: "Ongoing",
          confidence: 85,
        },
        {
          assumption: "Seasonal adjustments",
          current: "Q1 +5%",
          target: "Q1 +5%",
          timeframe: "Q1 2024",
          confidence: 90,
        },
      ],
      riskFactors: [
        {
          risk: "Economic downturn",
          probability: 20,
          impact: "High",
          description: "Could extend DSO by 10-15 days",
          mitigation: "Diversify customer base, improve collections process",
        },
        {
          risk: "Supplier payment terms change",
          probability: 15,
          impact: "Medium",
          description: "Suppliers may tighten payment terms",
          mitigation:
            "Negotiate long-term contracts, maintain good relationships",
        },
        {
          risk: "Major customer payment delay",
          probability: 10,
          impact: "High",
          description: "Large customer could delay payment significantly",
          mitigation: "Credit insurance, payment guarantees",
        },
      ],
      recommendations: [
        {
          priority: "High",
          action: "Accelerate collections from top 5 customers",
          impact: "Improve DSO by 3-5 days",
          timeline: "30 days",
          owner: "AR Team",
        },
        {
          priority: "Medium",
          action: "Negotiate extended payment terms with key suppliers",
          impact: "Improve DPO by 2-3 days",
          timeline: "60 days",
          owner: "Procurement Team",
        },
        {
          priority: "Low",
          action: "Implement automated payment processing",
          impact: "Reduce processing time by 1-2 days",
          timeline: "90 days",
          owner: "Finance Team",
        },
      ],
    }

    return NextResponse.json(cashFlowForecastData)
  } catch (error) {
    console.error("Cash Flow Forecast API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch cash flow forecast data" },
      { status: 500 }
    )
  }
}

function generateForecastData(days: number) {
  const forecastData = []
  const startDate = new Date()
  let currentBalance = 8500000
  const avgDailyCashIn = 170000
  const avgDailyCashOut = 120000
  const baseNetFlow = avgDailyCashIn - avgDailyCashOut

  for (let i = 0; i < days; i += 7) {
    // Weekly data points
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    // Add some variability to the forecast
    const weekVariation = (Math.random() - 0.5) * 0.2 // ±10% variation
    const weeklyCashIn = avgDailyCashIn * 7 * (1 + weekVariation)
    const weeklyCashOut = avgDailyCashOut * 7 * (1 + weekVariation * 0.5)
    const weeklyNetFlow = weeklyCashIn - weeklyCashOut

    currentBalance += weeklyNetFlow

    // Generate confidence bands
    const optimistic = currentBalance * 1.08
    const pessimistic = currentBalance * 0.92
    const confidence = Math.max(50, 85 - (i / days) * 20) // Decreasing confidence over time

    forecastData.push({
      week: `W${Math.floor(i / 7) + 1}`,
      date: date.toISOString().split("T")[0],
      projectedBalance: Math.round(currentBalance),
      optimistic: Math.round(optimistic),
      pessimistic: Math.round(pessimistic),
      cashIn: Math.round(weeklyCashIn),
      cashOut: Math.round(weeklyCashOut),
      netCashFlow: Math.round(weeklyNetFlow),
      confidence: Math.round(confidence),
    })
  }

  return forecastData
}
