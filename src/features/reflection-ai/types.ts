export interface ReflectionIntelligence {
  reflection_count: number
  themes: string[]
  strengths: string[]
  friction_points: string[]
  commitments: string[]
  suggested_focus: string | null
  confidence: number
  generated_at: string
}

export interface ReflectionIntelligenceInput {
  days?: number
}
