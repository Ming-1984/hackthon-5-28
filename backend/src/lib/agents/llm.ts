import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"

import { getExpertModel, getQwenClient } from "@/lib/llm/client"
import { parseJsonObject } from "@/lib/llm/json"

export async function callJsonAgent<T>(
  messages: ChatCompletionMessageParam[],
  maxTokens = 1600,
): Promise<T> {
  const client = getQwenClient()
  const completion = await client.chat.completions.create({
    model: getExpertModel(),
    messages,
    temperature: 0.6,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
  })

  const content = completion.choices[0]?.message?.content

  if (!content) {
    throw new Error("LLM returned empty content.")
  }

  return parseJsonObject<T>(content)
}
