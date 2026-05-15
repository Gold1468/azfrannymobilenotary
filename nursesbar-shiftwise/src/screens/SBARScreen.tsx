import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Copy, Clipboard, BookOpen, Brain } from 'lucide-react'
import { usePatientStore } from '@/store/patientStore'
import { useSBARStore } from '@/store/sbarStore'
import { useSnapshotStore } from '@/store/snapshotStore'
import { TTSButton } from '@/components/sbar/TTSButton'
import { SBARSection } from '@/components/sbar/SBARSection'
import { QuickConditionButtons } from '@/components/sbar/QuickConditionButtons'
import { sbarToPlainText, snapshotToBackground } from '@/utils/formatters'

const SECTION_CONFIG = [
  { field: 'situation' as const, label: 'Situation', accentColor: 'border-blue-500', placeholder: 'Why are you calling? What is the problem? Example: "I am calling about Mr. Smith in room 301. He is having acute respiratory distress with SpO2 dropping to 84%."' },
  { field: 'background' as const, label: 'Background', accentColor: 'border-green-500', placeholder: 'Relevant history, admission reason, hospital course, PMH, current meds, treatments, labs, vitals. Tap "Fill from Snapshot" to auto-populate.' },
  { field: 'assessment' as const, label: 'Assessment', accentColor: 'border-amber-500', placeholder: 'Your clinical assessment. What do you think is happening? "I believe the problem is… because…"' },
  { field: 'recommendation' as const, label: 'Recommendation', accentColor: 'border-purple-500', placeholder: 'What do you need? What action do you want the provider to take? Be specific.' },
]

export function SBARScreen() {
  const navigate = useNavigate()
  const patient = usePatientStore(s => s.getActivePatient())
  const { getSBAR, updateSBARField, saveSBAR, initSBAR, loadSBAR } = useSBARStore()
  const snapshot = useSnapshotStore(s => patient ? s.getSnapshot(patient.id) : undefined)
  const [expanded, setExpanded] = useState<string>('situation')
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!patient) { navigate('/'); return }
    initSBAR(patient.id)
    loadSBAR(patient.id)
  }, [patient?.id])

  const sbar = patient ? getSBAR(patient.id) : undefined

  const save = async () => {
    if (!patient) return
    await saveSBAR(patient.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const copy = () => {
    if (!patient || !sbar) return
    const text = sbarToPlainText(sbar, patient)
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const fillFromSnapshot = useCallback(() => {
    if (!patient || !snapshot || !sbar) return
    const background = snapshotToBackground(snapshot, patient)
    if (background) {
      updateSBARField(patient.id, 'background', background)
    }
  }, [patient, snapshot, sbar])

  if (!patient || !sbar) return null

  const fullText = sbarToPlainText(sbar, patient)

  return (
    <div className="p-4 space-y-3 max-w-lg mx-auto pb-24">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-slate-500">Allergies:</span>
        <span className={`text-xs font-semibold ${patient.allergies.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
          {patient.allergies.length > 0 ? patient.allergies.join(', ') : 'NKDA'}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-xs text-slate-500 mb-2">Quick situation starters:</p>
        <QuickConditionButtons onInsert={text => {
          const current = sbar.situation
          updateSBARField(patient.id, 'situation', current ? current + ' ' + text : text)
          setExpanded('situation')
        }} />
      </div>

      {SECTION_CONFIG.map(cfg => (
        <SBARSection
          key={cfg.field}
          label={cfg.label}
          value={sbar[cfg.field] || ''}
          onChange={v => updateSBARField(patient.id, cfg.field, v)}
          placeholder={cfg.placeholder}
          accentColor={cfg.accentColor}
          isExpanded={expanded === cfg.field}
          onToggle={() => setExpanded(expanded === cfg.field ? '' : cfg.field)}
        />
      ))}

      <div className="flex gap-2 flex-wrap pt-2">
        <button onClick={fillFromSnapshot} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 hover:border-slate-600 transition-colors min-h-[40px]">
          <Clipboard className="w-4 h-4" /> Fill Background from Snapshot
        </button>
        <button onClick={() => navigate('/snapshot')} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 transition-colors min-h-[40px]">
          <Brain className="w-4 h-4" /> Snapshot
        </button>
        <button onClick={() => navigate('/glossary')} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 transition-colors min-h-[40px]">
          <BookOpen className="w-4 h-4" /> Glossary
        </button>
        <TTSButton text={fullText} label="Read Full SBAR" />
        <button onClick={copy} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 transition-colors min-h-[40px]">
          <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy'}
        </button>
        <button onClick={save} className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl font-semibold transition-colors min-h-[40px] ${saved ? 'bg-green-600 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}>
          <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save'}
        </button>
      </div>
    </div>
  )
}
