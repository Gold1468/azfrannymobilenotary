import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle, Activity, Brain, Heart, Wind, Apple,
  Stethoscope, Droplets, Bone, Syringe, Users, Save, Clock, Plus, Trash2
} from 'lucide-react'
import { usePatientStore } from '@/store/patientStore'
import { useSnapshotStore } from '@/store/snapshotStore'
import { useTaskStore } from '@/store/taskStore'
import { useSettingsStore } from '@/store/settingsStore'
import { SnapshotPanel } from '@/components/snapshot/SnapshotPanel'
import { ChipSelector } from '@/components/snapshot/ChipSelector'
import admissionData from '@/data/admissionReasons.json'
import diseasesData from '@/data/diseases.json'
import dietData from '@/data/dietTypes.json'
import type { WoundCareEntry, DrainEntry } from '@/models/types'
import { generateId } from '@/utils/formatters'

const ADMISSION_CHIPS = (admissionData as { chips: string[] }[]).flatMap(c => c.chips)
const DISEASE_NAMES = (diseasesData as { name: string; aliases: string[] }[]).flatMap(d => [d.name, ...d.aliases])
const DIET_NAMES = (dietData as { name: string }[]).map(d => d.name)
const HOSPITAL_COURSE_CHIPS = ['IV antibiotics started','Wound care initiated','Wound VAC initiated','Blood products given','Labs pending / sent','Imaging completed (CXR/CT)','Consults seen','Drain placed','Cast/splint applied','Pain controlled','Diet advanced','Post-op day 1','Transferred from ICU','NPO ordered']
const VITAL_TRENDS = ['Hemodynamically stable','BP trending up','BP trending down','Tachycardic','Bradycardic','Hypoxic','O2 requirements increasing','Febrile','Afebrile','Pain controlled','Pain worsening']
const CONSULTS = ['Cardiology','Nephrology','Infectious Disease','Pulmonology','Neurology','GI','Surgery','Orthopedics','PT/OT','Speech Therapy','Wound Care','Nutrition/Dietitian','Social Work','Palliative Care','Pharmacy','Case Management']
const DRAIN_TYPES = ['jp','hemovac','penrose','chest_tube','ng_tube','foley','other'] as const
const IV_PATENCY = ['patent','infiltrated','phlebitis','occluded'] as const
const ASSESS_SYSTEMS = [
  { system: 'Neuro', findings: ['A&Ox4','A&Ox3','A&Ox2','A&Ox1','Confused/disoriented','Pupils PERRLA','Unequal pupils','GCS full','GCS impaired','No focal deficits','Focal deficits present','Follows commands','Does not follow commands'] },
  { system: 'Cardiac', findings: ['Regular rate and rhythm','Irregular rhythm','Tachycardic','Bradycardic','S1 S2 present','Murmur noted','JVD present','No JVD','Peripheral edema','No edema','On telemetry','Pacemaker','ICD present'] },
  { system: 'Respiratory', findings: ['Clear to auscultation bilaterally','Diminished bases','Crackles present','Wheezing','O2 room air','O2 nasal cannula','O2 face mask','O2 high-flow','BiPAP/CPAP','Intubated/ventilated','Labored breathing','SpO2 at baseline'] },
  { system: 'GI/GU', findings: ['Bowel sounds present','Bowel sounds absent/hypoactive','Abdomen soft non-tender','Abdominal tenderness','Nausea/vomiting','Last BM noted','Foley in place','Adequate urine output','Decreased urine output','NGT in place','G-tube in place','Ostomy present'] },
  { system: 'Skin/Integumentary', findings: ['Skin warm dry intact','Diaphoretic','Pale/pallor','Jaundice','Cyanotic','Good turgor','Poor turgor','Wound present (see wound section)','No pressure injuries','Pressure injury present','Edema present','Bruising noted'] },
]

export function SnapshotScreen() {
  const navigate = useNavigate()
  const patient = usePatientStore(s => s.getActivePatient())
  const { getSnapshot, updateField, save, addWound, removeWound, addDrain, removeDrain, addIV, removeIV, updateDiet, loadSnapshot } = useSnapshotStore()
  const { addSnapshotDerivedTasks } = useTaskStore()
  const shiftStart = useSettingsStore(s => s.settings.shiftStart)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!patient) { navigate('/'); return }
    loadSnapshot(patient.id)
  }, [patient?.id])

  if (!patient) return null
  const snap = getSnapshot(patient.id)

  const debounce = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => save(patient.id), 2500)
  }

  const upd = <K extends keyof typeof snap>(field: K, value: typeof snap[K]) => {
    updateField(patient.id, field, value)
    debounce()
  }

  const handleGenerateTasks = async () => {
    await addSnapshotDerivedTasks(patient.id, snap, shiftStart)
    navigate('/timeline')
  }

  return (
    <div className="p-4 space-y-3 max-w-lg mx-auto pb-24">
      <div className="flex items-center gap-2 mb-2">
        <h1 className="text-lg font-bold text-slate-100 flex-1">Patient Snapshot</h1>
        <button onClick={() => save(patient.id)} className="flex items-center gap-1.5 text-sm px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-slate-100 transition-colors min-h-[40px]">
          <Save className="w-4 h-4" /> Save
        </button>
        <button onClick={handleGenerateTasks} className="flex items-center gap-1.5 text-sm px-3 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-semibold transition-colors min-h-[40px]">
          <Clock className="w-4 h-4" /> → Timeline
        </button>
      </div>

      <SnapshotPanel title="Admission Reason" icon={<AlertCircle className="w-4 h-4" />} defaultOpen badge={snap.admissionReason.length || undefined}>
        <ChipSelector options={ADMISSION_CHIPS} selected={snap.admissionReason} onChange={v => upd('admissionReason', v)} allowCustom maxVisible={12} />
      </SnapshotPanel>

      <SnapshotPanel title="Hospital Course" icon={<Activity className="w-4 h-4" />} badge={snap.hospitalCourse.length || undefined}>
        <ChipSelector options={HOSPITAL_COURSE_CHIPS} selected={snap.hospitalCourse} onChange={v => upd('hospitalCourse', v)} allowCustom />
      </SnapshotPanel>

      <SnapshotPanel title="PMH / PSH" icon={<Brain className="w-4 h-4" />} badge={(snap.pmh.length + snap.psh.length) || undefined}>
        <p className="text-xs text-slate-400 mb-2">Past Medical History</p>
        <ChipSelector options={DISEASE_NAMES.slice(0, 40)} selected={snap.pmh} onChange={v => upd('pmh', v)} allowCustom maxVisible={20} />
        <p className="text-xs text-slate-400 mb-2 mt-3">Past Surgical History</p>
        <ChipSelector options={['CABG','PTCA/Stent','Hip replacement','Knee replacement','Appendectomy','Cholecystectomy','C-section','Hysterectomy','Spinal surgery','Bowel resection','Amputation','Cardiac valve repair/replacement','TAVR','Colostomy/Ileostomy','Tracheostomy']} selected={snap.psh} onChange={v => upd('psh', v)} allowCustom />
      </SnapshotPanel>

      <SnapshotPanel title="Vital Signs" icon={<Activity className="w-4 h-4" />}>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'bp', label: 'BP (mmHg)', placeholder: '120/80' },
            { key: 'hr', label: 'HR (bpm)', placeholder: '72', type: 'number' },
            { key: 'rr', label: 'RR (br/min)', placeholder: '16', type: 'number' },
            { key: 'spo2', label: 'SpO2 (%)', placeholder: '98', type: 'number' },
            { key: 'temp', label: 'Temp (°F)', placeholder: '98.6', type: 'number' },
            { key: 'pain', label: 'Pain (0-10)', placeholder: '4', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
              <input
                type={f.type ?? 'text'}
                value={(snap.vitals as unknown as Record<string, unknown>)[f.key] as string ?? ''}
                onChange={e => upd('vitals', { ...snap.vitals, [f.key]: f.type === 'number' ? Number(e.target.value) || undefined : e.target.value })}
                placeholder={f.placeholder}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 min-h-[40px]"
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3 mb-1">Trends</p>
        <ChipSelector options={VITAL_TRENDS} selected={snap.vitals.trends ?? []} onChange={v => upd('vitals', { ...snap.vitals, trends: v })} size="sm" />
      </SnapshotPanel>

      {ASSESS_SYSTEMS.map(sys => (
        <SnapshotPanel key={sys.system} title={`Assessment — ${sys.system}`} icon={<Heart className="w-4 h-4" />} badge={snap.assessments.find(a => a.system === sys.system)?.findings.length || undefined}>
          <ChipSelector
            options={sys.findings}
            selected={snap.assessments.find(a => a.system === sys.system)?.findings ?? []}
            onChange={v => {
              const others = snap.assessments.filter(a => a.system !== sys.system)
              upd('assessments', [...others, { system: sys.system, findings: v, notes: '' }])
            }}
            allowCustom
          />
        </SnapshotPanel>
      ))}

      <SnapshotPanel title="Wound Care / Wound VAC" icon={<Stethoscope className="w-4 h-4" />} badge={snap.woundCare.length || undefined}>
        {snap.woundCare.map(w => (
          <div key={w.id} className="bg-slate-800 border border-slate-700 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200">{w.location || 'Wound'} — {w.type}</span>
              <button onClick={() => removeWound(patient.id, w.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors" aria-label="Remove wound">
                <Trash2 className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
            <div className="text-xs text-slate-400 space-y-0.5">
              <div>Dressing: {w.dressing}</div>
              {w.isVAC && <div className="text-cyan-400">⚡ Wound VAC — {w.vacSettings?.mode} {w.vacSettings?.pressureMmhg}mmHg</div>}
            </div>
          </div>
        ))}
        <button onClick={() => addWound(patient.id, { location: 'Location TBD', type: 'Surgical incision', dressing: 'Dry sterile dressing', isVAC: false, notes: '' } as Omit<WoundCareEntry, 'id'>)} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors mt-1 min-h-[36px]">
          <Plus className="w-4 h-4" /> Add Wound
        </button>
      </SnapshotPanel>

      <SnapshotPanel title="Drains" icon={<Droplets className="w-4 h-4" />} badge={snap.drains.length || undefined}>
        {snap.drains.map(d => (
          <div key={d.id} className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-slate-200">{d.type.replace('_', ' ').toUpperCase()}</span>
              <div className="text-xs text-slate-400">{d.location} {d.outputVolume ? `— ${d.outputVolume} mL` : ''}</div>
            </div>
            <button onClick={() => removeDrain(patient.id, d.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors" aria-label="Remove drain">
              <Trash2 className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        ))}
        <div className="grid grid-cols-2 gap-2 mt-1">
          {DRAIN_TYPES.map(type => (
            <button key={type} onClick={() => addDrain(patient.id, { type, location: 'TBD', outputVolume: '', outputCharacter: '', patencyNotes: '', notes: '' } as Omit<DrainEntry, 'id'>)} className="text-xs px-2 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:border-cyan-600 transition-colors min-h-[36px] flex items-center gap-1.5 justify-center">
              <Plus className="w-3 h-3 text-cyan-400" /> {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </SnapshotPanel>

      <SnapshotPanel title="IV Access" icon={<Syringe className="w-4 h-4" />} badge={snap.ivAccess.length || undefined}>
        {snap.ivAccess.map(iv => (
          <div key={iv.id} className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-slate-200">{iv.type} — {iv.site}</span>
              <div className={`text-xs mt-0.5 ${iv.patency === 'patent' ? 'text-green-400' : 'text-red-400'}`}>{iv.patency}</div>
            </div>
            <button onClick={() => removeIV(patient.id, iv.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors" aria-label="Remove IV">
              <Trash2 className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        ))}
        <button onClick={() => addIV(patient.id, { type: 'peripheral', site: 'L AC', gauge: '18g', patency: 'patent', notes: '' })} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors mt-1 min-h-[36px]">
          <Plus className="w-4 h-4" /> Add IV Site
        </button>
        {snap.ivAccess.length > 0 && snap.ivAccess.map(iv => (
          <div key={iv.id + '-pat'} className="mt-1">
            <label className="text-xs text-slate-400 mb-1 block">Patency — {iv.site}</label>
            <div className="flex gap-1.5">
              {IV_PATENCY.map(p => (
                <button key={p} onClick={() => {
                  const updated = snap.ivAccess.map(i => i.id === iv.id ? { ...i, patency: p } : i)
                  upd('ivAccess', updated)
                }} className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors min-h-[28px] ${iv.patency === p ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300' : 'border-slate-700 bg-slate-800 text-slate-400'}`} aria-pressed={iv.patency === p}>{p}</button>
              ))}
            </div>
          </div>
        ))}
      </SnapshotPanel>

      <SnapshotPanel title="Casts / Ortho Devices" icon={<Bone className="w-4 h-4" />} badge={snap.casts.length || undefined}>
        {snap.casts.map(c => (
          <div key={c.id} className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-slate-200">{c.location} — {c.castType}</span>
              <div className="text-xs text-slate-400 mt-0.5">{c.neurovascular.color || ''} {c.neurovascular.capRefill ? `cap refill ${c.neurovascular.capRefill}` : ''}</div>
              {c.compartmentSyndromeSigns.length > 0 && (
                <div className="text-xs text-red-400 mt-0.5">⚠ Compartment signs: {c.compartmentSyndromeSigns.join(', ')}</div>
              )}
            </div>
            <button onClick={() => { const updated = snap.casts.filter(x => x.id !== c.id); upd('casts', updated) }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors" aria-label="Remove cast">
              <Trash2 className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        ))}
        <button onClick={() => { upd('casts', [...snap.casts, { id: generateId(), location: 'R arm', castType: 'Short arm cast', neurovascular: { color: 'pink', capRefill: '<2 sec', sensation: 'intact', movement: 'intact', pulsePresent: true }, compartmentSyndromeSigns: [] }]) }} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors min-h-[36px]">
          <Plus className="w-4 h-4" /> Add Cast/Device
        </button>
      </SnapshotPanel>

      <SnapshotPanel title="Diet / Nutrition" icon={<Apple className="w-4 h-4" />}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button onClick={() => updateDiet(patient.id, { npoStatus: !snap.diet.npoStatus })} className={`px-4 py-2 rounded-xl border font-semibold text-sm transition-colors min-h-[40px] ${snap.diet.npoStatus ? 'border-red-500 bg-red-500/20 text-red-300' : 'border-slate-700 bg-slate-800 text-slate-300'}`} aria-pressed={snap.diet.npoStatus}>
              {snap.diet.npoStatus ? '🔴 NPO' : 'Set NPO'}
            </button>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" checked={snap.diet.aspirationPrecautions} onChange={e => updateDiet(patient.id, { aspirationPrecautions: e.target.checked })} className="w-4 h-4 accent-cyan-500" />
              Aspiration Precautions
            </label>
          </div>
          {snap.diet.npoStatus && (
            <input value={snap.diet.npoRationale ?? ''} onChange={e => updateDiet(patient.id, { npoRationale: e.target.value })} placeholder="NPO reason (pre-op, swallowing, etc.)" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 min-h-[40px]" />
          )}
          {!snap.diet.npoStatus && (
            <>
              <p className="text-xs text-slate-400">Diet Type</p>
              <ChipSelector options={DIET_NAMES} selected={snap.diet.type ? [snap.diet.type] : []} onChange={v => updateDiet(patient.id, { type: v[v.length - 1] ?? '' })} />
            </>
          )}
        </div>
      </SnapshotPanel>

      <SnapshotPanel title="Consults" icon={<Users className="w-4 h-4" />} badge={snap.consults.length || undefined}>
        <ChipSelector options={CONSULTS} selected={snap.consults} onChange={v => upd('consults', v)} allowCustom />
      </SnapshotPanel>

      <SnapshotPanel title="Respiratory Details" icon={<Wind className="w-4 h-4" />}>
        <ChipSelector
          options={['Room air','Nasal cannula 2L','Nasal cannula 4L','Nasal cannula 6L','Face mask 6-10L','Non-rebreather mask','High-flow nasal cannula (HFNC)','Venturi mask','BiPAP','CPAP','Intubated — MV','Trach','O2 titrated to SpO2 88-92% (COPD)','O2 titrated to SpO2 ≥92%']}
          selected={snap.assessments.find(a => a.system === 'O2 Status')?.findings ?? []}
          onChange={v => {
            const others = snap.assessments.filter(a => a.system !== 'O2 Status')
            upd('assessments', [...others, { system: 'O2 Status', findings: v, notes: '' }])
          }}
        />
      </SnapshotPanel>
    </div>
  )
}
