import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar({ darkMode, setDarkMode }) {
  return (
    <header className="navbar fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3.5">
      <nav className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center
                          group-hover:scale-105 transition-transform">
            <span className="text-black font-display font-bold text-sm leading-none">M</span>
          </div>
          <span className="font-display font-semibold tracking-tight text-lg"
                style={{ color: 'var(--text)' }}>
            Moctale{' '}
            <span className="text-gradient-amber">Media</span>
          </span>
        </Link>

        {/* Dark / Light toggle */}
        <button
          onClick={() => setDarkMode?.(!darkMode)}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
          style={{
            border: '1px solid var(--card-border)',
            color: 'var(--text-muted)',
            background: 'transparent',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--text)'
            e.currentTarget.style.borderColor = 'var(--card-border-hover)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-muted)'
            e.currentTarget.style.borderColor = 'var(--card-border)'
          }}
        >
          {darkMode ? (
            /* Sun icon — shown in dark mode, click to go light */
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            /* Moon icon — shown in light mode, click to go dark */
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </nav>
    </header>
  )
}
