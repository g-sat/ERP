import { NextResponse } from "next/server"

const QUOTABLE_API_URL = "https://api.adviceslip.com/advice"

interface AdviceSlipResponse {
  slip: {
    id: number
    advice: string
  }
}

interface Quote {
  _id: string
  content: string
  author: string
  tags: string[]
  authorSlug: string
  length: number
  dateAdded?: string
  dateModified?: string
}

export async function GET() {
  try {
    // Fetch 5 random quotes
    const quotePromises = Array.from({ length: 5 }, () =>
      fetch(QUOTABLE_API_URL).then((res) => {
        if (!res.ok) {
          throw new Error(`Advice Slip API error: ${res.statusText}`)
        }
        return res.json()
      })
    )

    const responses = await Promise.all(quotePromises)

    // Transform adviceslip responses to match expected format
    const quotes: Quote[] = responses.map((data: AdviceSlipResponse) => ({
      _id: `advice-${data.slip.id}`,
      content: data.slip.advice,
      author: "Advice Slip",
      tags: [],
      authorSlug: "advice-slip",
      length: data.slip.advice.length,
    }))

    return NextResponse.json(quotes)
  } catch (error) {
    console.error("Error fetching quotes:", error)
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    )
  }
}
