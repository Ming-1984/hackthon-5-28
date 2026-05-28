import {
  historianAgent,
  historianRevisionAgent,
  parseWorldAgent,
  reviewerAgent,
  societyAgent,
  survivalAgent,
  technologyAgent,
} from "./agent-runners"
import { renderArchiveMarkdown } from "./archive"
import type { AgentStep, FinalResult, RawInput } from "./types"

export async function runSimulation(input: RawInput): Promise<FinalResult> {
  const steps: AgentStep[] = []

  const seedBrief = await parseWorldAgent(input)

  const survivalStep = await survivalAgent(seedBrief)
  steps.push(survivalStep)

  const societyStep = await societyAgent({
    seed_brief: seedBrief,
    survival: survivalStep.output,
  })
  steps.push(societyStep)

  const technologyStep = await technologyAgent({
    seed_brief: seedBrief,
    survival: survivalStep.output,
    society: societyStep.output,
  })
  steps.push(technologyStep)

  const initialTimeline = await historianAgent({
    seed_brief: seedBrief,
    survival: survivalStep.output,
    society: societyStep.output,
    technology: technologyStep.output,
  })

  const reviewReport = await reviewerAgent({
    seed_brief: seedBrief,
    timeline: initialTimeline,
  })

  const timeline = reviewReport.passed
    ? initialTimeline
    : await historianRevisionAgent({
        seed_brief: seedBrief,
        survival: survivalStep.output,
        society: societyStep.output,
        technology: technologyStep.output,
        timeline: initialTimeline,
        review_report: reviewReport,
      })

  const finalArchiveMarkdown = renderArchiveMarkdown(seedBrief, timeline, reviewReport)

  return {
    seed_brief: seedBrief,
    steps,
    timeline,
    review_report: reviewReport,
    final_archive_markdown: finalArchiveMarkdown,
  }
}
