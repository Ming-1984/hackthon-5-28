import { z } from "zod"

import type { RawInput } from "@/lib/agents/types"

const worldInputSchema = z.object({
  raw_text: z.string().trim().min(1, "raw_text is required"),
})

export function validateWorldInput(raw: unknown): RawInput {
  return worldInputSchema.parse(raw)
}
