// ─── Core identifiers ────────────────────────────────────────────────────────

export type ID = string

// ─── Time & shift ────────────────────────────────────────────────────────────

export type MilitaryTime = string // "0800", "1430", "0000"
export type TimeFormat = 'military' | 'regular' | 'dual'

// ─── Patient ─────────────────────────────────────────────────────────────────

export type CodeStatus = 'Full Code' | 'DNR' | 'DNI' | 'DNR/DNI' | 'Comfort Care'

export interface Patient {
  id: ID
  name: string
  room: string
  age?: number
  dob?: string
  codeStatus: CodeStatus
  allergies: string[]
  createdAt: string
  updatedAt: string
}

// ─── SBAR ─────────────────────────────────────────────────────────────────────

export type SBARSection = 'situation' | 'background' | 'assessment' | 'recommendation'

export interface SBAR {
  id: ID
  patientId: ID
  situation: string
  background: string
  assessment: string
  recommendation: string
  gamePlan?: GamePlan
  version: number
  createdAt: string
  updatedAt: string
}

// ─── Game Plan ────────────────────────────────────────────────────────────────

export interface GamePlanItem {
  id: ID
  text: string
  priority?: 'high' | 'medium' | 'low'
  completed: boolean
}

export interface GamePlan {
  id: ID
  patientId: ID
  clinicalImpression: string
  immediate: GamePlanItem[]
  ongoing: GamePlanItem[]
  monitoringRedFlags: string[]
  potentialComplications: string[]
  providerQuestions: string[]
  suggestedTimelineTasks: SuggestedTask[]
  isAIGenerated: boolean
  createdAt: string
  updatedAt: string
}

export interface SuggestedTask {
  time: MilitaryTime
  description: string
  category: TaskCategory
  iconType?: string
}

// ─── Tasks / Timeline ─────────────────────────────────────────────────────────

export type TaskCategory =
  | 'med'
  | 'vital'
  | 'assessment'
  | 'lab'
  | 'wound'
  | 'drain'
  | 'cast'
  | 'diet'
  | 'blood_product'
  | 'drip'
  | 'charting'
  | 'general'

export type TaskSource = 'manual' | 'ai' | 'snapshot' | 'system'

export interface Task {
  id: ID
  patientId: ID
  time: MilitaryTime
  description: string
  category: TaskCategory
  iconType?: string
  completed: boolean
  completedAt?: string
  notes?: string
  source: TaskSource
  medItemId?: ID
  createdAt: string
}

// ─── Patient Snapshot ─────────────────────────────────────────────────────────

export interface VitalsEntry {
  bp?: string
  hr?: number
  rr?: number
  spo2?: number
  temp?: number
  pain?: number
  trends: string[]
  notes?: string
}

export interface LabEntry {
  key: string
  value: string
  status: 'normal' | 'high' | 'low' | 'critical' | 'pending'
  timestamp?: string
}

export interface AssessmentEntry {
  system: string
  findings: string[]
  notes?: string
}

export interface WoundCareEntry {
  id: ID
  location: string
  type: string
  stage?: string
  drainageCharacter?: string
  drainageAmount?: string
  dressing: string
  isVAC: boolean
  vacSettings?: {
    mode: 'continuous' | 'intermittent'
    pressureMmhg: number
    goalOutput?: string
    sealIntegrity: 'intact' | 'compromised' | 'replaced_this_shift'
    canisterOutput?: string
    lastChanged?: string
  }
  lastChanged?: string
  frequency?: string
  notes?: string
}

export interface DrainEntry {
  id: ID
  type: 'jp' | 'hemovac' | 'penrose' | 'chest_tube' | 'ng_tube' | 'foley' | 'other'
  customType?: string
  location: string
  outputVolume?: string
  outputCharacter?: string
  patencyNotes?: string
  lastEmptied?: MilitaryTime
  notes?: string
}

export interface IVEntry {
  id: ID
  site: string
  gauge?: string
  type: 'peripheral' | 'central' | 'picc' | 'midline'
  patency: 'patent' | 'infiltrated' | 'phlebitis' | 'occluded'
  currentInfusion?: string
  notes?: string
}

export interface CastEntry {
  id: ID
  location: string
  castType: string
  neurovascular: {
    color: string
    capRefill: string
    sensation: string
    movement: string
    pulsePresent: boolean
    pain?: string
  }
  compartmentSyndromeSigns: string[]
  skinIntegrity?: string
  notes?: string
}

export interface DietEntry {
  type: string
  npoStatus: boolean
  npoRationale?: string
  aspirationPrecautions: boolean
  aspirationLevel?: 'thin_liquid' | 'nectar_thick' | 'honey_thick' | 'pureed'
  restrictions: string[]
  lastMeal?: string
  intakePercent?: number
  notes?: string
}

export interface ConsultEntry {
  service: string
  status: 'requested' | 'seen' | 'pending_recommendations'
  notes?: string
}

export interface PatientSnapshot {
  id: ID
  patientId: ID
  admissionReason: string[]
  hospitalCourse: string[]
  pmh: string[]
  psh: string[]
  vitals: VitalsEntry
  labs: LabEntry[]
  assessments: AssessmentEntry[]
  woundCare: WoundCareEntry[]
  drains: DrainEntry[]
  ivAccess: IVEntry[]
  casts: CastEntry[]
  diet: DietEntry
  consults: string[]
  updatedAt: string
}

// ─── Medications / Drips / Blood Products ─────────────────────────────────────

export type MedType = 'med' | 'drip' | 'blood_product' | 'iv_fluid' | 'tpn'

export interface VideoLink {
  title: string
  url: string
  source: string
  durationMin?: number
}

export interface MedItem {
  id: ID
  name: string
  genericName?: string
  type: MedType
  category: string
  whatItDoes: string
  nurseActions: string[]
  safetyNotes: string[]
  holdParameters?: string[]
  monitoringParameters?: string[]
  videoLinks: VideoLink[]
  iconType?: string
}

// ─── Glossary ─────────────────────────────────────────────────────────────────

export type GlossaryCategory =
  | 'vitals'
  | 'neuro'
  | 'cardiac'
  | 'respiratory'
  | 'gi_gu'
  | 'labs'
  | 'meds'
  | 'abbreviations'
  | 'wound'
  | 'drain'
  | 'cast'
  | 'diet'
  | 'blood_products'
  | 'procedures'
  | 'assessments'
  | 'disease'
  | 'general'

export interface GlossaryTerm {
  id: ID
  term: string
  abbreviation?: string
  category: GlossaryCategory
  definition: string
  nursingImplications: string
  videoLinks: VideoLink[]
}

// ─── Disease / Condition ──────────────────────────────────────────────────────

export interface DiseaseCondition {
  id: ID
  name: string
  category: string
  bodySystem: string
  aliases: string[]
  keywords: string[]
  sbarStarter?: {
    situation?: string
    background?: string
    assessment?: string
    recommendation?: string
  }
}

// ─── Wound / Drain / Diet reference types ─────────────────────────────────────

export interface WoundCareType {
  id: ID
  name: string
  description: string
  assessmentPoints: string[]
  dressingOptions: string[]
  videoLinks: VideoLink[]
}

export interface DrainType {
  id: ID
  name: string
  type: string
  outputNormal?: string
  emptyingTechnique: string
  siteCareTips: string[]
  troubleshooting: string[]
  notifyProvider: string[]
  videoLinks: VideoLink[]
}

export interface DietTypeInfo {
  id: ID
  name: string
  definition: string
  qualifies?: string[]
  doesNotQualify?: string[]
  nursingImplications: string[]
  medicationImplications?: string[]
  videoLinks: VideoLink[]
}

// ─── User Settings ────────────────────────────────────────────────────────────

export interface UserSettings {
  chartingNotificationTimes: MilitaryTime[]
  preferredTimeFormat: TimeFormat
  shiftStart: MilitaryTime
  shiftEnd: MilitaryTime
  fontScale: number
  highContrast: boolean
  aiProviderKey: string
  aiModel: string
  aiEnabled: boolean
  onboardingCompleted: boolean
}

// ─── AI response shape ────────────────────────────────────────────────────────

export interface AIGamePlanResponse {
  clinicalImpression: string
  immediate: string[]
  ongoing: string[]
  monitoringRedFlags: string[]
  potentialComplications: string[]
  providerQuestions: string[]
  suggestedTimelineTasks: SuggestedTask[]
}
