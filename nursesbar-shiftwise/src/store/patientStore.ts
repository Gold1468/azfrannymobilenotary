import { create } from 'zustand'
import type { Patient } from '@/models/types'
import { savePatient, getPatients, deletePatient as dbDeletePatient } from '@/services/storage'
import { generateId, nowISO } from '@/utils/formatters'

interface PatientStore {
  patients: Patient[]
  activePatientId: string | null
  isLoading: boolean
  loadPatients: () => Promise<void>
  addPatient: (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Patient>
  updatePatient: (id: string, updates: Partial<Omit<Patient, 'id'>>) => Promise<void>
  deletePatient: (id: string) => Promise<void>
  setActivePatient: (id: string | null) => void
  getActivePatient: () => Patient | undefined
}

export const usePatientStore = create<PatientStore>((set, get) => ({
  patients: [],
  activePatientId: null,
  isLoading: false,

  loadPatients: async () => {
    set({ isLoading: true })
    const patients = await getPatients()
    set({ patients, isLoading: false })
  },

  addPatient: async (data) => {
    const patient: Patient = {
      ...data,
      id: generateId(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    }
    await savePatient(patient)
    set((state) => ({ patients: [...state.patients, patient] }))
    return patient
  },

  updatePatient: async (id, updates) => {
    const updated = {
      ...get().patients.find(p => p.id === id)!,
      ...updates,
      updatedAt: nowISO(),
    }
    await savePatient(updated)
    set((state) => ({
      patients: state.patients.map(p => p.id === id ? updated : p),
    }))
  },

  deletePatient: async (id) => {
    await dbDeletePatient(id)
    set((state) => ({
      patients: state.patients.filter(p => p.id !== id),
      activePatientId: state.activePatientId === id ? null : state.activePatientId,
    }))
  },

  setActivePatient: (id) => set({ activePatientId: id }),

  getActivePatient: () => {
    const { patients, activePatientId } = get()
    return patients.find(p => p.id === activePatientId)
  },
}))
