import React from 'react'

export function Loader({ message = 'Loading...', size = 'md' }) {
  const sizes = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-2' }
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} rounded-full border-t-amber-500 animate-spin`}
           style={{ borderColor: 'var(--card-border)', borderTopColor: '#f59e0b' }} />
      {message && (
        <p className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
          {message}
        </p>
      )}
    </div>
  )
}

export function ProgressBar({ progress, label }) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="flex justify-between items-center">
          <span className="font-mono text-xs tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
          <span className="font-mono text-xs text-amber-500">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
        <div
          className="h-full progress-bar rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  )
}

export function ImageSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden animate-pulse" style={{ background: 'var(--card-bg-solid)' }}>
      <div className="w-full h-48" style={{ background: 'var(--skeleton-bg)' }} />
    </div>
  )
}

export default Loader
