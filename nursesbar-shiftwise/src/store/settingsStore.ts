import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserSettings } from '@/models/types'

const DEFAULT_SETTINGS: UserSettings = {
  chartingNotificationTimes: ['0800', '1200', '1600', '2000', '0000', '0400'],
  preferredTimeFormat: 'military',
  shiftStart: '0700',
  shiftEnd: '1900',
  fontScale: 1.0,
  highContrast: false,
  aiProviderKey: '',
  aiModel: 'gpt-4o',
  aiEnabled: false,
  onboardingCompleted: false,
}

interface SettingsStore {
  settings: UserSettings
  updateSettings: (updates: Partial<UserSettings>) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'shiftwise-settings',
    }
  )
)
