import readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"

const API_URL = process.env.API_URL ?? "http://localhost:3000/api/generate/stream"
const DEFAULT_PROMPT =
  "物理异常：引力反转，开放空间中的物体会缓慢向天空漂移。核心资源：只有沙子。初始信仰：崇拜圆形。额外法则：封闭圆形结构比其他结构更稳定。"

function printEvent(eventName, dataText) {
  const data = JSON.parse(dataText)

  console.log(`\n=== ${eventName} ===`)

  if (eventName === "seed_brief") {
    console.log(`世界名称：${data.seed_title}`)
    console.log(`物理异常：${data.physical_anomaly}`)
    console.log(`核心资源：${data.core_resource}`)
    return
  }

  if (eventName === "agent_step") {
    console.log(`Agent：${data.agent_name}`)
    console.log(`推理摘要：${data.reasoning_summary}`)
    console.log(`参考资料：${data.references_used.join("；")}`)
    return
  }

  if (eventName === "timeline_draft" || eventName === "timeline_revised") {
    for (const epoch of data) {
      console.log(`${epoch.epoch_index}. ${epoch.epoch_name} - ${epoch.core_problem}`)
    }
    return
  }

  if (eventName === "review_report") {
    console.log(`审校通过：${data.passed ? "是" : "否"}`)
    console.log(`修订指令：${data.revision_instructions}`)
    return
  }

  if (eventName === "final_result") {
    console.log(data.final_archive_markdown)
    return
  }

  if (eventName === "error") {
    console.error(`错误：${data.message}`)
    return
  }

  console.log(JSON.stringify(data, null, 2))
}

async function readSseStream(response) {
  if (!response.body) {
    throw new Error("Response body is empty.")
  }

  const decoder = new TextDecoder()
  const reader = response.body.getReader()
  let buffer = ""

  while (true) {
    const { value, done } = await reader.read()

    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const chunks = buffer.split("\n\n")
    buffer = chunks.pop() ?? ""

    for (const chunk of chunks) {
      const eventLine = chunk
        .split("\n")
        .find((line) => line.startsWith("event: "))
      const dataLine = chunk
        .split("\n")
        .find((line) => line.startsWith("data: "))

      if (!eventLine || !dataLine) {
        continue
      }

      printEvent(eventLine.slice("event: ".length), dataLine.slice("data: ".length))
    }
  }
}

async function main() {
  const rl = readline.createInterface({ input, output })

  console.log("ChronoForge 流式 API 终端测试")
  console.log(`接口：${API_URL}`)
  console.log("直接回车将使用默认测试设定。\n")

  const rawText = (await rl.question("请输入世界设定：\n> ")).trim() || DEFAULT_PROMPT
  rl.close()

  console.log("\n开始请求，等待 Agent 分阶段返回...\n")

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      raw_text: rawText,
    }),
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${await response.text()}`)
  }

  await readSseStream(response)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
