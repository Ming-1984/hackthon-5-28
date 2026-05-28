import type {
  EpochDraft,
  ReviewReport,
  SeedBrief,
  SocietyOutput,
  SurvivalOutput,
  TechnologyOutput,
} from "./types"

export function jsonInstruction(schemaExample: unknown) {
  return [
    "只输出合法 JSON，不要输出 Markdown，不要添加代码块。",
    "不要写小说，不要使用主角叙事，不要堆砌奇观。",
    "每个重大判断必须说明因果，不要引入初始设定之外的神秘力量。",
    "请严格遵守以下 JSON 结构：",
    JSON.stringify(schemaExample, null, 2),
  ].join("\n")
}

export function buildParseWorldPrompt(rawText: string, references: string[]) {
  return [
    {
      role: "system" as const,
      content: "你是世界规则解析 Agent，负责把用户随意输入的世界设定整理为稳定的 SeedBrief。",
    },
    {
      role: "user" as const,
      content: [
        `用户输入：\n${rawText}`,
        `可参考资料卡片：\n${references.join("\n")}`,
        jsonInstruction({
          seed_title: "文明或世界名称",
          physical_anomaly: "物理异常",
          core_resource: "核心资源",
          initial_belief: "初始信仰",
          extra_constraints: ["额外限制"],
          unknowns: ["未明确但会影响推演的问题"],
        } satisfies SeedBrief),
      ].join("\n\n"),
    },
  ]
}

export function buildStepPrompt<TOutput>(
  agentName: string,
  task: string,
  references: string[],
  inputPayload: unknown,
  outputExample: TOutput,
) {
  return [
    {
      role: "system" as const,
      content: `${agentName}。你的任务是${task}。`,
    },
    {
      role: "user" as const,
      content: [
        `输入 JSON：\n${JSON.stringify(inputPayload, null, 2)}`,
        `必须参考并在 references_used 中写出的资料卡片：\n${references.join("\n")}`,
        jsonInstruction({
          agent_name: agentName,
          status: "completed",
          references_used: references,
          input_summary: "简要说明你读取了哪些输入",
          reasoning_summary: "用自然语言概括因果推理，不暴露冗长思维链",
          output: outputExample,
        }),
      ].join("\n\n"),
    },
  ]
}

export const survivalOutputExample: SurvivalOutput = {
  environment_pressure: "环境压力",
  survival_strategy: "主要生存策略",
  settlement_pattern: "聚落形态",
  constraints_for_next_stage: ["传递给后续 Agent 的限制"],
}

export const societyOutputExample: SocietyOutput = {
  social_structure: "社会结构",
  power_source: "权力来源",
  institution_path: "制度形成路径",
  social_conflicts: ["社会冲突"],
}

export const technologyOutputExample: TechnologyOutput = {
  technology_path: "技术路径",
  key_infrastructures: ["关键基础设施"],
  technical_limits: ["技术限制"],
  inherited_constraints: ["继承自前序阶段的约束"],
}

export function buildHistorianPrompt(
  references: string[],
  inputPayload: unknown,
  revisionInstructions?: string,
) {
  return [
    {
      role: "system" as const,
      content:
        "你是历史编年 Agent，负责把世界前提、生存推演、制度推演和技术推演整理成完整的文明纪元时间线。纪元数量不固定，请根据文明从起源到终局的因果链自行决定，但必须覆盖起源、发展、关键危机与终局。",
    },
    {
      role: "user" as const,
      content: [
        `输入 JSON：\n${JSON.stringify(inputPayload, null, 2)}`,
        revisionInstructions ? `修订要求：\n${revisionInstructions}` : "",
        "请自行判断需要多少个纪元，不要为了凑数量而增加纪元，也不要为了简短而跳过必要转折。",
        "每个纪元必须能自然引出下一个纪元；最后一个纪元必须给出文明的终局、转型或稳定状态。",
        `必须参考资料卡片：\n${references.join("\n")}`,
        jsonInstruction({
          timeline: [
            {
              epoch_index: 1,
              epoch_name: "纪元名称",
              historical_stage: "起源与生存适应",
              core_problem: "该纪元核心问题",
              environment_pressure: "环境压力",
              adaptation: "主要适应方式",
              social_change: "制度或社会变化",
              technology_path: "技术路径",
              major_events: ["事件 1", "事件 2", "事件 3"],
              legacy: "遗留后果",
              next_epoch_hook: "自然引出下一纪元的钩子",
            },
          ] satisfies EpochDraft[],
        }),
      ].join("\n\n"),
    },
  ]
}

export function buildReviewPrompt(references: string[], inputPayload: unknown) {
  return [
    {
      role: "system" as const,
      content: "你是因果审校 Agent，负责检查时间线是否违反初始规则、是否缺少技术或制度前提。",
    },
    {
      role: "user" as const,
      content: [
        `输入 JSON：\n${JSON.stringify(inputPayload, null, 2)}`,
        `必须参考资料卡片：\n${references.join("\n")}`,
        jsonInstruction({
          passed: false,
          issues: [
            {
              target: "纪元二",
              problem: "问题描述",
              suggestion: "修订建议",
            },
          ],
          revision_instructions: "给历史编年 Agent 的修订指令",
        } satisfies ReviewReport),
      ].join("\n\n"),
    },
  ]
}
