import { useState, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { speak, stopSpeaking, isSpeechSynthesisSupported } from '@/services/voice'

interface Props {
  text: string
  label?: string
  className?: string
}

export function TTSButton({ text, label, className = '' }: Props) {
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    return () => stopSpeaking()
  }, [])

  if (!isSpeechSynthesisSupported()) return null

  const toggle = () => {
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
    } else {
      speak(text)
      setSpeaking(true)
      // Approximate duration for auto-reset (250 wpm average)
      const words = text.split(' ').length
      const ms = (words / 250) * 60_000 + 500
      setTimeout(() => setSpeaking(false), ms)
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={speaking ? 'Stop reading' : (label ?? 'Read aloud')}
      aria-pressed={speaking}
      className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors min-h-[32px] ${
        speaking
          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
          : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
      } ${className}`}
    >
      {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      {speaking ? 'Stop' : 'Read'}
    </button>
  )
}
