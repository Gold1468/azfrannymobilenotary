import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface Props {
  message?: string
  dismissible?: boolean
  className?: string
}

export function DisclaimerBanner({
  message = 'Educational reference only. Always verify with current orders, facility protocols, and clinical judgment. Not a substitute for professional training or provider direction.',
  dismissible = false,
  className = '',
}: Props) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div className={`flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-amber-300 text-xs ${className}`}>
      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <p className="flex-1 leading-relaxed">{message}</p>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-0.5 rounded hover:bg-amber-500/20 transition-colors"
          aria-label="Dismiss disclaimer"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}
