interface Props {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }

export function LoadingSpinner({ size = 'md', label, className = '' }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <div
        className={`${sizes[size]} border-2 border-slate-600 border-t-cyan-400 rounded-full animate-spin`}
        role="status"
        aria-label={label ?? 'Loading'}
      />
      {label && <p className="text-sm text-slate-400">{label}</p>}
    </div>
  )
}
