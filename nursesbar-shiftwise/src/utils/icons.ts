import type { TaskCategory } from '@/models/types'

export const CATEGORY_ICONS: Record<TaskCategory, string> = {
  med: 'Pill',
  vital: 'Activity',
  assessment: 'Stethoscope',
  lab: 'FlaskConical',
  wound: 'Stethoscope',
  drain: 'Droplets',
  cast: 'Bone',
  diet: 'Utensils',
  blood_product: 'Droplet',
  drip: 'Syringe',
  charting: 'ClipboardList',
  general: 'CheckCircle2',
}

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  med: 'text-blue-400',
  vital: 'text-green-400',
  assessment: 'text-purple-400',
  lab: 'text-yellow-400',
  wound: 'text-orange-400',
  drain: 'text-cyan-400',
  cast: 'text-stone-400',
  diet: 'text-lime-400',
  blood_product: 'text-red-400',
  drip: 'text-indigo-400',
  charting: 'text-teal-400',
  general: 'text-slate-400',
}

export const CATEGORY_BG: Record<TaskCategory, string> = {
  med: 'bg-blue-400/10',
  vital: 'bg-green-400/10',
  assessment: 'bg-purple-400/10',
  lab: 'bg-yellow-400/10',
  wound: 'bg-orange-400/10',
  drain: 'bg-cyan-400/10',
  cast: 'bg-stone-400/10',
  diet: 'bg-lime-400/10',
  blood_product: 'bg-red-400/10',
  drip: 'bg-indigo-400/10',
  charting: 'bg-teal-400/10',
  general: 'bg-slate-400/10',
}

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  med: 'Medication',
  vital: 'Vital Signs',
  assessment: 'Assessment',
  lab: 'Lab / Collection',
  wound: 'Wound Care',
  drain: 'Drain',
  cast: 'Cast / Ortho',
  diet: 'Diet / Nutrition',
  blood_product: 'Blood Product',
  drip: 'Drip / Infusion',
  charting: 'Charting',
  general: 'General',
}

export const ALL_CATEGORIES: TaskCategory[] = [
  'med','vital','assessment','lab','wound','drain','cast',
  'diet','blood_product','drip','charting','general'
]
