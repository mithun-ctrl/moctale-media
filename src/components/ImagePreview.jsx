import React, { useState, useRef } from 'react'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

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
      className={`
        relative group rounded-lg overflow-hidden cursor-grab active:cursor-grabbing
        border transition-all duration-200
        ${isDraggingOver
          ? 'border-amber-500 scale-105 shadow-lg shadow-amber-500/20'
          : isOversized
          ? 'border-red-500/50'
          : 'border-obsidian-700 hover:border-obsidian-500'}
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image */}
      <div className="aspect-square bg-obsidian-800 relative">
        {preview && (
          <img
            src={preview}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        )}

        {/* Oversized warning overlay */}
        {isOversized && (
          <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center">
            <div className="text-center px-2">
              <p className="text-red-300 text-xs font-mono font-semibold">TOO LARGE</p>
              <p className="text-red-400 text-xs mt-1">Max 5MB</p>
            </div>
          </div>
        )}

        {/* Drag handle indicator */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-5 h-5 rounded bg-obsidian-900/80 backdrop-blur flex items-center justify-center">
            <svg className="w-3 h-3 text-obsidian-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
            </svg>
          </div>
        </div>

        {/* Remove button */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(index) }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-obsidian-900/90 border border-obsidian-600
                     flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all
                     hover:bg-red-900 hover:border-red-700 text-obsidian-300 hover:text-red-300"
          title="Remove"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* File info */}
      <div className="px-2 py-1.5 bg-obsidian-900/60">
        <p className="text-xs text-obsidian-300 truncate font-mono leading-tight" title={file.name}>
          {file.name}
        </p>
        <p className={`text-xs mt-0.5 font-mono ${isOversized ? 'text-red-400' : 'text-obsidian-500'}`}>
          {formatFileSize(file.size)}
        </p>
      </div>

      {/* Index badge */}
      <div className="absolute bottom-8 left-2 w-5 h-5 rounded-full bg-obsidian-900/80 backdrop-blur
                      flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs font-mono text-obsidian-400">{index + 1}</span>
      </div>
    </div>
  )
}

export default function ImagePreview({ files, onFilesChange }) {
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)

  const handleRemove = (index) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  const handleDragStart = (index) => setDragIndex(index)

  const handleDragOver = (index) => setOverIndex(index)

  const handleDrop = (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null)
      setOverIndex(null)
      return
    }
    const newFiles = [...files]
    const [moved] = newFiles.splice(dragIndex, 1)
    newFiles.splice(dropIndex, 0, moved)
    onFilesChange(newFiles)
    setDragIndex(null)
    setOverIndex(null)
  }

  const oversizedCount = files.filter(f => f.size > MAX_FILE_SIZE).length

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-body font-medium text-obsidian-300">
            Selected
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-obsidian-800 text-amber-500 text-xs font-mono">
            {files.length}
          </span>
          {oversizedCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-900/50 text-red-400 text-xs font-mono">
              {oversizedCount} too large
            </span>
          )}
        </div>
        <p className="text-xs text-obsidian-500 font-mono">drag to reorder</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {files.map((file, index) => (
          <FileCard
            key={`${file.name}-${index}`}
            file={file}
            index={index}
            onRemove={handleRemove}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDraggingOver={overIndex === index && dragIndex !== index}
          />
        ))}
      </div>

      {/* Oversized warning */}
      {oversizedCount > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-900/20 border border-red-900/50">
          <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-red-300">
            {oversizedCount} image{oversizedCount > 1 ? 's' : ''} exceed{oversizedCount === 1 ? 's' : ''} the 5MB limit and will be skipped during upload.
          </p>
        </div>
      )}
    </div>
  )
}
