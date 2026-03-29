import React, { useCallback, useRef, useState } from 'react'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function UploadBox({ onFilesSelected, disabled }) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragError, setDragError] = useState(null)
  const inputRef = useRef(null)

  const validateFiles = (rawFiles) => {
    const valid = []
    const errors = []
    Array.from(rawFiles).forEach(file => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`"${file.name}" is not a supported image type.`)
      } else {
        valid.push(file)
      }
    })
    return { valid, errors }
  }

  const handleDragEnter = useCallback((e) => {
    e.preventDefault(); e.stopPropagation()
    if (!disabled) { setIsDragging(true); setDragError(null) }
  }, [disabled])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault(); e.stopPropagation()
    if (e.currentTarget === e.target) setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation() }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation()
    setIsDragging(false)
    if (disabled) return
    const { files } = e.dataTransfer
    if (!files || files.length === 0) return
    const { valid, errors } = validateFiles(files)
    if (errors.length > 0) { setDragError(errors[0]); setTimeout(() => setDragError(null), 4000) }
    if (valid.length > 0) onFilesSelected(valid)
  }, [disabled, onFilesSelected])

  const handleInputChange = useCallback((e) => {
    const { files } = e.target
    if (!files || files.length === 0) return
    const { valid, errors } = validateFiles(files)
    if (errors.length > 0) { setDragError(errors[0]); setTimeout(() => setDragError(null), 4000) }
    if (valid.length > 0) onFilesSelected(valid)
    e.target.value = ''
  }, [onFilesSelected])

  const handleClick = () => { if (!disabled) inputRef.current?.click() }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload images by dropping or clicking"
        onClick={handleClick}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ease-out
          cursor-pointer select-none overflow-hidden
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isDragging ? 'upload-zone-active' : ''}`}
        style={{
          borderColor: isDragging ? '#f59e0b' : 'var(--upload-border)',
          background: isDragging ? 'rgba(245,158,11,0.05)' : 'transparent',
        }}
      >
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-60" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, var(--upload-pattern) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />

        <div className="relative z-10 flex flex-col items-center justify-center px-8 py-14 text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300"
               style={{ background: isDragging ? 'rgba(245,158,11,0.15)' : 'var(--card-bg-solid)',
                        transform: isDragging ? 'scale(1.1)' : 'scale(1)' }}>
            {isDragging ? (
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            ) : (
              <svg className="w-8 h-8" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>

          {isDragging ? (
            <div>
              <p className="text-amber-400 font-display font-semibold text-lg tracking-tight">Drop to upload</p>
              <p className="text-amber-500/60 text-sm mt-1 font-mono">Release to add your images</p>
            </div>
          ) : (
            <div>
              <p className="font-display font-semibold text-lg tracking-tight" style={{ color: 'var(--text)' }}>
                Drag & drop images
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                or{' '}
                <span className="text-amber-500 hover:text-amber-400 transition-colors underline underline-offset-2 decoration-dotted cursor-pointer">
                  browse your files
                </span>
              </p>
              <div className="flex items-center gap-2 mt-5 justify-center flex-wrap">
                {['JPG', 'PNG', 'WEBP', 'GIF'].map(fmt => (
                  <span key={fmt} className="px-2 py-0.5 rounded text-xs font-mono tracking-wider"
                        style={{ background: 'var(--tag-bg)', color: 'var(--tag-text)' }}>
                    {fmt}
                  </span>
                ))}
                <span className="text-xs font-mono" style={{ color: 'var(--text-subtle)' }}>· max 5MB each</span>
              </div>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {dragError && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg animate-scale-in"
             style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)' }}>
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-500 text-sm">{dragError}</p>
        </div>
      )}
    </div>
  )
}
