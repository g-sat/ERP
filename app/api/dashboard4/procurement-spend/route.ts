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
    const procurementSpendData = {
      summary: {
        totalActualSpend: 8200000,
        totalBudget: 8500000,
        totalVariance: -300000,
        totalVariancePercentage: -3.5,
        totalForecast: 8600000,
      },
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
          budgetHolder: "John Smith",
          lastReviewDate: "2024-01-10",
          majorPurchases: [
            {
              item: "Manufacturing Equipment",
              amount: 450000,
              date: "2024-01-05",
            },
            { item: "Raw Materials Q1", amount: 280000, date: "2024-01-08" },
          ],
          categories: [
            {
              category: "Equipment",
              spend: 1200000,
              budget: 1000000,
              variance: 200000,
            },
            {
              category: "Materials",
              spend: 1800000,
              budget: 1600000,
              variance: 200000,
            },
            {
              category: "Services",
              spend: 200000,
              budget: 400000,
              variance: -200000,
            },
          ],
        },
        {
          department: "Information Technology",
          actualSpend: 1800000,
          budget: 2200000,
          variance: -400000,
          variancePercentage: -18.2,
          forecast: 1900000,
          category: "Strategic",
          trend: -5.1,
          budgetHolder: "Sarah Johnson",
          lastReviewDate: "2024-01-12",
          majorPurchases: [
            {
              item: "Cloud Infrastructure",
              amount: 320000,
              date: "2024-01-03",
            },
            { item: "Software Licenses", amount: 180000, date: "2024-01-07" },
          ],
          categories: [
            {
              category: "Software",
              spend: 800000,
              budget: 1000000,
              variance: -200000,
            },
            {
              category: "Hardware",
              spend: 600000,
              budget: 800000,
              variance: -200000,
            },
            {
              category: "Services",
              spend: 400000,
              budget: 400000,
              variance: 0,
            },
          ],
        },
        {
          department: "Human Resources",
          actualSpend: 450000,
          budget: 500000,
          variance: -50000,
          variancePercentage: -10.0,
          forecast: 480000,
          category: "Tactical",
          trend: -2.3,
          budgetHolder: "Mike Davis",
          lastReviewDate: "2024-01-09",
          majorPurchases: [
            { item: "Training Programs", amount: 120000, date: "2024-01-04" },
            { item: "HR Software", amount: 85000, date: "2024-01-06" },
          ],
          categories: [
            {
              category: "Training",
              spend: 200000,
              budget: 250000,
              variance: -50000,
            },
            {
              category: "Software",
              spend: 150000,
              budget: 150000,
              variance: 0,
            },
            {
              category: "Services",
              spend: 100000,
              budget: 100000,
              variance: 0,
            },
          ],
        },
        {
          department: "Finance",
          actualSpend: 280000,
          budget: 300000,
          variance: -20000,
          variancePercentage: -6.7,
          forecast: 290000,
          category: "Tactical",
          trend: -1.8,
          budgetHolder: "Lisa Wang",
          lastReviewDate: "2024-01-11",
          majorPurchases: [
            { item: "Financial Software", amount: 95000, date: "2024-01-02" },
            { item: "Audit Services", amount: 65000, date: "2024-01-09" },
          ],
          categories: [
            {
              category: "Software",
              spend: 120000,
              budget: 120000,
              variance: 0,
            },
            {
              category: "Services",
              spend: 100000,
              budget: 120000,
              variance: -20000,
            },
            {
              category: "Office Supplies",
              spend: 60000,
              budget: 60000,
              variance: 0,
            },
          ],
        },
        {
          department: "Sales & Marketing",
          actualSpend: 1200000,
          budget: 1000000,
          variance: 200000,
          variancePercentage: 20.0,
          forecast: 1300000,
          category: "Strategic",
          trend: 15.6,
          budgetHolder: "David Chen",
          lastReviewDate: "2024-01-13",
          majorPurchases: [
            { item: "Marketing Campaign", amount: 280000, date: "2024-01-05" },
            { item: "Sales Tools", amount: 150000, date: "2024-01-08" },
          ],
          categories: [
            {
              category: "Marketing",
              spend: 600000,
              budget: 500000,
              variance: 100000,
            },
            {
              category: "Sales Tools",
              spend: 400000,
              budget: 300000,
              variance: 100000,
            },
            { category: "Events", spend: 200000, budget: 200000, variance: 0 },
          ],
        },
        {
          department: "Procurement",
          actualSpend: 850000,
          budget: 800000,
          variance: 50000,
          variancePercentage: 6.3,
          forecast: 900000,
          category: "Tactical",
          trend: 12.4,
          budgetHolder: "Anna Rodriguez",
          lastReviewDate: "2024-01-14",
          majorPurchases: [
            {
              item: "Procurement Software",
              amount: 180000,
              date: "2024-01-06",
            },
            { item: "Consulting Services", amount: 120000, date: "2024-01-10" },
          ],
          categories: [
            {
              category: "Software",
              spend: 300000,
              budget: 250000,
              variance: 50000,
            },
            {
              category: "Services",
              spend: 350000,
              budget: 350000,
              variance: 0,
            },
            {
              category: "Training",
              spend: 200000,
              budget: 200000,
              variance: 0,
            },
          ],
        },
        {
          department: "Legal & Compliance",
          actualSpend: 320000,
          budget: 350000,
          variance: -30000,
          variancePercentage: -8.6,
          forecast: 330000,
          category: "Strategic",
          trend: -4.2,
          budgetHolder: "Robert Kim",
          lastReviewDate: "2024-01-15",
          majorPurchases: [
            { item: "Legal Research Tools", amount: 85000, date: "2024-01-07" },
            { item: "Compliance Software", amount: 65000, date: "2024-01-11" },
          ],
          categories: [
            {
              category: "Software",
              spend: 150000,
              budget: 150000,
              variance: 0,
            },
            {
              category: "Legal Services",
              spend: 120000,
              budget: 150000,
              variance: -30000,
            },
            {
              category: "Compliance",
              spend: 50000,
              budget: 50000,
              variance: 0,
            },
          ],
        },
      ],
      monthlyTrend: [
        { month: "Jan", actual: 2.8, budget: 2.9, cumulative: 2.8 },
        { month: "Feb", actual: 2.9, budget: 2.9, cumulative: 5.7 },
        { month: "Mar", actual: 3.1, budget: 2.9, cumulative: 8.8 },
        { month: "Apr", actual: 2.7, budget: 2.9, cumulative: 11.5 },
        { month: "May", actual: 3.2, budget: 2.9, cumulative: 14.7 },
        { month: "Jun", actual: 3.4, budget: 2.9, cumulative: 18.1 },
      ],
      categoryAnalysis: [
        {
          category: "Strategic",
          actualSpend: 6200000,
          budget: 6200000,
          variance: 0,
          percentage: 75.6,
          departments: [
            "Operations",
            "Information Technology",
            "Sales & Marketing",
            "Legal & Compliance",
          ],
        },
        {
          category: "Tactical",
          actualSpend: 2000000,
          budget: 2300000,
          variance: -300000,
          percentage: 24.4,
          departments: ["Human Resources", "Finance", "Procurement"],
        },
      ],
      budgetVarianceAnalysis: {
        overBudget: [
          {
            department: "Sales & Marketing",
            variance: 200000,
            percentage: 20.0,
          },
          { department: "Operations", variance: 200000, percentage: 6.7 },
          { department: "Procurement", variance: 50000, percentage: 6.3 },
        ],
        underBudget: [
          {
            department: "Information Technology",
            variance: -400000,
            percentage: -18.2,
          },
          {
            department: "Human Resources",
            variance: -50000,
            percentage: -10.0,
          },
          {
            department: "Legal & Compliance",
            variance: -30000,
            percentage: -8.6,
          },
          { department: "Finance", variance: -20000, percentage: -6.7 },
        ],
      },
      forecastAccuracy: {
        currentAccuracy: 94.2,
        targetAccuracy: 95.0,
        trend: 2.1,
        byDepartment: [
          { department: "Operations", accuracy: 91.4, variance: 8.6 },
          {
            department: "Information Technology",
            accuracy: 95.7,
            variance: -4.3,
          },
          { department: "Human Resources", accuracy: 96.0, variance: -4.0 },
          { department: "Finance", accuracy: 96.7, variance: -3.3 },
          { department: "Sales & Marketing", accuracy: 92.3, variance: 7.7 },
          { department: "Procurement", accuracy: 94.4, variance: 5.6 },
          { department: "Legal & Compliance", accuracy: 94.3, variance: 5.7 },
        ],
      },
      recommendations: [
        {
          type: "Budget Reallocation",
          department: "Information Technology",
          action: "Consider reallocating unused budget to critical projects",
          savings: 400000,
          priority: "High",
        },
        {
          type: "Spend Control",
          department: "Sales & Marketing",
          action: "Implement stricter approval process for marketing spend",
          impact: "Reduce overspend by 15%",
          priority: "Medium",
        },
        {
          type: "Process Improvement",
          department: "Operations",
          action: "Review major purchase approval process",
          impact: "Better budget adherence",
          priority: "Medium",
        },
      ],
    }

    return NextResponse.json(procurementSpendData)
  } catch (error) {
    console.error("Procurement Spend API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch procurement spend data" },
      { status: 500 }
    )
  }
}
