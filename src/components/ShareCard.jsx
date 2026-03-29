import React, { useState } from 'react'

export default function ShareCard({ shareUrl, imageCount, onReset }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = shareUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="space-y-5 animate-float-up">
      {/* Success header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full border flex items-center justify-center mx-auto animate-scale-in"
             style={{ background: 'var(--success-bg)', borderColor: 'rgba(245,158,11,0.3)' }}>
          <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display font-semibold text-xl" style={{ color: 'var(--text)' }}>
          {imageCount === 1 ? 'Image uploaded' : `${imageCount} images uploaded`}
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {imageCount === 1
            ? 'Your image is live. Share the link below.'
            : 'All images are live. Share the link to view them all.'}
        </p>
      </div>

      {/* Link box */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--card-border)', background: 'var(--input-bg)' }}>
        <div className="flex items-stretch">
          <div className="flex-1 px-4 py-3 overflow-hidden">
            <p className="text-xs font-mono mb-1 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Shareable Link
            </p>
            <p className="text-sm font-mono truncate" style={{ color: 'var(--text)' }} title={shareUrl}>
              {shareUrl}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="px-4 flex-shrink-0 flex items-center gap-2 text-sm font-medium transition-all duration-200"
            style={{
              borderLeft: '1px solid var(--card-border)',
              color: copied ? '#f59e0b' : 'var(--text-muted)',
              background: copied ? 'var(--success-bg)' : 'transparent',
            }}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Gallery
        </a>
        <button onClick={onReset} className="btn-ghost flex-1 justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload More
        </button>
      </div>
    </div>
  )
}
