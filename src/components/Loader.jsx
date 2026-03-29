import React from 'react'

/**
 * Full-screen or inline loading spinner with optional message.
 */
export function Loader({ message = 'Loading...', size = 'md' }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} rounded-full border-obsidian-700 border-t-amber-500 animate-spin`} />
      {message && (
        <p className="text-obsidian-400 font-mono text-xs tracking-widest uppercase">
          {message}
        </p>
      )}
    </div>
  )
}

/**
 * Upload progress bar component
 */
export function ProgressBar({ progress, label }) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="flex justify-between items-center">
          <span className="font-mono text-xs text-obsidian-400 tracking-wider">{label}</span>
          <span className="font-mono text-xs text-amber-500">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full h-1 bg-obsidian-800 rounded-full overflow-hidden">
        <div
          className="h-full progress-bar rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Skeleton shimmer for image loading
 */
export function ImageSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-obsidian-800 animate-pulse">
      <div className="w-full h-48 bg-obsidian-700" />
    </div>
  )
}

export default Loader
