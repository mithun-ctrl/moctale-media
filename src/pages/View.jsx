import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Lightbox from '../components/Lightbox'
import { parseUrlData } from '../utils/decodeData'

// Lazy-loaded image card with click-to-lightbox
function LazyImage({ src, index, onOpen, onLoad }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [inView, setInView] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setLoaded(true)
    onLoad?.()
  }

  const handleDownload = async (e) => {
    e.stopPropagation()
    try {
      const response = await fetch(src)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const ext = src.split('.').pop().split('?')[0] || 'jpg'
      a.href = url
      a.download = `moctale-image-${index + 1}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(src, '_blank')
    }
  }

  const handleCopyLink = async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(src)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* silent */ }
  }

  return (
    <div
      ref={ref}
      className="image-card group rounded-xl overflow-hidden bg-[var(--card-bg)] border border-[var(--card-border)]
                 hover:border-[var(--card-border-hover)] transition-all duration-300
                 hover:-translate-y-0.5 hover:shadow-xl cursor-zoom-in"
      style={{
        animation: inView ? `floatUp 0.5s ease-out ${index * 60}ms both` : 'none',
      }}
      onClick={() => loaded && onOpen(index)}
    >
      {/* Skeleton */}
      {!loaded && !error && (
        <div className="w-full animate-pulse bg-[var(--card-bg)]" style={{ minHeight: '200px' }}>
          <div className="w-full h-full" style={{ minHeight: '200px', background: 'var(--skeleton-bg)' }} />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="w-full flex flex-col items-center justify-center gap-2 py-12 px-4 text-center"
             style={{ background: 'var(--card-bg)' }}>
          <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-[var(--text-muted)] text-xs font-mono">Failed to load</p>
        </div>
      )}

      {/* Image */}
      {inView && (
        <img
          src={src}
          alt={`Image ${index + 1}`}
          className={`w-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
          style={{ maxHeight: '500px' }}
          onLoad={handleLoad}
          onError={() => setError(true)}
          loading="lazy"
        />
      )}

      {/* Hover overlay hint */}
      {loaded && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100
                        transition-opacity duration-200 pointer-events-none z-10">
          <div className="bg-black/40 backdrop-blur-sm rounded-full p-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>
      )}

      {/* Action bar */}
      {loaded && (
        <div className="card-actions" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur
                         text-white text-xs font-medium hover:bg-amber-500 hover:text-black
                         transition-all duration-200 border border-white/10 pointer-events-auto"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur
                         text-xs font-medium transition-all duration-200 border border-white/10
                         hover:bg-white/20 pointer-events-auto"
            >
              {copied ? (
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              )}
            </button>
            <span className="ml-auto text-white/40 text-xs font-mono">{index + 1}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function View({ darkMode, setDarkMode }) {
  const [urls, setUrls] = useState([])
  const [error, setError] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)
  const [loadedCount, setLoadedCount] = useState(0)

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState(null) // null = closed

  useEffect(() => {
    const { urls: parsedUrls, error: parseError } = parseUrlData()
    setUrls(parsedUrls)
    setError(parseError)
    setLoaded(true)
  }, [])

  const handleCopyPageUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    } catch { /* silent */ }
  }

  const handleImageLoad = useCallback(() => {
    setLoadedCount(c => c + 1)
  }, [])

  const openLightbox = useCallback((index) => setLightboxIndex(index), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevImage = useCallback(() => setLightboxIndex(i => Math.max(0, i - 1)), [])
  const nextImage = useCallback(() => setLightboxIndex(i => Math.min(urls.length - 1, i + 1)), [urls.length])

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-amber-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Lightbox portal */}
      {lightboxIndex !== null && (
        <Lightbox
          urls={urls}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}

      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
             style={{ background: 'var(--ambient)' }} />
      </div>

      <main className="relative flex-1 px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 animate-float-up">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                   style={{ background: 'var(--card-bg)' }}>
                <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-display font-semibold text-xl">Link not found</h2>
                <p className="text-[var(--text-muted)] text-sm mt-2 max-w-sm">{error}</p>
              </div>
              <Link to="/" className="btn-primary mt-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to upload
              </Link>
            </div>
          )}

          {/* Gallery */}
          {!error && urls.length > 0 && (
            <>
              {/* Header */}
              <div className="flex items-start justify-between gap-4 flex-wrap animate-float-up">
                <div>
                  <h1 className="font-display font-bold text-2xl sm:text-3xl">
                    Gallery
                    <span className="ml-3 text-base font-body font-normal text-[var(--text-muted)] align-middle">
                      {urls.length} {urls.length === 1 ? 'image' : 'images'}
                    </span>
                  </h1>
                  <p className="text-[var(--text-muted)] text-sm mt-1 font-mono">
                    Shared via Moctale Media · Click any image to preview
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPageUrl}
                    className={`btn-ghost text-sm ${copiedAll ? 'border-amber-500/50 !text-amber-500' : ''}`}
                  >
                    {copiedAll ? (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>Copied!</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>Share link</>
                    )}
                  </button>
                  <Link to="/" className="btn-primary text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload
                  </Link>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px" style={{ background: 'var(--divider)' }} />

              {/* Masonry grid */}
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                {urls.map((url, index) => (
                  <div key={url} className="break-inside-avoid mb-4">
                    <LazyImage
                      src={url}
                      index={index}
                      onOpen={openLightbox}
                      onLoad={handleImageLoad}
                    />
                  </div>
                ))}
              </div>

              {loadedCount < urls.length && (
                <div className="text-center py-4">
                  <p className="text-[var(--text-muted)] text-xs font-mono">
                    Loading {loadedCount}/{urls.length} images...
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="py-6 text-center">
        <Link to="/" className="text-[var(--text-muted)] text-xs font-mono hover:text-amber-500 transition-colors">
          Moctale Media · Upload your own images →
        </Link>
      </footer>
    </div>
  )
}
