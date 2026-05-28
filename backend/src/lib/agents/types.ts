export type RawInput = {
  raw_text: string
}

export type SeedBrief = {
  seed_title: string
  physical_anomaly: string
  core_resource: string
  initial_belief: string
  extra_constraints: string[]
  unknowns: string[]
}

export type AgentStep<TOutput = Record<string, unknown>> = {
  agent_name: string
  status: "completed"
  references_used: string[]
  input_summary: string
  reasoning_summary: string
  output: TOutput
}

export type SurvivalOutput = {
  environment_pressure: string
  survival_strategy: string
  settlement_pattern: string
  constraints_for_next_stage: string[]
}

export type SocietyOutput = {
  social_structure: string
  power_source: string
  institution_path: string
  social_conflicts: string[]
}

export type TechnologyOutput = {
  technology_path: string
  key_infrastructures: string[]
  technical_limits: string[]
  inherited_constraints: string[]
}

export type EpochDraft = {
  epoch_index: number
  epoch_name: string
  historical_stage: string
  core_problem: string
  environment_pressure: string
  adaptation: string
  social_change: string
  technology_path: string
  major_events: string[]
  legacy: string
  next_epoch_hook: string
}

export type ReviewIssue = {
  target: string
  problem: string
  suggestion: string
}

export type ReviewReport = {
  passed: boolean
  issues: ReviewIssue[]
  revision_instructions: string
}

export type FinalResult = {
  seed_brief: SeedBrief
  steps: AgentStep[]
  timeline: EpochDraft[]
  review_report: ReviewReport
  final_archive_markdown: string
}

export type SimulationStreamEvent =
  | {
      type: "seed_brief"
      data: SeedBrief
    }
  | {
      type: "agent_step"
      data: AgentStep
    }
  | {
      type: "timeline_draft"
      data: EpochDraft[]
    }
  | {
      type: "review_report"
      data: ReviewReport
    }
  | {
      type: "timeline_revised"
      data: EpochDraft[]
    }
  | {
      type: "final_result"
      data: FinalResult
    }
