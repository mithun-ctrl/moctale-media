import React, { useState } from 'react'

const MAX_FILE_SIZE = 5 * 1024 * 1024

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileCard({ file, index, onRemove, onDragStart, onDragOver, onDrop, isDraggingOver }) {
  const [preview, setPreview] = React.useState(null)

  React.useEffect(() => {
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const isOversized = file.size > MAX_FILE_SIZE

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index) }}
      onDrop={() => onDrop(index)}
      className="relative group rounded-lg overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200"
      style={{
        border: `2px solid ${isDraggingOver ? '#f59e0b' : isOversized ? 'rgba(239,68,68,0.5)' : 'var(--card-border)'}`,
        transform: isDraggingOver ? 'scale(1.04)' : 'scale(1)',
      }}
    >
      {/* Image */}
      <div className="aspect-square relative" style={{ background: 'var(--card-bg-solid)' }}>
        {preview && <img src={preview} alt={file.name} className="w-full h-full object-cover" />}
        {isOversized && (
          <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center">
            <div className="text-center px-2">
              <p className="text-red-300 text-xs font-mono font-semibold">TOO LARGE</p>
              <p className="text-red-400 text-xs mt-1">Max 5MB</p>
            </div>
          </div>
        )}
        {/* Remove button */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(index) }}
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
          style={{ background: 'var(--card-bg-solid)', border: '1px solid var(--card-border)', color: 'var(--text-muted)' }}
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="px-1.5 py-1" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <p className="text-xs font-mono truncate leading-tight" style={{ color: 'var(--text-muted)' }} title={file.name}>
          {file.name}
        </p>
        <p className={`text-xs font-mono mt-0.5 ${isOversized ? 'text-red-400' : ''}`}
           style={{ color: isOversized ? undefined : 'var(--text-subtle)' }}>
          {formatFileSize(file.size)}
        </p>
      </div>
    </div>
  )
}

export default function ImagePreview({ files, onFilesChange }) {
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)

  const handleRemove = (index) => onFilesChange(files.filter((_, i) => i !== index))

  const handleDrop = (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) { setDragIndex(null); setOverIndex(null); return }
    const newFiles = [...files]
    const [moved] = newFiles.splice(dragIndex, 1)
    newFiles.splice(dropIndex, 0, moved)
    onFilesChange(newFiles)
    setDragIndex(null); setOverIndex(null)
  }

  const oversizedCount = files.filter(f => f.size > MAX_FILE_SIZE).length

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Selected</h3>
          <span className="px-2 py-0.5 rounded-full text-amber-500 text-xs font-mono"
                style={{ background: 'var(--card-bg-solid)' }}>
            {files.length}
          </span>
          {oversizedCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-red-400 text-xs font-mono"
                  style={{ background: 'rgba(239,68,68,0.1)' }}>
              {oversizedCount} too large
            </span>
          )}
        </div>
        <p className="text-xs font-mono" style={{ color: 'var(--text-subtle)' }}>drag to reorder</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {files.map((file, index) => (
          <FileCard
            key={`${file.name}-${index}`}
            file={file} index={index}
            onRemove={handleRemove}
            onDragStart={setDragIndex}
            onDragOver={setOverIndex}
            onDrop={handleDrop}
            isDraggingOver={overIndex === index && dragIndex !== index}
          />
        ))}
      </div>

      {oversizedCount > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg"
             style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)' }}>
          <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-red-500">
            {oversizedCount} image{oversizedCount > 1 ? 's' : ''} exceed the 5MB limit and will be skipped.
          </p>
        </div>
      )}
    </div>
  )
}
