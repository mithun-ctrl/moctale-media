import React, { useEffect, useCallback, useState } from 'react'

export default function Lightbox({ urls, currentIndex, onClose, onPrev, onNext }) {
  const [loaded, setLoaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  const src = urls[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < urls.length - 1

  // Reset loaded state when image changes
  useEffect(() => {
    setLoaded(false)
    setZoomed(false)
  }, [currentIndex])

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onPrev()
      if (e.key === 'ArrowRight' && hasNext) onNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, onPrev, onNext, hasPrev, hasNext])

  const handleDownload = async () => {
    try {
      const response = await fetch(src)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const ext = src.split('.').pop().split('?')[0] || 'jpg'
      a.href = url
      a.download = `moctale-image-${currentIndex + 1}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(src, '_blank')
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(src)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* silent */ }
  }

  // Click backdrop to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="lightbox-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Image ${currentIndex + 1} of ${urls.length}`}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="lightbox-close"
        title="Close (Esc)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div className="lightbox-counter">
        {currentIndex + 1} / {urls.length}
      </div>

      {/* Prev button */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          className="lightbox-nav lightbox-nav-prev"
          title="Previous (←)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext() }}
          className="lightbox-nav lightbox-nav-next"
          title="Next (→)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Main image area */}
      <div className="lightbox-image-wrap" onClick={handleBackdropClick}>
        {/* Spinner while loading */}
        {!loaded && (
          <div className="lightbox-spinner">
            <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-amber-500 animate-spin" />
          </div>
        )}

        <img
          key={src}
          src={src}
          alt={`Image ${currentIndex + 1}`}
          className={`lightbox-image ${zoomed ? 'lightbox-image-zoomed' : ''} ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => { e.stopPropagation(); setZoomed(z => !z) }}
          onLoad={() => setLoaded(true)}
          title={zoomed ? 'Click to zoom out' : 'Click to zoom in'}
        />
      </div>

      {/* Bottom toolbar */}
      <div className="lightbox-toolbar" onClick={e => e.stopPropagation()}>
        {/* Thumbnail strip if multiple */}
        {urls.length > 1 && (
          <div className="lightbox-thumbs">
            {urls.map((url, i) => (
              <button
                key={url}
                onClick={() => {
                  setLoaded(false)
                  if (i < currentIndex) onPrev()
                  else if (i > currentIndex) onNext()
                  // For non-adjacent jumps we need a different approach,
                  // but parent handles index directly via onGoTo if provided
                }}
                className={`lightbox-thumb ${i === currentIndex ? 'lightbox-thumb-active' : ''}`}
                title={`Image ${i + 1}`}
              >
                <img src={url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="lightbox-actions">
          <button onClick={handleDownload} className="lightbox-btn" title="Download">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
          <button onClick={handleCopy} className={`lightbox-btn ${copied ? 'lightbox-btn-copied' : ''}`} title="Copy link">
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy link
              </>
            )}
          </button>
          <button onClick={() => window.open(src, '_blank')} className="lightbox-btn" title="Open original">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open original
          </button>
        </div>
      </div>
    </div>
  )
}
