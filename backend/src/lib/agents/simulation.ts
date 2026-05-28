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
import type { AgentStep, FinalResult, RawInput, SimulationStreamEvent } from "./types"

type SimulationEventEmitter = (event: SimulationStreamEvent) => void | Promise<void>

export async function runSimulation(input: RawInput): Promise<FinalResult> {
  return runSimulationStream(input)
}

export async function runSimulationStream(
  input: RawInput,
  emit?: SimulationEventEmitter,
): Promise<FinalResult> {
  const steps: AgentStep[] = []

  const seedBrief = await parseWorldAgent(input)
  await emit?.({
    type: "seed_brief",
    data: seedBrief,
  })

  const survivalStep = await survivalAgent(seedBrief)
  steps.push(survivalStep)
  await emit?.({
    type: "agent_step",
    data: survivalStep,
  })

  const societyStep = await societyAgent({
    seed_brief: seedBrief,
    survival: survivalStep.output,
  })
  steps.push(societyStep)
  await emit?.({
    type: "agent_step",
    data: societyStep,
  })

  const technologyStep = await technologyAgent({
    seed_brief: seedBrief,
    survival: survivalStep.output,
    society: societyStep.output,
  })
  steps.push(technologyStep)
  await emit?.({
    type: "agent_step",
    data: technologyStep,
  })

  const initialTimeline = await historianAgent({
    seed_brief: seedBrief,
    survival: survivalStep.output,
    society: societyStep.output,
    technology: technologyStep.output,
  })
  await emit?.({
    type: "timeline_draft",
    data: initialTimeline,
  })

  const reviewReport = await reviewerAgent({
    seed_brief: seedBrief,
    timeline: initialTimeline,
  })
  await emit?.({
    type: "review_report",
    data: reviewReport,
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

  if (!reviewReport.passed) {
    await emit?.({
      type: "timeline_revised",
      data: timeline,
    })
  }

  const finalArchiveMarkdown = renderArchiveMarkdown(seedBrief, timeline, reviewReport)

  const finalResult = {
    seed_brief: seedBrief,
    steps,
    timeline,
    review_report: reviewReport,
    final_archive_markdown: finalArchiveMarkdown,
  }

  await emit?.({
    type: "final_result",
    data: finalResult,
  })

  return finalResult
}
