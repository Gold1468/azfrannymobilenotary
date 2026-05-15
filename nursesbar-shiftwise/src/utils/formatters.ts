import type { Patient, SBAR, PatientSnapshot, VitalsEntry, GlossaryTerm } from '@/models/types'

export function chipsToText(chips: string[]): string {
  if (chips.length === 0) return ''
  return chips.join(', ')
}

export function vitalsToString(v: VitalsEntry): string {
  const parts: string[] = []
  if (v.bp) parts.push(`BP ${v.bp}`)
  if (v.hr) parts.push(`HR ${v.hr}`)
  if (v.rr) parts.push(`RR ${v.rr}`)
  if (v.spo2) parts.push(`SpO2 ${v.spo2}%`)
  if (v.temp) parts.push(`Temp ${v.temp}°F`)
  if (v.pain !== undefined && v.pain !== null) parts.push(`Pain ${v.pain}/10`)
  return parts.join(', ')
}

export function snapshotToBackground(
  snapshot: PatientSnapshot,
  patient: Patient
): string {
  const lines: string[] = []

  if (snapshot.admissionReason.length) {
    lines.push(`${patient.name} is a ${patient.age ?? ''}yo admitted for ${chipsToText(snapshot.admissionReason)}.`)
  }

  if (snapshot.pmh.length) {
    lines.push(`PMH: ${chipsToText(snapshot.pmh)}.`)
  }

  if (snapshot.psh.length) {
    lines.push(`PSH: ${chipsToText(snapshot.psh)}.`)
  }

  if (snapshot.hospitalCourse.length) {
    lines.push(`Hospital course: ${chipsToText(snapshot.hospitalCourse)}.`)
  }

  const vitalsStr = vitalsToString(snapshot.vitals)
  if (vitalsStr) {
    lines.push(`Current vitals: ${vitalsStr}.`)
  }

  if (snapshot.vitals.trends.length) {
    lines.push(`Trends: ${chipsToText(snapshot.vitals.trends)}.`)
  }

  const critLabs = snapshot.labs.filter(l => l.status === 'critical' || l.status === 'high' || l.status === 'low')
  if (critLabs.length) {
    const labStr = critLabs.map(l => `${l.key} ${l.value} (${l.status})`).join(', ')
    lines.push(`Notable labs: ${labStr}.`)
  }

  if (snapshot.woundCare.length) {
    const wStr = snapshot.woundCare.map(w =>
      `${w.location} ${w.type}${w.isVAC ? ' with VAC' : ''} — ${w.dressing}`
    ).join('; ')
    lines.push(`Wound care: ${wStr}.`)
  }

  if (snapshot.drains.length) {
    const dStr = snapshot.drains.map(d =>
      `${d.type.replace('_', ' ')} at ${d.location}${d.outputVolume ? ` (${d.outputVolume} mL)` : ''}`
    ).join('; ')
    lines.push(`Drains: ${dStr}.`)
  }

  if (snapshot.diet.npoStatus) {
    lines.push(`Patient is currently NPO${snapshot.diet.npoRationale ? ` — ${snapshot.diet.npoRationale}` : ''}.`)
  } else if (snapshot.diet.type) {
    lines.push(`Diet: ${snapshot.diet.type}${snapshot.diet.aspirationPrecautions ? ' with aspiration precautions' : ''}.`)
  }

  if (snapshot.consults.length) {
    lines.push(`Active consults: ${chipsToText(snapshot.consults)}.`)
  }

  return lines.join('\n')
}

export function sbarToPlainText(sbar: SBAR, patient: Patient): string {
  return [
    `SBAR Report — ${patient.name} | Room ${patient.room} | ${patient.codeStatus}`,
    `Allergies: ${patient.allergies.join(', ') || 'NKDA'}`,
    '',
    'SITUATION:',
    sbar.situation || '(none entered)',
    '',
    'BACKGROUND:',
    sbar.background || '(none entered)',
    '',
    'ASSESSMENT:',
    sbar.assessment || '(none entered)',
    '',
    'RECOMMENDATION:',
    sbar.recommendation || '(none entered)',
  ].join('\n')
}

export function sbarToClinicalReport(
  sbar: SBAR,
  patient: Patient,
  snapshot: PatientSnapshot
): string {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
  return [
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    'NURSE SBAR SHIFTWISE — CLINICAL HANDOFF REPORT',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    `Patient: ${patient.name}  |  Room: ${patient.room}  |  Age: ${patient.age ?? 'N/A'}`,
    `Code Status: ${patient.codeStatus}  |  Allergies: ${patient.allergies.join(', ') || 'NKDA'}`,
    `Generated: ${date}`,
    '',
    '─── SITUATION ─────────────────────────────────',
    sbar.situation || '(not entered)',
    '',
    '─── BACKGROUND ────────────────────────────────',
    sbar.background || '(not entered)',
    '',
    '─── ASSESSMENT ────────────────────────────────',
    sbar.assessment || '(not entered)',
    '',
    '─── RECOMMENDATION ────────────────────────────',
    sbar.recommendation || '(not entered)',
    '',
    '─── VITALS ────────────────────────────────────',
    vitalsToString(snapshot.vitals) || '(not recorded)',
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    'DISCLAIMER: Assistive reference only. Always verify with current orders,',
    'facility protocols, and clinical judgment.',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  ].join('\n')
}

export function insertGlossaryTermIntoSBAR(term: GlossaryTerm): string {
  if (term.abbreviation) {
    return `${term.term} (${term.abbreviation}): ${term.definition}`
  }
  return `${term.term}: ${term.definition}`
}

export function titleCase(s: string): string {
  return s.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase())
}

export function truncate(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s
  return s.slice(0, maxLen - 1) + '…'
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function nowISO(): string {
  return new Date().toISOString()
}
