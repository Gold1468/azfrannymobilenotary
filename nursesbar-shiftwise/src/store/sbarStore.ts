import { create } from 'zustand'
import type { SBAR, GamePlan, GamePlanItem, SuggestedTask } from '@/models/types'
import { saveSBAR, getSBARForPatient } from '@/services/storage'
import { generateId, nowISO } from '@/utils/formatters'

interface SBARStore {
  sbars: Record<string, SBAR>
  gamePlans: Record<string, GamePlan>
  isLoading: Record<string, boolean>
  loadSBAR: (patientId: string) => Promise<void>
  getSBAR: (patientId: string) => SBAR | undefined
  updateSBARField: (patientId: string, field: keyof Pick<SBAR, 'situation' | 'background' | 'assessment' | 'recommendation'>, value: string) => void
  saveSBAR: (patientId: string) => Promise<void>
  initSBAR: (patientId: string) => void
  loadGamePlan: (patientId: string) => void
  getGamePlan: (patientId: string) => GamePlan | undefined
  saveGamePlan: (patientId: string, plan: GamePlan) => void
  updateGamePlanField: (patientId: string, field: keyof GamePlan, value: unknown) => void
  addGamePlanItem: (patientId: string, section: 'immediate' | 'ongoing', text: string) => void
  toggleGamePlanItem: (patientId: string, section: 'immediate' | 'ongoing', itemId: string) => void
  applyAISuggestions: (patientId: string, suggestions: SuggestedTask[]) => void
}

function createDefaultSBAR(patientId: string): SBAR {
  return {
    id: generateId(),
    patientId,
    situation: '',
    background: '',
    assessment: '',
    recommendation: '',
    version: 1,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }
}

function createDefaultGamePlan(patientId: string): GamePlan {
  return {
    id: generateId(),
    patientId,
    clinicalImpression: '',
    immediate: [],
    ongoing: [],
    monitoringRedFlags: [],
    potentialComplications: [],
    providerQuestions: [],
    suggestedTimelineTasks: [],
    isAIGenerated: false,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }
}

export const useSBARStore = create<SBARStore>((set, get) => ({
  sbars: {},
  gamePlans: {},
  isLoading: {},

  loadSBAR: async (patientId) => {
    set(state => ({ isLoading: { ...state.isLoading, [patientId]: true } }))
    const existing = await getSBARForPatient(patientId)
    const sbar = existing ?? createDefaultSBAR(patientId)
    set(state => ({
      sbars: { ...state.sbars, [patientId]: sbar },
      isLoading: { ...state.isLoading, [patientId]: false },
    }))
  },

  getSBAR: (patientId) => get().sbars[patientId],

  initSBAR: (patientId) => {
    if (get().sbars[patientId]) return
    set(state => ({
      sbars: { ...state.sbars, [patientId]: createDefaultSBAR(patientId) },
    }))
  },

  updateSBARField: (patientId, field, value) => {
    set(state => {
      const existing = state.sbars[patientId] ?? createDefaultSBAR(patientId)
      return {
        sbars: {
          ...state.sbars,
          [patientId]: { ...existing, [field]: value, updatedAt: nowISO() },
        },
      }
    })
  },

  saveSBAR: async (patientId) => {
    const sbar = get().sbars[patientId]
    if (!sbar) return
    await saveSBAR(sbar)
  },

  loadGamePlan: (patientId) => {
    if (get().gamePlans[patientId]) return
    set(state => ({
      gamePlans: { ...state.gamePlans, [patientId]: createDefaultGamePlan(patientId) },
    }))
  },

  getGamePlan: (patientId) => get().gamePlans[patientId],

  saveGamePlan: (patientId, plan) => {
    set(state => ({
      gamePlans: { ...state.gamePlans, [patientId]: { ...plan, updatedAt: nowISO() } },
    }))
  },

  updateGamePlanField: (patientId, field, value) => {
    set(state => {
      const existing = state.gamePlans[patientId] ?? createDefaultGamePlan(patientId)
      return {
        gamePlans: {
          ...state.gamePlans,
          [patientId]: { ...existing, [field]: value, updatedAt: nowISO() },
        },
      }
    })
  },

  addGamePlanItem: (patientId, section, text) => {
    const item: GamePlanItem = {
      id: generateId(),
      text,
      priority: 'medium',
      completed: false,
    }
    set(state => {
      const plan = state.gamePlans[patientId] ?? createDefaultGamePlan(patientId)
      return {
        gamePlans: {
          ...state.gamePlans,
          [patientId]: {
            ...plan,
            [section]: [...plan[section], item],
            updatedAt: nowISO(),
          },
        },
      }
    })
  },

  toggleGamePlanItem: (patientId, section, itemId) => {
    set(state => {
      const plan = state.gamePlans[patientId]
      if (!plan) return state
      return {
        gamePlans: {
          ...state.gamePlans,
          [patientId]: {
            ...plan,
            [section]: plan[section].map(item =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            ),
            updatedAt: nowISO(),
          },
        },
      }
    })
  },

  applyAISuggestions: (patientId, suggestions) => {
    set(state => {
      const plan = state.gamePlans[patientId] ?? createDefaultGamePlan(patientId)
      return {
        gamePlans: {
          ...state.gamePlans,
          [patientId]: {
            ...plan,
            suggestedTimelineTasks: suggestions,
            isAIGenerated: true,
            updatedAt: nowISO(),
          },
        },
      }
    })
  },
}))
