import type {
  Patient, PatientSnapshot, SBAR, Task, UserSettings,
  AIGamePlanResponse, TaskCategory
} from '@/models/types'
import { generateId, nowISO } from '@/utils/formatters'

// ─── Mock AI ──────────────────────────────────────────────────────────────────

function buildMockGamePlan(
  patient: Patient,
  snapshot: PatientSnapshot
): AIGamePlanResponse {
  const tasks: AIGamePlanResponse['suggestedTimelineTasks'] = [
    { time: '0800', description: 'Complete head-to-toe assessment', category: 'assessment' },
    { time: '0800', description: 'Obtain morning vital signs', category: 'vital' },
    { time: '0900', description: 'Medication administration — morning meds', category: 'med' },
    { time: '1200', description: 'Vital signs', category: 'vital' },
    { time: '1200', description: 'Charting update', category: 'charting' },
    { time: '1600', description: 'Vital signs', category: 'vital' },
    { time: '1600', description: 'Afternoon assessment', category: 'assessment' },
    { time: '1800', description: 'End-of-shift charting and handoff prep', category: 'charting' },
  ]

  if (snapshot.woundCare.length > 0) {
    tasks.push({ time: '1000', description: `Wound care: ${snapshot.woundCare[0].location}`, category: 'wound' })
    if (snapshot.woundCare.some(w => w.isVAC)) {
      tasks.push({ time: '1400', description: 'VAC seal integrity check', category: 'wound' })
    }
  }

  if (snapshot.drains.length > 0) {
    tasks.push({ time: '1100', description: 'Drain output measurement and documentation', category: 'drain' })
  }

  if (snapshot.casts.length > 0) {
    tasks.push({ time: '0900', description: 'Neurovascular check — cast extremity', category: 'cast' })
    tasks.push({ time: '1400', description: 'Neurovascular check — cast extremity', category: 'cast' })
  }

  if (snapshot.diet.npoStatus) {
    tasks.push({ time: '0800', description: 'NPO education and oral care', category: 'diet' })
  }

  const admissionText = snapshot.admissionReason.join(', ').toLowerCase()
  if (admissionText.includes('sepsis')) {
    tasks.push({ time: '0200', description: 'Blood cultures x2 (if ordered)', category: 'lab' })
    tasks.push({ time: '0800', description: 'Lactate level — sepsis monitoring', category: 'lab' })
  }
  if (admissionText.includes('chf') || admissionText.includes('heart failure')) {
    tasks.push({ time: '0600', description: 'Daily weight — same scale, same time', category: 'vital' })
    tasks.push({ time: '1200', description: 'I&O reconciliation — strict I&Os for CHF', category: 'charting' })
  }

  const monitoringFlags: string[] = [
    'Monitor vital signs per protocol — report significant changes to provider',
    'Assess IV site patency each shift and before/after medication administration',
    'Monitor I&Os — report urine output < 30 mL/hr x 2h to provider',
  ]

  if (snapshot.drains.some(d => d.type === 'jp' || d.type === 'hemovac')) {
    monitoringFlags.push('JP/Hemovac: notify provider if output > 100 mL/hr or bright red blood')
  }
  if (snapshot.woundCare.some(w => w.isVAC)) {
    monitoringFlags.push('Wound VAC: check seal integrity q2h, record canister output each shift, notify if seal compromised or bright red drainage')
  }
  if (snapshot.casts.length > 0) {
    monitoringFlags.push('Cast neurovascular checks q2h for new casts — notify IMMEDIATELY for pain with passive stretch, paresthesia, pallor (compartment syndrome signs)')
  }

  return {
    clinicalImpression: `${patient.name} admitted for ${snapshot.admissionReason.join(', ')}. ${snapshot.pmh.length > 0 ? `PMH: ${snapshot.pmh.slice(0, 3).join(', ')}. ` : ''}Priority areas this shift: hemodynamic monitoring, pain management, and symptom management.`,
    immediate: [
      'Complete comprehensive head-to-toe assessment',
      'Verify IV access patency and infusion rates',
      'Reconcile and administer scheduled medications',
      'Review provider orders for new or changed orders',
    ],
    ongoing: [
      'Monitor vital signs per protocol',
      'Assess and document pain per shift',
      'Maintain accurate I&Os',
      'Patient and family education as opportunities arise',
      'Re-assess and update plan throughout shift based on patient response',
    ],
    monitoringRedFlags: monitoringFlags,
    potentialComplications: [
      'Hemodynamic instability — report SBP < 90 or MAP < 65',
      'Respiratory changes — new oxygen requirement or worsening SpO2',
      'Altered mental status — new confusion or LOC changes from baseline',
      'Increased pain unresponsive to current regimen',
    ],
    providerQuestions: [
      'Are there any anticipated procedure or imaging orders today?',
      'Any anticipated diet or activity changes?',
      'Are current lab results back and have they been addressed?',
    ],
    suggestedTimelineTasks: tasks,
  }
}

// ─── Real LLM Path ────────────────────────────────────────────────────────────

async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  settings: UserSettings
): Promise<string> {
  const response = await fetch(settings.aiProviderKey ? settings.aiModel.startsWith('claude') ?
    'https://api.anthropic.com/v1/messages' :
    (settings.aiModel || 'https://api.openai.com/v1/chat/completions') :
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.aiProviderKey}`,
        'x-api-key': settings.aiProviderKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: settings.aiModel || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    }
  )
  if (!response.ok) throw new Error(`LLM API error: ${response.status}`)
  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? data.content?.[0]?.text ?? ''
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateGamePlan(
  patient: Patient,
  snapshot: PatientSnapshot,
  _sbar: SBAR,
  settings: UserSettings
): Promise<{ data: AIGamePlanResponse; isStub: boolean }> {
  if (!settings.aiEnabled || !settings.aiProviderKey) {
    return { data: buildMockGamePlan(patient, snapshot), isStub: true }
  }

  const systemPrompt = `You are an experienced med-surg/telemetry nurse educator. Generate a structured nursing shift game plan in JSON.
Respond ONLY with valid JSON matching this schema:
{
  "clinicalImpression": "string",
  "immediate": ["string"],
  "ongoing": ["string"],
  "monitoringRedFlags": ["string"],
  "potentialComplications": ["string"],
  "providerQuestions": ["string"],
  "suggestedTimelineTasks": [{"time":"HHMM","description":"string","category":"med|vital|assessment|lab|wound|drain|cast|diet|blood_product|drip|charting|general"}]
}
Be concise, actionable, and evidence-informed. Always include safety monitoring for any drips, blood products, or wounds/drains/casts present.`

  const userPrompt = `Patient: ${patient.name}, age ${patient.age}, ${patient.codeStatus}.
Admission: ${snapshot.admissionReason.join(', ')}
PMH: ${snapshot.pmh.join(', ')}
Hospital course: ${snapshot.hospitalCourse.join(', ')}
Vitals: BP ${snapshot.vitals.bp}, HR ${snapshot.vitals.hr}, RR ${snapshot.vitals.rr}, SpO2 ${snapshot.vitals.spo2}%, Temp ${snapshot.vitals.temp}F, Pain ${snapshot.vitals.pain}/10
Wounds: ${snapshot.woundCare.map(w => `${w.location} ${w.type}${w.isVAC ? ' (VAC)' : ''}`).join('; ') || 'None'}
Drains: ${snapshot.drains.map(d => `${d.type} at ${d.location}`).join('; ') || 'None'}
Casts: ${snapshot.casts.map(c => c.location).join('; ') || 'None'}
Diet: ${snapshot.diet.npoStatus ? 'NPO' : snapshot.diet.type}
Consults: ${snapshot.consults.join(', ') || 'None'}
Generate a nursing game plan for this patient's 12-hour shift.`

  try {
    const rawText = await callLLM(systemPrompt, userPrompt, settings)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    const parsed = JSON.parse(jsonMatch[0]) as AIGamePlanResponse
    return { data: parsed, isStub: false }
  } catch {
    return { data: buildMockGamePlan(patient, snapshot), isStub: true }
  }
}

export async function generateTimelineSuggestions(
  patient: Patient,
  snapshot: PatientSnapshot,
  existingTasks: Task[],
  settings: UserSettings
): Promise<Task[]> {
  const { data } = await generateGamePlan(
    patient, snapshot,
    { id: '', patientId: patient.id, situation: '', background: '', assessment: '', recommendation: '', version: 1, createdAt: '', updatedAt: '' },
    settings
  )
  const existingTimes = new Set(existingTasks.map(t => t.time + t.description))
  return data.suggestedTimelineTasks
    .filter(st => !existingTimes.has(st.time + st.description))
    .map(st => ({
      id: generateId(),
      patientId: patient.id,
      time: st.time,
      description: st.description,
      category: st.category as TaskCategory,
      completed: false,
      completedAt: undefined,
      notes: '',
      source: 'ai' as const,
      iconType: st.category,
      createdAt: nowISO(),
    }))
}
