'use client'

import { Button } from '@/components/ui/button'
import { authApi } from '@/lib/api'
import { Mail, Trash2, Calendar, Zap, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleConnectGmail = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      window.location.href = authApi.getGoogleAuthUrl()
    }
  }

  return (
    <main className="min-h-screen hero-grid noise-bg relative overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-70 pointer-events-none" />

      <header className="relative z-10">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-background flex items-center justify-center shadow-primary-glow">
              <Mail size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-display font-semibold text-text">MailSweep</span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted">Inbox Intelligence</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden md:inline-flex" />
            <Button onClick={handleConnectGmail} className="px-5 text-sm">
              {isAuthenticated ? 'Go to Dashboard' : 'Connect Gmail'}
            </Button>
          </div>
        </div>
      </header>

      <section className="relative z-10 container mx-auto px-6 pt-4 pb-12 lg:pb-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <span className="badge mb-5">
              <Sparkles size={12} className="text-primary" />
              Zero chaos mode
            </span>
            <h1 className="text-3xl md:text-5xl font-display font-semibold leading-tight text-text">
              Your inbox, edited.
              <br />
              <span className="text-primary">Clean. Calm. Controlled.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted max-w-xl">
              Target senders, pick a time window, and clear the clutter in minutes. MailSweep gives you
              smart filters without the mess.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button onClick={handleConnectGmail} className="text-sm px-6">
                {isAuthenticated ? 'Go to Dashboard' : 'Start the sweep'}
                <ArrowRight size={16} />
              </Button>
              <ThemeToggle className="md:hidden" />
              <div className="flex items-center gap-2.5 text-xs text-muted">
                <ShieldCheck size={16} className="text-success" />
                OAuth only. No passwords, ever.
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-5 max-w-md">
              <div className="glass rounded-xl p-3.5">
                <p className="text-xl font-display font-semibold text-text">50x</p>
                <p className="text-xs text-muted">Faster inbox cleanup</p>
              </div>
              <div className="glass rounded-xl p-3.5">
                <p className="text-xl font-display font-semibold text-text">100%</p>
                <p className="text-xs text-muted">You stay in control</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-8 -left-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-10 right-2 h-36 w-36 rounded-full bg-accent/30 blur-3xl" />
            <div className="glass rounded-2xl p-5 border border-border/60 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted">Sweep Preview</p>
                  <h3 className="text-base font-display font-semibold text-text">Newsletter purge</h3>
                </div>
                <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success">Ready</span>
              </div>
              <div className="mt-5 space-y-2.5">
                {[
                  { label: 'Sender', value: 'news@stores.com' },
                  { label: 'Date range', value: 'Jan 2022 — Apr 2026' },
                  { label: 'Matches', value: '1,284 emails' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-xl bg-background/60 px-3.5 py-2.5">
                    <span className="text-xs text-muted">{row.label}</span>
                    <span className="text-xs font-medium text-text">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-background/80 px-3.5 py-3">
                <div>
                  <p className="text-xs text-muted">Action</p>
                  <p className="text-sm font-medium text-text">Move to trash</p>
                </div>
                <Button className="px-3.5 py-1.5 text-xs">Run sweep</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 container mx-auto px-6 pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: <Mail size={18} className="text-primary" />,
              title: 'Precision search',
              copy: 'Filter by sender, domain, or time window in seconds.',
            },
            {
              icon: <Trash2 size={18} className="text-primary" />,
              title: 'Safe cleanup',
              copy: 'Trash first or delete forever. Every action is deliberate.',
            },
            {
              icon: <Zap size={18} className="text-primary" />,
              title: 'Speed built in',
              copy: 'Bulk actions that stay fast even on huge inboxes.',
            },
          ].map((card) => (
            <div key={card.title} className="card">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                {card.icon}
              </div>
              <h3 className="text-base font-display font-semibold text-text">{card.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{card.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 container mx-auto px-6 pb-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] items-start">
          <div className="sticky top-6">
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-text">
              A smarter cleanup flow.
            </h2>
            <p className="mt-3 text-base text-muted">
              Every step keeps you in charge. Preview, act, and breathe easier knowing you can undo when
              needed.
            </p>
            <div className="mt-5 flex items-center gap-2.5 text-xs text-muted">
              <ShieldCheck size={16} className="text-success" />
              Permissions are minimal and transparent.
            </div>
          </div>
          <div className="space-y-5">
            {[
              {
                title: 'Connect once',
                copy: 'Secure OAuth keeps your credentials private. We never see your password.',
              },
              {
                title: 'Craft the sweep',
                copy: 'Choose a sender, pick the date range, preview what will go.',
              },
              {
                title: 'Decide the outcome',
                copy: 'Trash for review or delete forever when you are sure.',
              },
            ].map((step, index) => (
              <div key={step.title} className="glass rounded-2xl p-5">
                <div className="flex items-start gap-3.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-background font-display font-semibold text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-display font-semibold text-text">{step.title}</h3>
                    <p className="mt-1.5 text-sm text-muted">{step.copy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 container mx-auto px-6 pb-20">
        <div className="glass rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-text">
              Ready for a calmer inbox?
            </h2>
            <p className="mt-2.5 text-muted text-base">
              Run your first sweep in under 60 seconds. Clean feels good.
            </p>
          </div>
          <Button onClick={handleConnectGmail} className="text-sm px-6">
            {isAuthenticated ? 'Go to Dashboard' : 'Connect Gmail'}
          </Button>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/60">
        <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted">© 2026 MailSweep. Built for clean minds.</p>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted">
            <span>Privacy-first</span>
            <span>Gmail-only</span>
            <span>Designed in Lagos</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
