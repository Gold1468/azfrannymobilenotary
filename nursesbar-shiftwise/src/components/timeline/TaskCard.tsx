import {
  CheckCircle2, Circle, Pill, Activity, Stethoscope, FlaskConical,
  Droplets, Bone, Utensils, Droplet, Syringe,
  ClipboardList, MoreVertical, Trash2, Edit3
} from 'lucide-react'
import { useState } from 'react'
import type { Task, TaskCategory } from '@/models/types'
import { CATEGORY_COLORS, CATEGORY_BG } from '@/utils/icons'
import { useSettingsStore } from '@/store/settingsStore'
import { formatTime } from '@/utils/militaryTime'

const ICONS: Record<TaskCategory, React.ElementType> = {
  med: Pill, vital: Activity, assessment: Stethoscope, lab: FlaskConical,
  wound: Stethoscope, drain: Droplets, cast: Bone, diet: Utensils,
  blood_product: Droplet, drip: Syringe, charting: ClipboardList, general: CheckCircle2,
}

interface Props {
  task: Task
  onToggle: () => void
  onEdit?: () => void
  onDelete: () => void
}

export function TaskCard({ task, onToggle, onEdit, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const format = useSettingsStore(s => s.settings.preferredTimeFormat)
  const Icon = ICONS[task.category] ?? CheckCircle2
  const colorCls = CATEGORY_COLORS[task.category] ?? 'text-slate-400'
  const bgCls = CATEGORY_BG[task.category] ?? 'bg-slate-400/10'

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
        task.completed
          ? 'border-slate-800 bg-slate-900/50 opacity-60'
          : task.source === 'ai'
            ? 'border-purple-800/50 bg-slate-900 border-l-2 border-l-purple-500'
            : 'border-slate-800 bg-slate-900'
      }`}
    >
      <div className={`mt-0.5 w-8 h-8 rounded-lg ${bgCls} flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${colorCls}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-mono font-semibold text-cyan-400 shrink-0">
            {formatTime(task.time, format)}
          </span>
          {task.source === 'ai' && (
            <span className="text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full shrink-0">AI</span>
          )}
          {task.source === 'snapshot' && (
            <span className="text-xs bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full shrink-0">S</span>
          )}
        </div>
        <p className={`text-sm leading-snug ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
          {task.description}
        </p>
        {task.notes && (
          <p className="text-xs text-slate-500 mt-0.5">{task.notes}</p>
        )}
        {task.completedAt && (
          <p className="text-xs text-green-500 mt-0.5">
            ✓ {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors"
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed
            ? <CheckCircle2 className="w-5 h-5 text-green-400" />
            : <Circle className="w-5 h-5 text-slate-500" />
          }
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Task options"
          >
            <MoreVertical className="w-4 h-4 text-slate-500" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
              {onEdit && (
                <button
                  onClick={() => { onEdit(); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
              )}
              <button
                onClick={() => { onDelete(); setMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-slate-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
