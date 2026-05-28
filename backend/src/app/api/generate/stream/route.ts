import { NextRequest } from "next/server"

import { runSimulationStream } from "@/lib/agents/simulation"
import type { SimulationStreamEvent } from "@/lib/agents/types"
import { validateWorldInput } from "@/lib/utils/validation"

export const runtime = "nodejs"
export const maxDuration = 120

function encodeSseEvent(event: SimulationStreamEvent | { type: "error"; data: { message: string } }) {
  return `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const input = validateWorldInput(body)
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: SimulationStreamEvent | { type: "error"; data: { message: string } }) => {
        controller.enqueue(encoder.encode(encodeSseEvent(event)))
      }

      try {
        await runSimulationStream(input, send)
        controller.close()
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown generation error"

        send({
          type: "error",
          data: {
            message,
          },
        })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
