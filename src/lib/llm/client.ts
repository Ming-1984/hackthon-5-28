import OpenAI from "openai"

export function getQwenClient() {
  const apiKey = process.env.DASHSCOPE_API_KEY

  if (!apiKey) {
    throw new Error("Missing DASHSCOPE_API_KEY. Create .env.local from .env.example first.")
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.QWEN_BASE_URL ?? "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
  })
}

export function getExpertModel() {
  return process.env.QWEN_EXPERT_MODEL ?? "qwen3.6-flash"
}

export function getSummaryModel() {
  return process.env.QWEN_SUMMARY_MODEL ?? "qwen3.6-plus"
}
