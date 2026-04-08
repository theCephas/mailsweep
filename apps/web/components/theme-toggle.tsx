'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark'

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem('mailsweep-theme') as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    setTheme(getInitialTheme())
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem('mailsweep-theme', theme)
  }, [theme])

  const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 text-sm font-medium text-text transition-all duration-200 hover:border-primary/60 hover:text-primary',
        className
      )}
      aria-label={`Switch to ${nextTheme} theme`}
    >
      <span className="relative h-5 w-5">
        <Sun className="absolute inset-0 h-5 w-5 transition-all duration-300 dark:rotate-90 dark:scale-0" />
        <Moon className="absolute inset-0 h-5 w-5 scale-0 rotate-90 transition-all duration-300 dark:rotate-0 dark:scale-100" />
      </span>
      <span className="hidden sm:inline">{theme === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  )
}
