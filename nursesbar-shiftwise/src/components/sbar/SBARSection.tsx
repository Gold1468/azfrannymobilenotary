import { useRef, useEffect, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { MicButton } from '@/components/voice/MicButton'
import { VoiceIndicator } from '@/components/voice/VoiceIndicator'
import { TTSButton } from './TTSButton'

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  accentColor: string
  isExpanded: boolean
  onToggle: () => void
}

export function SBARSection({
  label, value, onChange, placeholder, accentColor, isExpanded, onToggle
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [recording, setRecording] = useState(false)

  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      const el = textareaRef.current
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }, [value, isExpanded])

  const handleTranscript = (transcript: string) => {
    const updated = value ? value + ' ' + transcript : transcript
    onChange(updated)
  }

  return (
    <div className={`border-l-4 ${accentColor} bg-slate-900 rounded-r-xl overflow-hidden`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors text-left min-h-[52px]"
        aria-expanded={isExpanded}
        aria-label={`${label} section`}
      >
        <div className="flex-1">
          <span className="font-bold text-slate-100 text-sm uppercase tracking-wider">{label}</span>
          {!isExpanded && value && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{value}</p>
          )}
        </div>
        {!isExpanded && value && (
          <span className="text-xs text-green-400 shrink-0">✓</span>
        )}
        {isExpanded
          ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        }
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => {
              onChange(e.target.value)
              const el = e.target
              el.style.height = 'auto'
              el.style.height = `${el.scrollHeight}px`
            }}
            placeholder={placeholder}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none min-h-[120px] leading-relaxed"
            aria-label={`${label} text`}
          />
          <div className="flex items-center gap-2">
            <MicButton
              onTranscript={handleTranscript}
              onError={() => setRecording(false)}
              continuous
              size="sm"
            />
            <VoiceIndicator active={recording} />
            <div className="flex-1" />
            <TTSButton text={value} label={`Read ${label}`} />
            <span className="text-xs text-slate-600">{value.length} chars</span>
          </div>
        </div>
      )}
    </div>
  )
}
