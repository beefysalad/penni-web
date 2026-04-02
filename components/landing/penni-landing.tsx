'use client'

import Link from 'next/link'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  TrendingUp,
  WalletCards,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FadeIn, FadeInStagger, MotionDiv, fadeInUp } from './motion'

const featureRows = [
  {
    title: 'Accounts',
    body: 'See cash, bank balances, e-wallets, and credit cards in one place.',
    icon: WalletCards,
    tone: 'text-primary',
    surface: 'bg-primary-soft',
  },
  {
    title: 'Recurring',
    body: 'Track salary, bills, and due dates before they sneak up on you.',
    icon: CalendarClock,
    tone: 'text-income',
    surface: 'bg-income-soft',
  },
  {
    title: 'Smart insights',
    body: 'Get descriptive reads on your spending flow without noisy dashboards.',
    icon: BarChart3,
    tone: 'text-warning',
    surface: 'bg-warning-soft',
  },
]

function AppPreview() {
  return (
    <div className="group relative mx-auto w-full max-w-[42rem] perspective-1000">
      <div className="absolute inset-x-8 -top-12 h-64 rounded-full bg-primary/20 blur-[100px] transition-all group-hover:bg-primary/30" />
      
      <MotionDiv 
        initial={{ rotateY: 5, rotateX: 5, y: 20, opacity: 0 }}
        whileInView={{ rotateY: -12, rotateX: 8, y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#080c0a]/80 p-4 shadow-[0_50px_100px_rgba(0,0,0,0.6)] backdrop-blur-3xl"
      >
        <div className="rounded-[1.8rem] border border-white/5 bg-background/40 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-3 rounded-full bg-[#ff5f56]" />
              <div className="size-3 rounded-full bg-[#ffbd2e]" />
              <div className="size-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="h-6 w-32 rounded-full bg-white/5" />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                <p className="metric-label text-[10px]">Net Position</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-white">₱142,850</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full w-[70%] bg-primary shadow-[0_0_10px_rgba(139,255,98,0.5)]" />
                  </div>
                  <span className="text-[10px] font-bold text-primary">70%</span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'BDO Savings', value: '₱45,000', icon: WalletCards, color: 'text-primary' },
                  { label: 'GCash', value: '₱22,400', icon: TrendingUp, color: 'text-income' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <div className="flex items-center gap-3">
                      <item.icon className={`size-4 ${item.color}`} />
                      <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-xs font-bold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between">
                <p className="metric-label text-[10px]">Upcoming Bills</p>
                <CalendarClock className="size-4 text-warning" />
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="relative pl-4 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:rounded-full before:bg-warning">
                  <p className="text-xs font-bold text-foreground">Rent Payment</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">Due in 2 days • ₱15,000</p>
                </div>
                <div className="relative pl-4 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:rounded-full before:bg-primary">
                  <p className="text-xs font-bold text-foreground">Salary Deposit</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">Expected in 5 days</p>
                </div>
              </div>

              <div className="mt-8 aspect-square rounded-xl border border-dashed border-white/10 flex items-center justify-center">
                <div className="size-6 rounded-full border-2 border-white/10 border-t-white/30 animate-spin" />
              </div>
            </div>
          </div>
        </div>
      </MotionDiv>
    </div>
  )
}

export function PenniLanding() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-app selection:bg-primary/30">
      {/* --- Ambient Background Layers --- */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[50%] w-[50%] rounded-full bg-income/5 blur-[120px]" />
        <div className="landing-grid-mesh absolute inset-0 opacity-15" />
      </div>

      <header className="glass-header">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary-soft neon-glow">
              <span className="text-lg font-bold text-primary">P</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold tracking-tight text-foreground">Penni</p>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest leading-none">Know where your money goes</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {['Accounts', 'Recurring', 'Insights', 'Security'].map((item) => (
              <Link 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="font-semibold">Sign in</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" className="neon-glow font-semibold transition-transform active:scale-95">
                Join Penni
              </Button>
            </SignUpButton>
          </div>
        </div>
      </header>

      <section className="relative px-6 pt-20 pb-32 md:px-12 md:pt-32">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <FadeIn>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary shadow-[0_0_15px_rgba(139,255,98,0.1)]">
              Penni Overview
            </div>
            
            <h1 className="premium-header mt-6 text-white">
              Know where your <span className="text-primary italic">money goes.</span>
            </h1>
            
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Penni provides a high-fidelity view of your balances, budgets, 
              and upcoming bills in one calm place. No noisy dashboards—just the picture you need.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <SignUpButton mode="modal">
                <Button size="lg" className="h-14 px-8 text-base font-bold neon-glow">
                  Start with Penni
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </SignUpButton>
              <Button variant="outline" size="lg" className="h-14 border-white/10 px-8 text-base font-bold backdrop-blur-sm transition-all hover:bg-white/5">
                How it works
              </Button>
            </div>

            <div className="mt-12 flex items-center gap-8 border-t border-white/5 pt-10">
              <div>
                <p className="text-2xl font-bold text-white">5k+</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Users</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-white">₱2B+</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Flow Tracked</p>
              </div>
            </div>
          </FadeIn>

          <div className="relative">
            <AppPreview />
          </div>
        </div>
      </section>

      <section id="accounts" className="section-shell relative z-10">
        <FadeIn className="text-center">
          <p className="page-eyebrow">The Real Picture</p>
          <h2 className="premium-header mt-4 !text-4xl md:!text-6xl text-white">
            Honest asset tracking.
          </h2>
        </FadeIn>

        <FadeInStagger className="mt-16 grid gap-6 md:grid-cols-3">
          {featureRows.map((item) => {
            const Icon = item.icon
            return (
              <MotionDiv 
                key={item.title}
                variants={fadeInUp}
                className="glass-card group overflow-hidden rounded-3xl p-8 transition-all hover:border-primary/20 hover:bg-primary/[0.02]"
              >
                <div className={`flex size-14 items-center justify-center rounded-2xl ${item.surface} transition-transform group-hover:scale-110`}>
                  <Icon className={`size-6 ${item.tone}`} />
                </div>
                <h3 className="mt-8 text-2xl font-bold text-white tracking-tight">{item.title}</h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  {item.body}
                </p>
                <div className="mt-8 transition-transform group-hover:translate-x-1">
                  <ArrowRight className="size-5 text-white/20" />
                </div>
              </MotionDiv>
            )
          })}
        </FadeInStagger>
      </section>

      <section className="section-shell pb-32">
        <FadeIn className="glass-card relative overflow-hidden rounded-[3rem] p-12 md:p-20 text-center">
          <div className="absolute -top-24 -left-24 size-64 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 size-64 rounded-full bg-income/10 blur-[100px]" />
          
          <div className="relative">
            <p className="page-eyebrow">Ready for clarity?</p>
            <h2 className="premium-header mt-6 !text-4xl md:!text-6xl text-white">
              Start with one account. <br className="hidden md:block" />
              Build the rest as you go.
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground">
              Penni works best when it starts simple. Connect your main account, 
              track your next bill, and see how much calmer your finance view becomes.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <SignUpButton mode="modal">
                <Button size="lg" className="h-16 px-12 text-lg font-bold neon-glow">
                  Create your account
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button variant="outline" size="lg" className="h-16 border-white/10 px-12 text-lg font-bold backdrop-blur-sm transition-all hover:bg-white/5">
                  Sign in
                </Button>
              </SignInButton>
            </div>
          </div>
        </FadeIn>
      </section>

      <footer className="border-t border-white/5 bg-background/50 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary-soft">
                <span className="text-sm font-bold text-primary">P</span>
              </div>
              <p className="text-sm font-bold text-foreground">Penni</p>
            </div>
            
            <p className="text-xs text-muted-foreground">
              © 2026 Penni Finance. All rights reserved.
            </p>

            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Support'].map((item) => (
                <Link key={item} href="#" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
