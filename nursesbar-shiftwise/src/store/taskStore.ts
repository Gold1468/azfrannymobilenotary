import { create } from 'zustand'
import type { Task, PatientSnapshot, TaskCategory } from '@/models/types'
import {
  saveTask, getTasksForPatient, deleteTask as dbDeleteTask, saveTasksBulk
} from '@/services/storage'
import { generateId, nowISO } from '@/utils/formatters'
import { sortByTime } from '@/utils/militaryTime'

interface TaskStore {
  tasks: Record<string, Task[]>
  isLoading: Record<string, boolean>
  loadTasks: (patientId: string) => Promise<void>
  addTask: (task: Omit<Task, 'id'>) => Promise<Task>
  updateTask: (id: string, patientId: string, updates: Partial<Task>) => Promise<void>
  toggleComplete: (id: string, patientId: string) => Promise<void>
  deleteTask: (id: string, patientId: string) => Promise<void>
  addBulkTasks: (tasks: Omit<Task, 'id'>[]) => Promise<void>
  getTasksByHour: (patientId: string) => Map<string, Task[]>
  getTasksForPatient: (patientId: string) => Task[]
  addSnapshotDerivedTasks: (patientId: string, snapshot: PatientSnapshot, shiftStart: string) => Promise<void>
  clearCompletedTasks: (patientId: string) => Promise<void>
}

function snapshotToTasks(patientId: string, snapshot: PatientSnapshot, shiftStart: string): Task[] {
  const tasks: Task[] = []
  const hour = parseInt(shiftStart.slice(0, 2), 10)
  const fmt = (h: number) => `${String(h % 24).padStart(2, '0')}00`

  const add = (time: string, description: string, category: TaskCategory) =>
    tasks.push({
      id: generateId(),
      patientId,
      time,
      description,
      category,
      completed: false,
      completedAt: undefined,
      notes: '',
      source: 'snapshot',
      createdAt: nowISO(),
    })

  // Standard shift tasks
  add(fmt(hour), 'Initial assessment & vital signs', 'assessment')
  add(fmt(hour + 4), 'Mid-shift vital signs & assessment', 'vital')
  add(fmt(hour + 8), 'End-of-shift assessment', 'assessment')
  add(fmt(hour + 11), 'Charting & handoff prep', 'charting')

  // Wound care tasks
  for (const w of snapshot.woundCare) {
    add(fmt(hour + 2), `Wound care: ${w.location} — ${w.type}`, 'wound')
    if (w.isVAC) {
      add(fmt(hour + 2), `VAC seal check: ${w.location}`, 'wound')
      add(fmt(hour + 6), `VAC seal check (repeat): ${w.location}`, 'wound')
    }
  }

  // Drain tasks
  for (const d of snapshot.drains) {
    add(fmt(hour + 4), `${d.type.replace('_', ' ')} output measurement — ${d.location}`, 'drain')
  }

  // Cast tasks
  for (const c of snapshot.casts) {
    add(fmt(hour + 1), `Neurovascular check — ${c.location} cast`, 'cast')
    add(fmt(hour + 5), `Neurovascular check — ${c.location} cast`, 'cast')
  }

  // Diet tasks
  if (snapshot.diet.npoStatus) {
    add(fmt(hour), 'NPO reminder — oral care & patient education', 'diet')
  }

  // Admission reason driven tasks
  const admLower = snapshot.admissionReason.join(' ').toLowerCase()
  if (admLower.includes('sepsis')) {
    add(fmt(hour), 'Lactate level (if ordered)', 'lab')
    add(fmt(hour), 'Blood cultures x2 (if ordered)', 'lab')
  }
  if (admLower.includes('chf') || admLower.includes('heart failure')) {
    add(fmt(hour), 'Daily weight (same scale, same time)', 'vital')
    add(fmt(hour + 6), 'I&O reconciliation — strict I&Os', 'charting')
  }
  if (admLower.includes('heparin') || admLower.includes('anticoagul')) {
    add(fmt(hour + 6), 'aPTT draw (if on heparin drip)', 'lab')
  }

  return tasks
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: {},
  isLoading: {},

  loadTasks: async (patientId) => {
    set(s => ({ isLoading: { ...s.isLoading, [patientId]: true } }))
    const tasks = await getTasksForPatient(patientId)
    set(s => ({
      tasks: { ...s.tasks, [patientId]: sortByTime(tasks) },
      isLoading: { ...s.isLoading, [patientId]: false },
    }))
  },

  addTask: async (taskData) => {
    const task: Task = { ...taskData, id: generateId() }
    await saveTask(task)
    set(s => ({
      tasks: {
        ...s.tasks,
        [task.patientId]: sortByTime([...(s.tasks[task.patientId] ?? []), task]),
      },
    }))
    return task
  },

  updateTask: async (id, patientId, updates) => {
    const existing = get().tasks[patientId]?.find(t => t.id === id)
    if (!existing) return
    const updated: Task = { ...existing, ...updates }
    await saveTask(updated)
    set(s => ({
      tasks: {
        ...s.tasks,
        [patientId]: s.tasks[patientId]?.map(t => t.id === id ? updated : t) ?? [],
      },
    }))
  },

  toggleComplete: async (id, patientId) => {
    const task = get().tasks[patientId]?.find(t => t.id === id)
    if (!task) return
    const updated: Task = {
      ...task,
      completed: !task.completed,
      completedAt: !task.completed ? nowISO() : undefined,
    }
    await saveTask(updated)
    set(s => ({
      tasks: {
        ...s.tasks,
        [patientId]: s.tasks[patientId]?.map(t => t.id === id ? updated : t) ?? [],
      },
    }))
  },

  deleteTask: async (id, patientId) => {
    await dbDeleteTask(id)
    set(s => ({
      tasks: {
        ...s.tasks,
        [patientId]: s.tasks[patientId]?.filter(t => t.id !== id) ?? [],
      },
    }))
  },

  addBulkTasks: async (taskDataList) => {
    const tasks: Task[] = taskDataList.map(t => ({ ...t, id: generateId() }))
    await saveTasksBulk(tasks)
    const byPatient = tasks.reduce<Record<string, Task[]>>((acc, t) => {
      if (!acc[t.patientId]) acc[t.patientId] = []
      acc[t.patientId].push(t)
      return acc
    }, {})
    set(s => {
      const next = { ...s.tasks }
      for (const [pid, ts] of Object.entries(byPatient)) {
        next[pid] = sortByTime([...(next[pid] ?? []), ...ts])
      }
      return { tasks: next }
    })
  },

  getTasksByHour: (patientId) => {
    const tasks = get().tasks[patientId] ?? []
    const map = new Map<string, Task[]>()
    for (const task of tasks) {
      const hour = task.time.slice(0, 2) + '00'
      if (!map.has(hour)) map.set(hour, [])
      map.get(hour)!.push(task)
    }
    return map
  },

  getTasksForPatient: (patientId) => get().tasks[patientId] ?? [],

  addSnapshotDerivedTasks: async (patientId, snapshot, shiftStart) => {
    const existing = get().tasks[patientId] ?? []
    const snapshotTasks = snapshotToTasks(patientId, snapshot, shiftStart)
    // Only add tasks not already covered (avoid duplicates on repeated saves)
    const existingKeys = new Set(existing.filter(t => t.source === 'snapshot').map(t => t.description))
    const newTasks = snapshotTasks.filter(t => !existingKeys.has(t.description))
    if (newTasks.length === 0) return
    await saveTasksBulk(newTasks)
    set(s => ({
      tasks: {
        ...s.tasks,
        [patientId]: sortByTime([...(s.tasks[patientId] ?? []), ...newTasks]),
      },
    }))
  },

  clearCompletedTasks: async (patientId) => {
    const completed = get().tasks[patientId]?.filter(t => t.completed) ?? []
    await Promise.all(completed.map(t => dbDeleteTask(t.id)))
    set(s => ({
      tasks: {
        ...s.tasks,
        [patientId]: s.tasks[patientId]?.filter(t => !t.completed) ?? [],
      },
    }))
  },
}))
