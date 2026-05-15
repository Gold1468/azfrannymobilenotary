import type { TimeFormat } from '@/models/types'
import { useSettingsStore } from '@/store/settingsStore'

interface Props {
  value?: TimeFormat
  onChange?: (f: TimeFormat) => void
}

const OPTIONS: { value: TimeFormat; label: string }[] = [
  { value: 'military', label: '24h' },
  { value: 'regular', label: '12h' },
  { value: 'dual', label: 'Both' },
]

export function TimeFormatToggle({ value, onChange }: Props) {
  const { settings, updateSettings } = useSettingsStore()
  const current = value ?? settings.preferredTimeFormat
  const set = onChange ?? ((f: TimeFormat) => updateSettings({ preferredTimeFormat: f }))

  return (
    <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700" role="group" aria-label="Time format">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => set(opt.value)}
          aria-pressed={current === opt.value}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors min-h-[30px] ${
            current === opt.value
              ? 'bg-cyan-500 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
