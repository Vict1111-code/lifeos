export type EvidenceType = 'note' | 'link' | 'milestone' | 'result' | string

export interface GoalEvidence {
  id: string
  user_id: string
  goal_id: string
  title: string
  description: string | null
  evidence_type: EvidenceType
  source_url: string | null
  occurred_at: string
  created_at: string
}

export interface GoalEvidenceInput {
  goal_id: string
  title: string
  description: string
  evidence_type: EvidenceType
  source_url: string
  occurred_at: string
}
