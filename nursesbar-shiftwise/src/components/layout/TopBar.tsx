import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Settings } from 'lucide-react'
import { usePatientStore } from '@/store/patientStore'
import { useSettingsStore } from '@/store/settingsStore'
import { formatTime, getCurrentMilTime } from '@/utils/militaryTime'

const BACK_ROUTES = ['/sbar', '/snapshot', '/timeline', '/gameplan', '/glossary', '/education', '/settings', '/med']

export function TopBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const patient = usePatientStore(s => s.getActivePatient())
  const format = useSettingsStore(s => s.settings.preferredTimeFormat)
  const [time, setTime] = useState(getCurrentMilTime())

  useEffect(() => {
    const id = setInterval(() => setTime(getCurrentMilTime()), 30_000)
    return () => clearInterval(id)
  }, [])

  const showBack = BACK_ROUTES.some(r => location.pathname.startsWith(r))

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-3 min-h-[52px]">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5 text-slate-300" />
        </button>
      )}

      <div className="flex-1 min-w-0">
        {patient ? (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-100 truncate text-sm">{patient.name}</span>
            <span className="shrink-0 text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
              Rm {patient.room}
            </span>
            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
              patient.codeStatus === 'Full Code' ? 'bg-green-500/20 text-green-400' :
              patient.codeStatus === 'DNR' || patient.codeStatus === 'DNR/DNI' ? 'bg-red-500/20 text-red-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>
              {patient.codeStatus}
            </span>
          </div>
        ) : (
          <span className="font-bold text-cyan-400 text-sm tracking-wide">NurseSBAR ShiftWise</span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-slate-400 font-mono tabular-nums">
          {formatTime(time, format)}
        </span>
        <button
          onClick={() => navigate('/settings')}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-4.5 h-4.5 text-slate-400" />
        </button>
      </div>
    </header>
  )
}
