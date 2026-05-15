import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { SearchInput } from '@/components/common/SearchInput'
import { TermModal } from '@/components/glossary/TermModal'
import { searchGlossary, getGlossaryCategories } from '@/services/education'
import type { GlossaryTerm } from '@/models/types'

const CATEGORY_LABELS: Record<string, string> = {
  vitals: 'Vitals', neuro: 'Neuro', cardiac: 'Cardiac', respiratory: 'Respiratory',
  gi_gu: 'GI/GU', labs: 'Labs', meds: 'Meds', abbreviations: 'Abbreviations',
  wound: 'Wound', drain: 'Drain', cast: 'Cast', diet: 'Diet',
  blood_products: 'Blood Products', procedures: 'Procedures', assessments: 'Assessment',
  disease: 'Disease', general: 'General',
}

export function GlossaryScreen() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('')
  const [selected, setSelected] = useState<GlossaryTerm | null>(null)

  const categories = getGlossaryCategories()
  let results = searchGlossary(query)
  if (category) results = results.filter(t => t.category === category)

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-[52px] z-30 bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-2">
        <SearchInput value={query} onChange={setQuery} placeholder="Search glossary…" autoFocus={false} />
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setCategory('')} className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors min-h-[32px] ${!category ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300' : 'border-slate-700 bg-slate-800 text-slate-400'}`}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat === category ? '' : cat)} className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors min-h-[32px] ${category === cat ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300' : 'border-slate-700 bg-slate-800 text-slate-400'}`}>
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {results.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-700 mb-3" />
            <p className="text-sm text-slate-400">No results found for "{query}"</p>
          </div>
        )}
        {results.map(term => (
          <button
            key={term.id}
            onClick={() => setSelected(term)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-left hover:border-slate-700 transition-colors"
            aria-label={`View ${term.term}`}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-slate-100 text-sm">{term.term}</span>
              {term.abbreviation && (
                <span className="text-xs bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full font-mono">
                  {term.abbreviation}
                </span>
              )}
              <span className="ml-auto text-xs text-slate-600 capitalize shrink-0">
                {CATEGORY_LABELS[term.category] ?? term.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{term.definition}</p>
          </button>
        ))}
      </div>

      {selected && (
        <TermModal
          term={selected}
          onClose={() => setSelected(null)}
          onInsert={text => { navigator.clipboard?.writeText(text); setSelected(null) }}
        />
      )}
    </div>
  )
}
