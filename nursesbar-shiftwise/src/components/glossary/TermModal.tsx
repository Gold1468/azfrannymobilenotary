import { X, Copy, PlusCircle } from 'lucide-react'
import { useState } from 'react'
import type { GlossaryTerm } from '@/models/types'
import { VideoLink } from '@/components/common/VideoLink'
import { insertGlossaryTermIntoSBAR } from '@/services/education'

interface Props {
  term: GlossaryTerm
  onClose: () => void
  onInsert?: (text: string) => void
}

export function TermModal({ term, onClose, onInsert }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    const text = insertGlossaryTermIntoSBAR(term)
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const insert = () => {
    if (onInsert) onInsert(insertGlossaryTermIntoSBAR(term))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-slate-800 max-h-[88vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-100">{term.term}</h2>
              {term.abbreviation && (
                <span className="text-sm bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-mono">
                  {term.abbreviation}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 capitalize">{term.category.replace('_', ' ')}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors" aria-label="Close">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Definition</h3>
            <p className="text-sm text-slate-200 leading-relaxed">{term.definition}</p>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1.5">Nursing Implications</h3>
            <p className="text-sm text-slate-200 leading-relaxed">{term.nursingImplications}</p>
          </section>

          {term.videoLinks.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Videos</h3>
              <div className="space-y-2">
                {term.videoLinks.map((v, i) => <VideoLink key={i} video={v} />)}
              </div>
            </section>
          )}

          <div className="flex gap-2 pt-1">
            {onInsert && (
              <button
                onClick={insert}
                className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors min-h-[44px]"
              >
                <PlusCircle className="w-4 h-4" /> Insert into SBAR
              </button>
            )}
            <button
              onClick={copy}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 text-sm transition-colors min-h-[44px]"
            >
              <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
