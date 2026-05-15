import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { usePatientStore } from '@/store/patientStore'
import { useTaskStore } from '@/store/taskStore'
import { useSettingsStore } from '@/store/settingsStore'
import { TimeFormatToggle } from '@/components/timeline/TimeFormatToggle'
import { TaskCard } from '@/components/timeline/TaskCard'
import { AddTaskModal } from '@/components/timeline/AddTaskModal'
import { getAllHourSlots, formatTime, getCurrentMilTime } from '@/utils/militaryTime'
import type { TaskCategory } from '@/models/types'

export function TimelineScreen() {
  const navigate = useNavigate()
  const patient = usePatientStore(s => s.getActivePatient())
  const { tasks, loadTasks, addTask, toggleComplete, deleteTask, clearCompletedTasks } = useTaskStore()
  const format = useSettingsStore(s => s.settings.preferredTimeFormat)
  const [showAdd, setShowAdd] = useState(false)
  const currentHourRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!patient) { navigate('/'); return }
    loadTasks(patient.id)
  }, [patient?.id])

  useEffect(() => {
    setTimeout(() => currentHourRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)
  }, [])

  if (!patient) return null

  const patientTasks = tasks[patient.id] ?? []
  const slots = getAllHourSlots()
  const now = getCurrentMilTime()
  const currentHour = now.slice(0, 2) + '00'

  const tasksByHour = patientTasks.reduce<Record<string, typeof patientTasks>>((acc, t) => {
    const h = t.time.slice(0, 2) + '00'
    if (!acc[h]) acc[h] = []
    acc[h].push(t)
    return acc
  }, {})

  const handleAdd = async (data: { time: string; description: string; category: TaskCategory; notes?: string }) => {
    await addTask({ ...data, patientId: patient.id, completed: false, completedAt: undefined, notes: data.notes ?? '', source: 'manual', createdAt: new Date().toISOString() })
    setShowAdd(false)
  }

  const completedCount = patientTasks.filter(t => t.completed).length

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-[52px] z-30 bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-3">
        <TimeFormatToggle />
        <div className="flex-1" />
        {completedCount > 0 && (
          <button onClick={() => clearCompletedTasks(patient.id)} className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 min-h-[32px]">
            <Trash2 className="w-3.5 h-3.5" /> Clear {completedCount} done
          </button>
        )}
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors min-h-[36px]">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {slots.map(slot => {
          const slotTasks = tasksByHour[slot] ?? []
          const isCurrent = slot === currentHour
          return (
            <div
              key={slot}
              ref={isCurrent ? currentHourRef : undefined}
              className={`flex gap-3 px-3 py-1.5 border-b border-slate-800/50 ${isCurrent ? 'bg-cyan-500/5' : ''}`}
            >
              <div className={`w-16 shrink-0 pt-1.5 text-right ${isCurrent ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                <span className="text-xs font-mono">{formatTime(slot, format)}</span>
                {isCurrent && <div className="w-2 h-2 rounded-full bg-red-400 ml-auto mt-0.5" />}
              </div>
              <div className="flex-1 min-w-0 py-1 space-y-1.5">
                {slotTasks.length === 0 ? (
                  <div className="h-6" />
                ) : (
                  slotTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={() => toggleComplete(task.id, patient.id)}
                      onDelete={() => deleteTask(task.id, patient.id)}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showAdd && (
        <AddTaskModal patientId={patient.id} onAdd={handleAdd} onClose={() => setShowAdd(false)} />
      )}
    </div>
  )
}
