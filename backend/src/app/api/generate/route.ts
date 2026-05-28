import { NextRequest, NextResponse } from "next/server"

import { runSimulation } from "@/lib/agents/simulation"
import { validateWorldInput } from "@/lib/utils/validation"

export const runtime = "nodejs"
export const maxDuration = 120

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const input = validateWorldInput(body)
    const result = await runSimulation(input)

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown generation error"

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    )
  }
}
