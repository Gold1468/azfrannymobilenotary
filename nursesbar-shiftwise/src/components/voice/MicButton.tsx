import { useState, useRef } from 'react'
import { Mic, MicOff, AlertCircle } from 'lucide-react'
import { startRecognition, isSpeechRecognitionSupported } from '@/services/voice'
import type { RecognitionSession } from '@/services/voice'

interface Props {
  onTranscript: (text: string) => void
  onError?: (e: string) => void
  continuous?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

type State = 'idle' | 'listening' | 'error'

const sizeCls = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

const iconSize = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export function MicButton({
  onTranscript,
  onError,
  continuous = true,
  className = '',
  size = 'md',
}: Props) {
  const [state, setState] = useState<State>('idle')
  const session = useRef<RecognitionSession | null>(null)

  if (!isSpeechRecognitionSupported()) return null

  const toggle = () => {
    if (state === 'listening') {
      session.current?.stop()
      session.current = null
      setState('idle')
      return
    }

    session.current = startRecognition(
      (transcript, isFinal) => {
        if (isFinal) onTranscript(transcript)
      },
      (error) => {
        setState('error')
        onError?.(error)
        setTimeout(() => setState('idle'), 2000)
      },
      () => setState('idle'),
      continuous
    )
    if (session.current) setState('listening')
  }

  const bg =
    state === 'listening' ? 'bg-red-500 hover:bg-red-600' :
    state === 'error' ? 'bg-orange-500' :
    'bg-slate-700 hover:bg-slate-600'

  const pulse = state === 'listening' ? 'animate-pulse' : ''

  return (
    <button
      onClick={toggle}
      aria-label={state === 'listening' ? 'Stop recording' : 'Start voice input'}
      aria-pressed={state === 'listening'}
      className={`${sizeCls[size]} ${bg} ${pulse} rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${className}`}
    >
      {state === 'error' ? (
        <AlertCircle className={`${iconSize[size]} text-white`} />
      ) : state === 'listening' ? (
        <MicOff className={`${iconSize[size]} text-white`} />
      ) : (
        <Mic className={`${iconSize[size]} text-slate-300`} />
      )}
    </button>
  )
}
