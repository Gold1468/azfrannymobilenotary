import { create } from 'zustand'
import type { PatientSnapshot, WoundCareEntry, DrainEntry, IVEntry, CastEntry, DietEntry } from '@/models/types'
import { saveSnapshot, getSnapshotForPatient } from '@/services/storage'
import { generateId, nowISO } from '@/utils/formatters'

function createDefaultSnapshot(patientId: string): PatientSnapshot {
  return {
    id: generateId(),
    patientId,
    admissionReason: [],
    hospitalCourse: [],
    pmh: [],
    psh: [],
    vitals: {
      bp: '',
      hr: undefined,
      rr: undefined,
      spo2: undefined,
      temp: undefined,
      pain: undefined,
      trends: [],
    },
    labs: [],
    assessments: [],
    woundCare: [],
    drains: [],
    ivAccess: [],
    casts: [],
    diet: {
      type: '',
      npoStatus: false,
      npoRationale: '',
      aspirationPrecautions: false,
      restrictions: [],
      notes: '',
    },
    consults: [],
    updatedAt: nowISO(),
  }
}

interface SnapshotStore {
  snapshots: Record<string, PatientSnapshot>
  isLoading: Record<string, boolean>
  loadSnapshot: (patientId: string) => Promise<void>
  getSnapshot: (patientId: string) => PatientSnapshot
  updateField: <K extends keyof PatientSnapshot>(
    patientId: string, field: K, value: PatientSnapshot[K]
  ) => void
  save: (patientId: string) => Promise<void>
  // Wound care
  addWound: (patientId: string, wound: Omit<WoundCareEntry, 'id'>) => void
  updateWound: (patientId: string, id: string, updates: Partial<WoundCareEntry>) => void
  removeWound: (patientId: string, id: string) => void
  // Drains
  addDrain: (patientId: string, drain: Omit<DrainEntry, 'id'>) => void
  updateDrain: (patientId: string, id: string, updates: Partial<DrainEntry>) => void
  removeDrain: (patientId: string, id: string) => void
  // IV Access
  addIV: (patientId: string, iv: Omit<IVEntry, 'id'>) => void
  updateIV: (patientId: string, id: string, updates: Partial<IVEntry>) => void
  removeIV: (patientId: string, id: string) => void
  // Casts
  addCast: (patientId: string, cast: Omit<CastEntry, 'id'>) => void
  updateCast: (patientId: string, id: string, updates: Partial<CastEntry>) => void
  removeCast: (patientId: string, id: string) => void
  // Diet
  updateDiet: (patientId: string, updates: Partial<DietEntry>) => void
}

export const useSnapshotStore = create<SnapshotStore>((set, get) => ({
  snapshots: {},
  isLoading: {},

  loadSnapshot: async (patientId) => {
    set(s => ({ isLoading: { ...s.isLoading, [patientId]: true } }))
    const existing = await getSnapshotForPatient(patientId)
    const snapshot = existing ?? createDefaultSnapshot(patientId)
    set(s => ({
      snapshots: { ...s.snapshots, [patientId]: snapshot },
      isLoading: { ...s.isLoading, [patientId]: false },
    }))
  },

  getSnapshot: (patientId) =>
    get().snapshots[patientId] ?? createDefaultSnapshot(patientId),

  updateField: (patientId, field, value) => {
    set(s => {
      const snap = s.snapshots[patientId] ?? createDefaultSnapshot(patientId)
      return {
        snapshots: {
          ...s.snapshots,
          [patientId]: { ...snap, [field]: value, updatedAt: nowISO() },
        },
      }
    })
  },

  save: async (patientId) => {
    const snapshot = get().snapshots[patientId]
    if (!snapshot) return
    await saveSnapshot({ ...snapshot, updatedAt: nowISO() })
  },

  addWound: (patientId, wound) => {
    set(s => {
      const snap = s.snapshots[patientId] ?? createDefaultSnapshot(patientId)
      return {
        snapshots: {
          ...s.snapshots,
          [patientId]: {
            ...snap,
            woundCare: [...snap.woundCare, { ...wound, id: generateId() }],
            updatedAt: nowISO(),
          },
        },
      }
    })
  },

  updateWound: (patientId, id, updates) => {
    set(s => {
      const snap = s.snapshots[patientId]
      if (!snap) return s
      return {
        snapshots: {
          ...s.snapshots,
          [patientId]: {
            ...snap,
            woundCare: snap.woundCare.map(w => w.id === id ? { ...w, ...updates } : w),
            updatedAt: nowISO(),
          },
        },
      }
    })
  },

  removeWound: (patientId, id) => {
    set(s => {
      const snap = s.snapshots[patientId]
      if (!snap) return s
      return {
        snapshots: {
          ...s.snapshots,
          [patientId]: {
            ...snap,
            woundCare: snap.woundCare.filter(w => w.id !== id),
            updatedAt: nowISO(),
          },
        },
      }
    })
  },

  addDrain: (patientId, drain) => {
    set(s => {
      const snap = s.snapshots[patientId] ?? createDefaultSnapshot(patientId)
      return {
        snapshots: {
          ...s.snapshots,
          [patientId]: {
            ...snap,
            drains: [...snap.drains, { ...drain, id: generateId() }],
            updatedAt: nowISO(),
          },
        },
      }
    })
  },

  updateDrain: (patientId, id, updates) => {
    set(s => {
      const snap = s.snapshots[patientId]
      if (!snap) return s
      return {
        snapshots: {
          ...s.snapshots,
          [patientId]: {
            ...snap,
            drains: snap.drains.map(d => d.id === id ? { ...d, ...updates } : d),
            updatedAt: nowISO(),
          },
        },
      }
    })
  },

  removeDrain: (patientId, id) => {
    set(s => {
      const snap = s.snapshots[patientId]
      if (!snap) return s
      return {
        snapshots: {
          ...s.snapshots,
          [patientId]: {
            ...snap,
            drains: snap.drains.filter(d => d.id !== id),
            updatedAt: nowISO(),
          },
        },
      }
    })
  },

  addIV: (patientId, iv) => {
    set(s => {
      const snap = s.snapshots[patientId] ?? createDefaultSnapshot(patientId)
      return {
        snapshots: {
          ...s.snapshots,
          [patientId]: {
            ...snap,
            ivAccess: [...snap.ivAccess, { ...iv, id: generateId() }],
            updatedAt: nowISO(),
          },
        },
      }
    })
  },

  updateIV: (patientId, id, updates) => {
    set(s => {
      const snap = s.snapshots[patientId]
      if (!snap) return s
      return {
        snapshots: {
          ...s.snapshots,
          [patientId]: {
            ...snap,
            ivAccess: snap.ivAccess.map(iv => iv.id === id ? { ...iv, ...updates } : iv),
            updatedAt: nowISO(),
          },
        },
      }
    })
  },

  removeIV: (patientId, id) => {
    set(s => {
      const snap = s.snapshots[patientId]
      if (!snap) return s
      return {
        snapshots: {
          ...s.snapshots,
          [patientId]: {
            ...snap,
            ivAccess: snap.ivAccess.filter(iv => iv.id !== id),
            updatedAt: nowISO(),
          },
        },
      }
    })
  },

  addCast: (patientId, cast) => {
    set(s => {
      const snap = s.snapshots[patientId] ?? createDefaultSnapshot(patientId)
      return {
        snapshots: {
          ...s.snapshots,
          [patientId]: {
            ...snap,
            casts: [...snap.casts, { ...cast, id: generateId() }],
            updatedAt: nowISO(),
          },
        },
      }
    })
  },

  updateCast: (patientId, id, updates) => {
    set(s => {
      const snap = s.snapshots[patientId]
      if (!snap) return s
      return {
        snapshots: {
          ...s.snapshots,
          [patientId]: {
            ...snap,
            casts: snap.casts.map(c => c.id === id ? { ...c, ...updates } : c),
            updatedAt: nowISO(),
          },
        },
      }
    })
  },

  removeCast: (patientId, id) => {
    set(s => {
      const snap = s.snapshots[patientId]
      if (!snap) return s
      return {
        snapshots: {
          ...s.snapshots,
          [patientId]: {
            ...snap,
            casts: snap.casts.filter(c => c.id !== id),
            updatedAt: nowISO(),
          },
        },
      }
    })
  },

  updateDiet: (patientId, updates) => {
    set(s => {
      const snap = s.snapshots[patientId] ?? createDefaultSnapshot(patientId)
      return {
        snapshots: {
          ...s.snapshots,
          [patientId]: {
            ...snap,
            diet: { ...snap.diet, ...updates },
            updatedAt: nowISO(),
          },
        },
      }
    })
  },
}))
