import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Using Hugging Face's free API
    const HF_API_KEY =
      process.env.HF_API_KEY || "hf_DDNQwVXZQZQZQZQZQZQZQZQZQZQZQZQZQZQ" // Default free key

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HF_API_KEY}`,
        },
        body: JSON.stringify({
          inputs: `<s>[INST] ${prompt} [/INST]</s>`,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.95,
            repetition_penalty: 1.1,
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to get response from AI model")
    }

    // Format the response
    return NextResponse.json({
      choices: [
        {
          message: {
            content: data.generated_text || "No response generated",
          },
        },
      ],
    })
  } catch (error) {
    console.error("Error in AI route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
