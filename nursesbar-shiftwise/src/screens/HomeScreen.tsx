import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, X, Heart } from 'lucide-react'
import { usePatientStore } from '@/store/patientStore'
import type { CodeStatus } from '@/models/types'

const CODE_OPTIONS: CodeStatus[] = ['Full Code', 'DNR', 'DNI', 'DNR/DNI', 'Comfort Care']

const COMMON_ALLERGIES = ['NKDA', 'Penicillin', 'Sulfa', 'Aspirin', 'NSAIDs', 'Codeine', 'Latex', 'Iodine/Contrast', 'Morphine', 'Ibuprofen']

export function HomeScreen() {
  const navigate = useNavigate()
  const { patients, setActivePatient, addPatient, deletePatient } = usePatientStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', room: '', age: '', codeStatus: 'Full Code' as CodeStatus,
    allergies: ['NKDA'] as string[], customAllergy: '',
  })

  const selectPatient = (id: string) => {
    setActivePatient(id)
    navigate('/sbar')
  }

  const submit = async () => {
    if (!form.name.trim() || !form.room.trim()) return
    const patient = await addPatient({
      name: form.name.trim(),
      room: form.room.trim(),
      age: form.age ? parseInt(form.age) : undefined,
      codeStatus: form.codeStatus,
      allergies: form.allergies.filter(a => a !== 'NKDA').length > 0
        ? form.allergies.filter(a => a !== 'NKDA')
        : [],
    })
    setActivePatient(patient.id)
    setShowForm(false)
    setForm({ name: '', room: '', age: '', codeStatus: 'Full Code', allergies: ['NKDA'], customAllergy: '' })
    navigate('/sbar')
  }

  const toggleAllergy = (a: string) => {
    if (form.allergies.includes(a)) {
      setForm(f => ({ ...f, allergies: f.allergies.filter(x => x !== a) }))
    } else {
      const next = form.allergies.filter(x => x !== 'NKDA')
      setForm(f => ({ ...f, allergies: a === 'NKDA' ? ['NKDA'] : [...next.filter(x => x !== 'NKDA'), a] }))
    }
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-slate-100">My Patients</h1>
          <p className="text-sm text-slate-400">Tap a patient to open their SBAR</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors min-h-[44px]"
        >
          <UserPlus className="w-4 h-4" /> Add Patient
        </button>
      </div>

      {patients.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="font-semibold text-slate-200 mb-2">No patients yet</h2>
          <p className="text-sm text-slate-400 max-w-xs">Add your first patient to begin building their SBAR and shift plan.</p>
        </div>
      )}

      <div className="space-y-2">
        {patients.map(p => (
          <div
            key={p.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3 hover:border-slate-700 transition-colors cursor-pointer"
            onClick={() => selectPatient(p.id)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') selectPatient(p.id) }}
            aria-label={`Open patient ${p.name}`}
          >
            <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-cyan-400">
                {p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-100">{p.name}</span>
                <span className="text-xs text-slate-400">Rm {p.room}</span>
                {p.age && <span className="text-xs text-slate-500">{p.age}yo</span>}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  p.codeStatus === 'Full Code' ? 'bg-green-500/20 text-green-400' :
                  p.codeStatus.includes('DNR') ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {p.codeStatus}
                </span>
                {p.allergies.length > 0 && (
                  <span className="text-xs text-amber-400">⚠ {p.allergies.slice(0, 2).join(', ')}</span>
                )}
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); deletePatient(p.id) }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              aria-label={`Remove ${p.name}`}
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-slate-800 p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-100">Add New Patient</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors" aria-label="Close">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Patient Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 min-h-[44px]" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Room *</label>
                <input value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} placeholder="301A" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 min-h-[44px]" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Age</label>
                <input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} placeholder="65" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 min-h-[44px]" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">Code Status</label>
              <div className="flex flex-wrap gap-2">
                {CODE_OPTIONS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, codeStatus: c }))} className={`text-sm px-3 py-1.5 rounded-full border transition-colors min-h-[36px] ${form.codeStatus === c ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300' : 'border-slate-700 bg-slate-800 text-slate-300'}`} aria-pressed={form.codeStatus === c}>{c}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">Allergies</label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ALLERGIES.map(a => (
                  <button key={a} onClick={() => toggleAllergy(a)} className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors min-h-[32px] ${form.allergies.includes(a) ? 'border-amber-500 bg-amber-500/20 text-amber-300' : 'border-slate-700 bg-slate-800 text-slate-300'}`} aria-pressed={form.allergies.includes(a)}>{a}</button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input value={form.customAllergy} onChange={e => setForm(f => ({ ...f, customAllergy: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter' && form.customAllergy.trim()) { toggleAllergy(form.customAllergy.trim()); setForm(f => ({ ...f, customAllergy: '' })) } }} placeholder="Add other allergy…" className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 min-h-[36px]" />
              </div>
            </div>

            <button onClick={submit} disabled={!form.name.trim() || !form.room.trim()} className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-semibold rounded-xl py-3 transition-colors min-h-[48px]">
              Add Patient & Open SBAR
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
