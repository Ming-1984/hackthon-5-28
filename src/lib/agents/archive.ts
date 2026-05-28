import type { EpochDraft, ReviewReport, SeedBrief } from "./types"

export function renderArchiveMarkdown(
  seedBrief: SeedBrief,
  timeline: EpochDraft[],
  reviewReport: ReviewReport,
) {
  const epochSections = timeline
    .map((epoch) => {
      return [
        `### 纪元${epoch.epoch_index}：${epoch.epoch_name}`,
        "",
        `- 历史阶段：${epoch.historical_stage}`,
        `- 核心问题：${epoch.core_problem}`,
        `- 主要适应：${epoch.adaptation}`,
        `- 制度变化：${epoch.social_change}`,
        `- 技术路径：${epoch.technology_path}`,
        "- 代表事件：",
        ...epoch.major_events.map((event) => `  - ${event}`),
        `- 遗留后果：${epoch.legacy}`,
      ].join("\n")
    })
    .join("\n\n")

  const turningPoints = timeline
    .map((epoch, index) => `${index + 1}. ${epoch.major_events[0] ?? epoch.epoch_name}`)
    .join("\n")

  return [
    `# 文明档案：${seedBrief.seed_title}`,
    "",
    "## 概览",
    "",
    `${seedBrief.seed_title} 是一个由“${seedBrief.physical_anomaly}”塑造的文明。围绕“${seedBrief.core_resource}”这一核心资源，早期信仰“${seedBrief.initial_belief}”逐渐演化为制度、技术与权力结构的基础。`,
    "",
    "## 创世参数",
    "",
    `- 物理异常：${seedBrief.physical_anomaly}`,
    `- 核心资源：${seedBrief.core_resource}`,
    `- 初始信仰：${seedBrief.initial_belief}`,
    `- 额外限制：${seedBrief.extra_constraints.join("；")}`,
    "",
    "## 世界规则解释",
    "",
    `这些设定共同决定了文明的生存方式：${seedBrief.extra_constraints.join("；")}。未明确因素包括：${seedBrief.unknowns.join("；")}。`,
    "",
    "## 文明时间线",
    "",
    epochSections,
    "",
    "## 关键制度",
    "",
    timeline.map((epoch) => epoch.social_change).join("\n\n"),
    "",
    "## 关键转折事件",
    "",
    turningPoints,
    "",
    "## 终局判断",
    "",
    timeline[timeline.length - 1]?.legacy ?? "终局仍需根据后续纪元继续推演。",
    "",
    "## 核心因果链",
    "",
    `${seedBrief.physical_anomaly} -> ${timeline[0]?.adaptation ?? "生存方式"} -> ${timeline[1]?.social_change ?? "资源组织"} -> ${timeline[2]?.legacy ?? "文明结局"}`,
    "",
    "## 审校状态",
    "",
    reviewReport.passed ? "因果审校通过。" : reviewReport.revision_instructions,
  ].join("\n")
}
