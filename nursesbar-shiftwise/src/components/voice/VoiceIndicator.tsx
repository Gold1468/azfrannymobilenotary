interface Props {
  active: boolean
}

export function VoiceIndicator({ active }: Props) {
  if (!active) return null
  return (
    <div className="flex items-center gap-0.5" aria-label="Recording active">
      {[0, 100, 200, 100, 50].map((delay, i) => (
        <span
          key={i}
          className="w-0.5 bg-red-400 rounded-full animate-bounce"
          style={{ height: `${8 + (i % 3) * 4}px`, animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  )
}
