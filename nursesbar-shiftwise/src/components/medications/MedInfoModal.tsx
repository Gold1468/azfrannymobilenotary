import { X, ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react'
import type { MedItem } from '@/models/types'
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner'
import { VideoLink } from '@/components/common/VideoLink'

interface Props {
  item: MedItem
  onClose: () => void
}

const TYPE_COLORS: Record<string, string> = {
  med: 'bg-blue-500/20 text-blue-300',
  drip: 'bg-indigo-500/20 text-indigo-300',
  blood_product: 'bg-red-500/20 text-red-300',
  iv_fluid: 'bg-cyan-500/20 text-cyan-300',
}

export function MedInfoModal({ item, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-slate-800 max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-100 truncate">{item.name}</h2>
            {item.genericName && <p className="text-xs text-slate-400">{item.genericName}</p>}
          </div>
          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[item.type] ?? 'bg-slate-700 text-slate-300'}`}>
            {item.type.replace('_', ' ')}
          </span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors shrink-0" aria-label="Close">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <DisclaimerBanner />

          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">What It Does</h3>
            <p className="text-sm text-slate-200 leading-relaxed">{item.whatItDoes}</p>
          </section>

          {item.holdParameters && item.holdParameters.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Hold Parameters
              </h3>
              <div className="space-y-1.5">
                {item.holdParameters.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="text-sm text-red-200">{p}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Nurse Actions
            </h3>
            <ol className="space-y-2">
              {item.nurseActions.map((action, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-200">
                  <span className="shrink-0 w-5 h-5 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{action}</span>
                </li>
              ))}
            </ol>
          </section>

          {item.safetyNotes && item.safetyNotes.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Safety Notes
              </h3>
              <ul className="space-y-1.5">
                {item.safetyNotes.map((note, i) => (
                  <li key={i} className="flex gap-2 text-sm text-amber-200">
                    <span className="shrink-0 text-amber-400 mt-0.5">•</span>
                    <span className="leading-relaxed">{note}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {item.videoLinks && item.videoLinks.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Educational Videos</h3>
              <div className="space-y-2">
                {item.videoLinks.map((v, i) => (
                  <VideoLink key={i} video={v} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
