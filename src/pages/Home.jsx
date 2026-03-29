import React, { useState, useCallback } from 'react'
import Navbar from '../components/Navbar'
import UploadBox from '../components/UploadBox'
import ImagePreview from '../components/ImagePreview'
import ShareCard from '../components/ShareCard'
import { Loader, ProgressBar } from '../components/Loader'
import { buildShareableLink } from '../utils/encodeData'

const MAX_FILE_SIZE = 5 * 1024 * 1024

const UPLOAD_STATES = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error',
}

/**
 * Uploads a single file directly to Vercel Blob via their REST API.
 * Uses fetch instead of @vercel/blob's put() because put() is a server-side
 * function that reads process.env — it cannot access VITE_ env vars in the browser.
 *
 * Vercel Blob REST API docs:
 * https://vercel.com/docs/storage/vercel-blob/using-blob-sdk#put
 */
async function uploadToVercelBlob(file, token) {
  // Generate a unique pathname: moctale/<timestamp>-<random>.<ext>
  const ext = file.name.split('.').pop().toLowerCase() || 'jpg'
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const pathname = `moctale/${unique}.${ext}`

  const response = await fetch(
    `https://blob.vercel-storage.com/${pathname}?access=public`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': file.type || 'application/octet-stream',
        'x-api-version': '7',
      },
      body: file,
    }
  )

  if (!response.ok) {
    // Surface the Vercel API error message if available
    let detail = ''
    try {
      const json = await response.json()
      detail = json?.error || json?.message || ''
    } catch {
      detail = await response.text().catch(() => '')
    }
    throw new Error(
      `Blob API error ${response.status}${detail ? `: ${detail}` : ''}. ` +
      'Check that your VITE_BLOB_READ_WRITE_TOKEN is valid and has write access.'
    )
  }

  const data = await response.json()
  return data.url // public CDN URL returned by Vercel Blob
}

export default function Home({ darkMode, setDarkMode }) {
  const [files, setFiles] = useState([])
  const [uploadState, setUploadState] = useState(UPLOAD_STATES.IDLE)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentFileLabel, setCurrentFileLabel] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [uploadedCount, setUploadedCount] = useState(0)

  const handleFilesSelected = useCallback((newFiles) => {
    setFiles(prev => {
      const all = [...prev, ...newFiles]
      // Deduplicate by name+size
      const seen = new Set()
      return all.filter(f => {
        const key = `${f.name}-${f.size}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    })
  }, [])

  const handleFilesChange = useCallback((updatedFiles) => {
    setFiles(updatedFiles)
  }, [])

  const handleUpload = async () => {
    if (files.length === 0) return

    const validFiles = files.filter(f => f.size <= MAX_FILE_SIZE)
    if (validFiles.length === 0) {
      setErrorMsg('All selected images exceed the 5MB limit. Please choose smaller files.')
      setUploadState(UPLOAD_STATES.ERROR)
      return
    }

    // VITE_ prefix makes the variable available in the browser bundle at build time.
    // If this is undefined, the env var was not set before the last Vercel deployment.
    const token = import.meta.env.VITE_BLOB_READ_WRITE_TOKEN
    if (!token) {
      setErrorMsg(
        'VITE_BLOB_READ_WRITE_TOKEN is not set. ' +
        'Add it in your Vercel project → Settings → Environment Variables, then redeploy.'
      )
      setUploadState(UPLOAD_STATES.ERROR)
      return
    }

    setUploadState(UPLOAD_STATES.UPLOADING)
    setUploadProgress(0)
    setErrorMsg('')

    const uploadedUrls = []

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]

        setCurrentFileLabel(`Uploading ${i + 1} of ${validFiles.length}`)
        setUploadProgress((i / validFiles.length) * 100)

        // Direct REST API call — works in the browser with VITE_ env vars
        const url = await uploadToVercelBlob(file, token)
        uploadedUrls.push(url)

        setUploadProgress(((i + 1) / validFiles.length) * 100)
      }

      setUploadedCount(uploadedUrls.length)
      setShareUrl(buildShareableLink(uploadedUrls))
      setUploadState(UPLOAD_STATES.SUCCESS)
    } catch (err) {
      console.error('Upload failed:', err)
      setErrorMsg(err?.message || 'Upload failed. Please try again.')
      setUploadState(UPLOAD_STATES.ERROR)
    }
  }

  const handleReset = () => {
    setFiles([])
    setUploadState(UPLOAD_STATES.IDLE)
    setUploadProgress(0)
    setCurrentFileLabel('')
    setShareUrl('')
    setErrorMsg('')
    setUploadedCount(0)
  }

  const validFileCount = files.filter(f => f.size <= MAX_FILE_SIZE).length
  const isUploading = uploadState === UPLOAD_STATES.UPLOADING

  return (
    <div className="min-h-screen bg-obsidian-950 flex flex-col">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px]
                        rounded-full bg-amber-500/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-amber-600/5 blur-3xl" />
      </div>

      {/* Main content */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-2xl mx-auto space-y-8">

          {/* Hero text */}
          {uploadState === UPLOAD_STATES.IDLE && files.length === 0 && (
            <div className="text-center space-y-3 animate-float-up">
              <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
                <span className="text-cream">Share images</span>
                <br />
                <span className="text-gradient-amber italic">instantly.</span>
              </h1>
              <p className="text-obsidian-400 text-base max-w-md mx-auto leading-relaxed">
                Upload one or many images. Get a single link.
                No account, no watermarks, no nonsense.
              </p>
            </div>
          )}

          {/* Card */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
            {/* Subtle top border accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px
                            bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

            {/* Uploading state */}
            {isUploading && (
              <div className="space-y-6 py-4 animate-fade-in">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-obsidian-700" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-amber-500 animate-spin" />
                    <div className="absolute inset-2 rounded-full bg-obsidian-800 flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-cream font-display font-semibold">Uploading to cloud</p>
                    <p className="text-obsidian-400 text-sm font-mono mt-1">{currentFileLabel}</p>
                  </div>
                </div>
                <ProgressBar progress={uploadProgress} label="Progress" />
              </div>
            )}

            {/* Success state */}
            {uploadState === UPLOAD_STATES.SUCCESS && (
              <ShareCard
                shareUrl={shareUrl}
                imageCount={uploadedCount}
                onReset={handleReset}
              />
            )}

            {/* Error state */}
            {uploadState === UPLOAD_STATES.ERROR && (
              <div className="space-y-4 animate-scale-in">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-900/20 border border-red-800/50">
                  <div className="w-8 h-8 rounded-lg bg-red-900/50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-red-300 font-medium text-sm">Upload failed</p>
                    <p className="text-red-400/80 text-sm mt-1">{errorMsg}</p>
                  </div>
                </div>
                <button onClick={handleReset} className="btn-ghost w-full justify-center">
                  Try again
                </button>
              </div>
            )}

            {/* Idle / File selection state */}
            {!isUploading && uploadState !== UPLOAD_STATES.SUCCESS && uploadState !== UPLOAD_STATES.ERROR && (
              <>
                <UploadBox
                  onFilesSelected={handleFilesSelected}
                  disabled={isUploading}
                />

                {files.length > 0 && (
                  <>
                    <div className="border-t border-obsidian-800" />
                    <ImagePreview
                      files={files}
                      onFilesChange={handleFilesChange}
                    />
                    <div className="border-t border-obsidian-800" />

                    {/* Upload action */}
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={handleReset}
                        className="btn-ghost"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear all
                      </button>

                      <button
                        onClick={handleUpload}
                        disabled={validFileCount === 0}
                        className="btn-primary"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload {validFileCount > 0 ? validFileCount : ''}{' '}
                        {validFileCount === 1 ? 'image' : 'images'}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Footer note */}
          <p className="text-center text-obsidian-600 text-xs font-mono">
            Files are stored securely via Vercel Blob · Links never expire
          </p>
        </div>
      </main>
    </div>
  )
}
