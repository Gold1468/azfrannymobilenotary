import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Plus, CheckCircle2, Circle, ChevronRight, Clock } from 'lucide-react'
import { usePatientStore } from '@/store/patientStore'
import { useSBARStore } from '@/store/sbarStore'
import { useSnapshotStore } from '@/store/snapshotStore'
import { useTaskStore } from '@/store/taskStore'
import { useSettingsStore } from '@/store/settingsStore'
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { generateGamePlan } from '@/services/ai'
import type { AIGamePlanResponse } from '@/models/types'

export function GamePlanScreen() {
  const navigate = useNavigate()
  const patient = usePatientStore(s => s.getActivePatient())
  const { getSBAR, getGamePlan, loadGamePlan, addGamePlanItem, toggleGamePlanItem, updateGamePlanField } = useSBARStore()
  const snapshot = useSnapshotStore(s => patient ? s.getSnapshot(patient.id) : undefined)
  const { addBulkTasks } = useTaskStore()
  const settings = useSettingsStore(s => s.settings)
  const [tab, setTab] = useState<'manual' | 'ai'>('manual')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<AIGamePlanResponse | null>(null)
  const [aiIsStub, setAiIsStub] = useState(false)
  const [newItemText, setNewItemText] = useState('')
  const [newItemSection, setNewItemSection] = useState<'immediate' | 'ongoing'>('immediate')

  useEffect(() => {
    if (!patient) { navigate('/'); return }
    loadGamePlan(patient.id)
  }, [patient?.id])

  if (!patient) return null
  const sbar = getSBAR(patient.id)
  const plan = getGamePlan(patient.id)

  const runAI = async () => {
    if (!sbar || !snapshot) return
    setAiLoading(true)
    try {
      const { data, isStub } = await generateGamePlan(patient, snapshot, sbar, settings)
      setAiResult(data)
      setAiIsStub(isStub)
    } finally {
      setAiLoading(false)
    }
  }

  const addToTimeline = async () => {
    if (!aiResult) return
    await addBulkTasks(
      aiResult.suggestedTimelineTasks.map(t => ({
        patientId: patient.id,
        time: t.time,
        description: t.description,
        category: t.category,
        completed: false,
        completedAt: undefined,
        notes: '',
        source: 'ai' as const,
        createdAt: new Date().toISOString(),
      }))
    )
    navigate('/timeline')
  }

  const addItem = () => {
    if (!newItemText.trim()) return
    addGamePlanItem(patient.id, newItemSection, newItemText.trim())
    setNewItemText('')
  }

  const applyAIPlan = () => {
    if (!aiResult) return
    updateGamePlanField(patient.id, 'clinicalImpression', aiResult.clinicalImpression)
    updateGamePlanField(patient.id, 'monitoringRedFlags', aiResult.monitoringRedFlags)
    updateGamePlanField(patient.id, 'potentialComplications', aiResult.potentialComplications)
    updateGamePlanField(patient.id, 'providerQuestions', aiResult.providerQuestions)
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 pb-24">
      <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 gap-1">
        {(['manual', 'ai'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors min-h-[40px] ${tab === t ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            {t === 'manual' ? 'My Plan' : 'AI Generated'}
          </button>
        ))}
      </div>

      {tab === 'manual' && (
        <div className="space-y-4">
          {plan?.clinicalImpression && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Clinical Impression</h3>
              <p className="text-sm text-slate-200 leading-relaxed">{plan.clinicalImpression}</p>
            </div>
          )}

          {(['immediate', 'ongoing'] as const).map(section => (
            <div key={section} className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {section === 'immediate' ? '🔴 Immediate Actions' : '🟡 Ongoing Actions'}
              </h3>
              {(plan?.[section] ?? []).map(item => (
                <button key={item.id} onClick={() => toggleGamePlanItem(patient.id, section, item.id)} className="w-full flex items-start gap-2.5 py-1.5 text-left">
                  {item.completed
                    ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    : <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  }
                  <span className={`text-sm leading-relaxed ${item.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>{item.text}</span>
                </button>
              ))}
              <div className="flex gap-2 mt-2">
                <button onClick={() => setNewItemSection(section)} className={`text-xs px-2 py-1 rounded border transition-colors ${newItemSection === section ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300' : 'border-slate-700 bg-slate-800 text-slate-400'}`} aria-pressed={newItemSection === section}>
                  + Add here
                </button>
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <input
              value={newItemText}
              onChange={e => setNewItemText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addItem() }}
              placeholder={`Add ${newItemSection} action…`}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 min-h-[44px]"
            />
            <button onClick={addItem} disabled={!newItemText.trim()} className="w-11 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 rounded-xl flex items-center justify-center transition-colors min-h-[44px]">
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>

          {plan?.monitoringRedFlags && plan.monitoringRedFlags.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 space-y-1.5">
              <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">⚠ Monitoring & Red Flags</h3>
              {plan.monitoringRedFlags.map((f, i) => (
                <p key={i} className="text-sm text-red-200 flex gap-2"><ChevronRight className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />{f}</p>
              ))}
            </div>
          )}

          {plan?.providerQuestions && plan.providerQuestions.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Provider Questions</h3>
              {plan.providerQuestions.map((q, i) => (
                <p key={i} className="text-sm text-slate-300 flex gap-2"><ChevronRight className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />{q}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'ai' && (
        <div className="space-y-4">
          <DisclaimerBanner />

          {!aiResult && !aiLoading && (
            <div className="flex flex-col items-center py-10 text-center gap-4">
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 mb-1">AI Game Plan</h3>
                <p className="text-sm text-slate-400 max-w-xs">Generate a structured shift plan using your patient's snapshot, SBAR, and clinical context.</p>
              </div>
              <button onClick={runAI} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors min-h-[48px]">
                <Sparkles className="w-4 h-4" /> Generate Game Plan
              </button>
            </div>
          )}

          {aiLoading && <LoadingSpinner label="Generating your game plan…" className="py-10" />}

          {aiResult && !aiLoading && (
            <div className="space-y-4">
              {aiIsStub && (
                <div className="text-xs text-slate-500 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-purple-400" /> Example plan — configure AI in Settings for personalized output
                </div>
              )}

              <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-3">
                <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1.5">Clinical Impression</h3>
                <p className="text-sm text-slate-200 leading-relaxed">{aiResult.clinicalImpression}</p>
              </div>

              {[['🔴 Immediate', aiResult.immediate], ['🟡 Ongoing', aiResult.ongoing]].map(([title, items]) => (
                <div key={title as string} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{title as string}</h3>
                  {(items as string[]).map((item, i) => (
                    <p key={i} className="text-sm text-slate-200 flex gap-2 mb-1.5"><ChevronRight className="w-4 h-4 shrink-0 mt-0.5 text-purple-400" />{item}</p>
                  ))}
                </div>
              ))}

              {aiResult.monitoringRedFlags.length > 0 && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                  <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">⚠ Red Flags</h3>
                  {aiResult.monitoringRedFlags.map((f, i) => (
                    <p key={i} className="text-sm text-red-200 flex gap-2 mb-1"><ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />{f}</p>
                  ))}
                </div>
              )}

              {aiResult.providerQuestions.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Provider Questions</h3>
                  {aiResult.providerQuestions.map((q, i) => (
                    <p key={i} className="text-sm text-slate-300 flex gap-2 mb-1"><ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-cyan-400" />{q}</p>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={applyAIPlan} className="flex-1 bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-semibold py-2.5 rounded-xl text-sm transition-colors min-h-[44px]">
                  Apply to My Plan
                </button>
                <button onClick={addToTimeline} className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors min-h-[44px]">
                  <Clock className="w-4 h-4" /> Add to Timeline
                </button>
              </div>
              <button onClick={runAI} className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-purple-400 transition-colors py-2 min-h-[40px]">
                <Sparkles className="w-3.5 h-3.5" /> Regenerate
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
