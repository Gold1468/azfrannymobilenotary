interface Props {
  onInsert: (text: string) => void
}

const CONDITIONS = [
  { label: 'CHF', text: 'Decompensated CHF with worsening dyspnea, peripheral edema, and decreased exercise tolerance.' },
  { label: 'Pneumonia', text: 'Pneumonia with fever, productive cough, and radiographic consolidation.' },
  { label: 'Sepsis', text: 'Sepsis with suspected source, elevated lactate, hemodynamic instability.' },
  { label: 'Post-Op', text: 'Post-operative day — recovering from surgery with active pain management and wound care.' },
  { label: 'COPD', text: 'COPD exacerbation with increased dyspnea, wheezing, and hypoxia above baseline.' },
  { label: 'DKA', text: 'Diabetic ketoacidosis with hyperglycemia, anion gap acidosis, and ketonemia.' },
  { label: 'AFib', text: 'Atrial fibrillation with rapid ventricular response requiring rate control.' },
  { label: 'Stroke', text: 'Ischemic stroke with new focal neurological deficits.' },
  { label: 'HTN Crisis', text: 'Hypertensive urgency/emergency with SBP > 180 mmHg.' },
  { label: 'UTI/Urosepsis', text: 'Urinary tract infection / urosepsis with dysuria, fever, and positive urine cultures.' },
  { label: 'GI Bleed', text: 'GI bleed with melena/hematemesis, hemodynamic monitoring, and transfusion consideration.' },
  { label: 'AKI', text: 'Acute kidney injury with rising creatinine and oliguria.' },
  { label: 'Cellulitis', text: 'Cellulitis with spreading erythema, warmth, and tenderness requiring IV antibiotics.' },
  { label: 'PE', text: 'Pulmonary embolism with acute dyspnea, tachycardia, and anticoagulation therapy.' },
]

export function QuickConditionButtons({ onInsert }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {CONDITIONS.map(c => (
        <button
          key={c.label}
          onClick={() => onInsert(c.text)}
          className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:border-cyan-600 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors min-h-[32px]"
          aria-label={`Insert ${c.label} condition text`}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
