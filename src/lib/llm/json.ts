export function parseJsonObject<T>(content: string): T {
  try {
    return JSON.parse(content) as T
  } catch {
    const match = content.match(/\{[\s\S]*\}/)

    if (!match) {
      throw new Error("LLM did not return a JSON object.")
    }

    return JSON.parse(match[0]) as T
  }
}
