import { useState } from 'react'
import { X } from 'lucide-react'
import type { TaskCategory } from '@/models/types'
import { MicButton } from '@/components/voice/MicButton'
import { CATEGORY_ICONS, CATEGORY_LABELS, CATEGORY_COLORS, ALL_CATEGORIES } from '@/utils/icons'
import { getCurrentMilTime, validateMilTime } from '@/utils/militaryTime'
import {
  Pill, Activity, Stethoscope, FlaskConical, Droplets,
  Bone, Utensils, Droplet, Syringe, ClipboardList, CheckCircle2
} from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  Pill, Activity, Stethoscope, FlaskConical, Droplets,
  Bone, Utensils, Droplet, Syringe, ClipboardList, CheckCircle2,
}

interface Props {
  patientId: string
  onAdd: (data: { time: string; description: string; category: TaskCategory; notes?: string }) => void
  onClose: () => void
}

export function AddTaskModal({ onAdd, onClose }: Props) {
  const [time, setTime] = useState(getCurrentMilTime())
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TaskCategory>('general')
  const [notes, setNotes] = useState('')
  const [timeError, setTimeError] = useState('')

  const submit = () => {
    if (!validateMilTime(time)) { setTimeError('Enter a valid military time (e.g. 0800)'); return }
    if (!description.trim()) return
    const clean = time.replace(':', '').padStart(4, '0')
    onAdd({ time: clean, description: description.trim(), category, notes: notes.trim() || undefined })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-slate-800 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-100">Add Task</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors" aria-label="Close">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Time (military)</label>
          <input
            type="text"
            value={time}
            onChange={e => { setTime(e.target.value); setTimeError('') }}
            placeholder="0800"
            maxLength={4}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500 min-h-[44px]"
          />
          {timeError && <p className="text-xs text-red-400 mt-1">{timeError}</p>}
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Category</label>
          <div className="grid grid-cols-4 gap-1.5">
            {ALL_CATEGORIES.map(cat => {
              const iconName = CATEGORY_ICONS[cat]
              const Icon = ICON_MAP[iconName] ?? CheckCircle2
              const color = CATEGORY_COLORS[cat]
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-colors min-h-[56px] ${
                    category === cat
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}
                  aria-pressed={category === cat}
                  aria-label={CATEGORY_LABELS[cat]}
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-xs text-slate-400 leading-none">{CATEGORY_LABELS[cat].split(' ')[0]}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Description</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit() }}
              placeholder="Task description…"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 min-h-[44px]"
            />
            <MicButton onTranscript={t => setDescription(prev => prev ? prev + ' ' + t : t)} size="md" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Additional notes…"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 min-h-[44px]"
          />
        </div>

        <button
          onClick={submit}
          disabled={!description.trim()}
          className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 transition-colors min-h-[48px]"
        >
          Add Task
        </button>
      </div>
    </div>
  )
}
