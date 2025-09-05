import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const prompt = Array.isArray(messages)
      ? messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")
      : String(messages)

    const system =
      "You are an MRV assistant for agroforestry and rice projects. " +
      "Explain carbon calculations (tCO2e/ha/yr), buffers, fees, and farmer profit clearly and concisely."

    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      system,
      prompt,
    })

    return NextResponse.json({ text })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 })
  }
}
