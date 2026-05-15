export function isSpeechRecognitionSupported(): boolean {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
}

export function isSpeechSynthesisSupported(): boolean {
  return 'speechSynthesis' in window
}

export interface RecognitionSession {
  stop: () => void
  abort: () => void
}

export function startRecognition(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  onEnd: () => void,
  continuous = true
): RecognitionSession | null {
  if (!isSpeechRecognitionSupported()) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  const recognition = new SR()
  recognition.lang = 'en-US'
  recognition.continuous = continuous
  recognition.interimResults = true
  recognition.maxAlternatives = 1

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    let interim = ''
    let final = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        final += transcript
      } else {
        interim += transcript
      }
    }
    if (final) onResult(final, true)
    else if (interim) onResult(interim, false)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onerror = (event: any) => {
    onError(event.error)
  }

  recognition.onend = () => {
    onEnd()
  }

  recognition.start()

  return {
    stop: () => recognition.stop(),
    abort: () => recognition.abort(),
  }
}

let currentUtterance: SpeechSynthesisUtterance | null = null

export function speak(
  text: string,
  rate = 0.95,
  pitch = 1.0
): void {
  if (!isSpeechSynthesisSupported()) return
  stopSpeaking()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = rate
  utterance.pitch = pitch
  utterance.lang = 'en-US'

  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(
    v => v.lang.startsWith('en-US') && v.name.toLowerCase().includes('female')
  ) ?? voices.find(v => v.lang.startsWith('en'))
  if (preferred) utterance.voice = preferred

  currentUtterance = utterance
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking(): void {
  if (!isSpeechSynthesisSupported()) return
  window.speechSynthesis.cancel()
  currentUtterance = null
}

export function isSpeaking(): boolean {
  if (!isSpeechSynthesisSupported()) return false
  return window.speechSynthesis.speaking
}
