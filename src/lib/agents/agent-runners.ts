import { REFERENCE_CARDS } from "@/lib/references"

import { callJsonAgent } from "./llm"
import {
  buildHistorianPrompt,
  buildParseWorldPrompt,
  buildReviewPrompt,
  buildStepPrompt,
  societyOutputExample,
  survivalOutputExample,
  technologyOutputExample,
} from "./prompts"
import type {
  AgentStep,
  EpochDraft,
  RawInput,
  ReviewReport,
  SeedBrief,
  SocietyOutput,
  SurvivalOutput,
  TechnologyOutput,
} from "./types"

export async function parseWorldAgent(input: RawInput): Promise<SeedBrief> {
  return callJsonAgent<SeedBrief>(
    buildParseWorldPrompt(input.raw_text, REFERENCE_CARDS.world_rules),
  )
}

export async function survivalAgent(
  seedBrief: SeedBrief,
): Promise<AgentStep<SurvivalOutput>> {
  return callJsonAgent<AgentStep<SurvivalOutput>>(
    buildStepPrompt(
      "生存与环境 Agent",
      "先判断这个文明如何在给定世界规则中活下来，并输出生存约束。",
      REFERENCE_CARDS.survival,
      { seed_brief: seedBrief },
      survivalOutputExample,
    ),
  )
}

export async function societyAgent(inputPayload: {
  seed_brief: SeedBrief
  survival: SurvivalOutput
}): Promise<AgentStep<SocietyOutput>> {
  return callJsonAgent<AgentStep<SocietyOutput>>(
    buildStepPrompt(
      "社会制度 Agent",
      "基于生存压力推演社会结构、权力来源、制度路径和冲突。",
      REFERENCE_CARDS.society,
      inputPayload,
      societyOutputExample,
    ),
  )
}

export async function technologyAgent(inputPayload: {
  seed_brief: SeedBrief
  survival: SurvivalOutput
  society: SocietyOutput
}): Promise<AgentStep<TechnologyOutput>> {
  return callJsonAgent<AgentStep<TechnologyOutput>>(
    buildStepPrompt(
      "技术路径 Agent",
      "基于生存压力和制度路径推演技术路线、基础设施和技术限制。",
      REFERENCE_CARDS.technology,
      inputPayload,
      technologyOutputExample,
    ),
  )
}

export async function historianAgent(inputPayload: {
  seed_brief: SeedBrief
  survival: SurvivalOutput
  society: SocietyOutput
  technology: TechnologyOutput
}): Promise<EpochDraft[]> {
  const result = await callJsonAgent<{ timeline: EpochDraft[] }>(
    buildHistorianPrompt(REFERENCE_CARDS.historian, inputPayload),
    2200,
  )

  return result.timeline
}

export async function reviewerAgent(inputPayload: {
  seed_brief: SeedBrief
  timeline: EpochDraft[]
}): Promise<ReviewReport> {
  return callJsonAgent<ReviewReport>(
    buildReviewPrompt(REFERENCE_CARDS.reviewer, inputPayload),
  )
}

export async function historianRevisionAgent(inputPayload: {
  seed_brief: SeedBrief
  survival: SurvivalOutput
  society: SocietyOutput
  technology: TechnologyOutput
  timeline: EpochDraft[]
  review_report: ReviewReport
}): Promise<EpochDraft[]> {
  const result = await callJsonAgent<{ timeline: EpochDraft[] }>(
    buildHistorianPrompt(
      REFERENCE_CARDS.historian,
      inputPayload,
      inputPayload.review_report.revision_instructions,
    ),
    2200,
  )

  return result.timeline
}
