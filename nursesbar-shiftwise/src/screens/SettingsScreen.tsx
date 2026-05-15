import { useState } from 'react'
import { Bell, Clock, Palette, Brain, Trash2, Plus, X, Check, ChevronRight } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { usePatientStore } from '@/store/patientStore'
import { clearAllData } from '@/services/storage'
import { scheduleChartingNotifications, cancelAllNotifications, requestPermission } from '@/services/notifications'
import { validateMilTime, formatTime } from '@/utils/militaryTime'
import type { TimeFormat } from '@/models/types'

const AI_MODELS = [
  { id: 'claude-opus-4-7', label: 'Claude Opus 4.7 (Best)' },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (Fast)' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (Lite)' },
]

export function SettingsScreen() {
  const { settings, updateSettings } = useSettingsStore()
  const { patients, deletePatient } = usePatientStore()
  const [newNotifTime, setNewNotifTime] = useState('')
  const [notifError, setNotifError] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [testSent, setTestSent] = useState(false)
  const [apiKeyVisible, setApiKeyVisible] = useState(false)

  const addNotifTime = () => {
    if (!validateMilTime(newNotifTime)) { setNotifError('Enter a valid time (e.g. 0800)'); return }
    if (settings.chartingNotificationTimes.includes(newNotifTime)) { setNotifError('Already added'); return }
    const updated = [...settings.chartingNotificationTimes, newNotifTime].sort()
    updateSettings({ chartingNotificationTimes: updated })
    scheduleChartingNotifications(updated, settings.shiftStart)
    setNewNotifTime('')
    setNotifError('')
  }

  const removeNotifTime = (t: string) => {
    const updated = settings.chartingNotificationTimes.filter(x => x !== t)
    updateSettings({ chartingNotificationTimes: updated })
    scheduleChartingNotifications(updated, settings.shiftStart)
  }

  const testNotification = async () => {
    const permission = await requestPermission()
    if (permission === 'granted' && 'Notification' in window) {
      new Notification('ShiftWise Charting Reminder', {
        body: 'Test notification — charting reminder system is working.',
        icon: '/icons/icon-192.png',
      })
      setTestSent(true)
      setTimeout(() => setTestSent(false), 3000)
    }
  }

  const handleClearAll = async () => {
    cancelAllNotifications()
    for (const p of patients) await deletePatient(p.id)
    await clearAllData()
    setShowClearConfirm(false)
  }

  const TIME_FORMATS: { value: TimeFormat; label: string; example: string }[] = [
    { value: 'military', label: 'Military', example: '0800' },
    { value: 'regular', label: 'Regular', example: '8:00 AM' },
    { value: 'dual', label: 'Dual', example: '0800 / 8:00 AM' },
  ]

  return (
    <div className="p-4 max-w-lg mx-auto space-y-5 pb-24">
      {/* Shift Defaults */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h2 className="font-semibold text-slate-100 text-sm">Shift Defaults</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Shift Start</label>
            <input
              type="text"
              value={settings.shiftStart}
              onChange={e => updateSettings({ shiftStart: e.target.value })}
              placeholder="0700"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500 min-h-[44px]"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Shift End</label>
            <input
              type="text"
              value={settings.shiftEnd}
              onChange={e => updateSettings({ shiftEnd: e.target.value })}
              placeholder="1900"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500 min-h-[44px]"
            />
          </div>
        </div>
        <p className="text-xs text-slate-500">Use military time (e.g. 0700 for 7 AM, 1900 for 7 PM)</p>
      </section>

      {/* Charting Notifications */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-4 h-4 text-amber-400" />
          <h2 className="font-semibold text-slate-100 text-sm">Charting Reminders</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {settings.chartingNotificationTimes.map(t => (
            <div key={t} className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-mono">
              {formatTime(t, settings.preferredTimeFormat)}
              <button onClick={() => removeNotifTime(t)} className="ml-0.5 text-amber-400 hover:text-red-400 transition-colors min-h-[24px] min-w-[24px] flex items-center justify-center">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {settings.chartingNotificationTimes.length === 0 && (
            <p className="text-xs text-slate-500">No reminders set</p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newNotifTime}
            onChange={e => { setNewNotifTime(e.target.value); setNotifError('') }}
            onKeyDown={e => { if (e.key === 'Enter') addNotifTime() }}
            placeholder="Add time (e.g. 0900)"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500 min-h-[44px]"
          />
          <button onClick={addNotifTime} className="w-11 bg-cyan-600 hover:bg-cyan-500 rounded-lg flex items-center justify-center transition-colors min-h-[44px]">
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
        {notifError && <p className="text-xs text-red-400">{notifError}</p>}
        <button
          onClick={testNotification}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors py-1 min-h-[40px]"
        >
          {testSent ? <Check className="w-4 h-4 text-green-400" /> : <Bell className="w-4 h-4" />}
          {testSent ? 'Test sent!' : 'Send test notification'}
        </button>
      </section>

      {/* Display */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-4 h-4 text-purple-400" />
          <h2 className="font-semibold text-slate-100 text-sm">Display</h2>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-2">Time Format</label>
          <div className="flex rounded-lg bg-slate-800 border border-slate-700 p-1 gap-1">
            {TIME_FORMATS.map(f => (
              <button
                key={f.value}
                onClick={() => updateSettings({ preferredTimeFormat: f.value })}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors min-h-[40px] ${
                  settings.preferredTimeFormat === f.value
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="block">{f.label}</span>
                <span className="block text-[10px] opacity-70 font-mono mt-0.5">{f.example}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-slate-400">Font Scale</label>
            <span className="text-xs font-mono text-slate-300">{settings.fontScale.toFixed(1)}×</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="1.5"
            step="0.1"
            value={settings.fontScale}
            onChange={e => updateSettings({ fontScale: parseFloat(e.target.value) })}
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-slate-600 mt-1">
            <span>Normal</span>
            <span>Larger</span>
          </div>
        </div>

        <label className="flex items-center gap-3 min-h-[44px]">
          <div
            onClick={() => updateSettings({ highContrast: !settings.highContrast })}
            className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${settings.highContrast ? 'bg-cyan-600' : 'bg-slate-700'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${settings.highContrast ? 'left-5' : 'left-1'}`} />
          </div>
          <span className="text-sm text-slate-300">High contrast mode</span>
        </label>
      </section>

      {/* AI Configuration */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-4 h-4 text-purple-400" />
          <h2 className="font-semibold text-slate-100 text-sm">AI Game Plan</h2>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
          <p className="text-xs text-amber-300 leading-relaxed">
            AI-generated suggestions are for clinical decision support only. Always verify with current orders, facility protocols, and clinical judgment.
          </p>
        </div>

        <label className="flex items-center gap-3 min-h-[44px]">
          <div
            onClick={() => updateSettings({ aiEnabled: !settings.aiEnabled })}
            className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${settings.aiEnabled ? 'bg-purple-600' : 'bg-slate-700'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${settings.aiEnabled ? 'left-5' : 'left-1'}`} />
          </div>
          <span className="text-sm text-slate-300">Enable AI generation</span>
        </label>

        {settings.aiEnabled && (
          <>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Model</label>
              <select
                value={settings.aiModel}
                onChange={e => updateSettings({ aiModel: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500 min-h-[44px]"
              >
                {AI_MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Anthropic API Key</label>
              <div className="flex gap-2">
                <input
                  type={apiKeyVisible ? 'text' : 'password'}
                  value={settings.aiProviderKey ?? ''}
                  onChange={e => updateSettings({ aiProviderKey: e.target.value })}
                  placeholder="sk-ant-..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-purple-500 min-h-[44px]"
                />
                <button
                  onClick={() => setApiKeyVisible(!apiKeyVisible)}
                  className="px-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors min-h-[44px]"
                >
                  {apiKeyVisible ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Stored locally only — never sent to any server other than Anthropic.</p>
            </div>
          </>
        )}

        {!settings.aiEnabled && (
          <div className="flex items-center gap-2 py-2 text-sm text-slate-400">
            <ChevronRight className="w-4 h-4 text-slate-600" />
            Without an API key, AI tab uses realistic example output
          </div>
        )}
      </section>

      {/* Data Management */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Trash2 className="w-4 h-4 text-red-400" />
          <h2 className="font-semibold text-slate-100 text-sm">Data</h2>
        </div>
        <p className="text-xs text-slate-400">
          {patients.length} patient{patients.length !== 1 ? 's' : ''} stored locally on this device.
          All data is stored in your browser — nothing is sent to any server.
        </p>
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors min-h-[44px]"
          >
            <Trash2 className="w-4 h-4" /> Clear all patient data
          </button>
        ) : (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 space-y-3">
            <p className="text-sm text-red-300">This will permanently delete all patients, SBARs, snapshots, and tasks. This cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={handleClearAll}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors min-h-[44px]"
              >
                Yes, delete everything
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-slate-800 border border-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg text-sm transition-colors min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <p className="text-center text-xs text-slate-600 pb-2">ShiftWise v1.0 — Built for nurses, by nurses</p>
    </div>
  )
}
