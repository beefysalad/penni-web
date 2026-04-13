'use client'

import Link from 'next/link'
import Image from 'next/image'
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
    <div className="group perspective-1000 relative mx-auto w-full max-w-[42rem]">
      <div className="bg-primary/20 group-hover:bg-primary/30 absolute inset-x-8 -top-12 h-64 rounded-full blur-[100px] transition-all" />

      <MotionDiv
        initial={{ rotateY: 5, rotateX: 5, y: 20, opacity: 0 }}
        whileInView={{ rotateY: -12, rotateX: 8, y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#080c0a]/80 p-4 shadow-[0_50px_100px_rgba(0,0,0,0.6)] backdrop-blur-3xl"
      >
        <div className="bg-background/40 rounded-[1.8rem] border border-white/5 p-6">
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
                <p className="mt-2 text-3xl font-bold tracking-tight text-white">
                  ₱142,850
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div className="bg-primary h-full w-[70%] shadow-[0_0_10px_rgba(139,255,98,0.5)]" />
                  </div>
                  <span className="text-primary text-[10px] font-bold">
                    70%
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: 'BDO Savings',
                    value: '₱45,000',
                    icon: WalletCards,
                    color: 'text-primary',
                  },
                  {
                    label: 'GCash',
                    value: '₱22,400',
                    icon: TrendingUp,
                    color: 'text-income',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`size-4 ${item.color}`} />
                      <span className="text-muted-foreground text-xs font-medium">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-foreground text-xs font-bold">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between">
                <p className="metric-label text-[10px]">Upcoming Bills</p>
                <CalendarClock className="text-warning size-4" />
              </div>

              <div className="mt-6 space-y-4">
                <div className="before:bg-warning relative pl-4 before:absolute before:top-1 before:bottom-1 before:left-0 before:w-1 before:rounded-full">
                  <p className="text-foreground text-xs font-bold">
                    Rent Payment
                  </p>
                  <p className="text-muted-foreground mt-1 text-[10px]">
                    Due in 2 days • ₱15,000
                  </p>
                </div>
                <div className="before:bg-primary relative pl-4 before:absolute before:top-1 before:bottom-1 before:left-0 before:w-1 before:rounded-full">
                  <p className="text-foreground text-xs font-bold">
                    Salary Deposit
                  </p>
                  <p className="text-muted-foreground mt-1 text-[10px]">
                    Expected in 5 days
                  </p>
                </div>
              </div>

              <div className="mt-8 flex aspect-square items-center justify-center rounded-xl border border-dashed border-white/10">
                <div className="size-6 animate-spin rounded-full border-2 border-white/10 border-t-white/30" />
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
    <main className="bg-app selection:bg-primary/30 relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="bg-primary/10 absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
        <div className="bg-income/5 absolute top-[20%] -right-[10%] h-[50%] w-[50%] rounded-full blur-[120px]" />
        <div className="landing-grid-mesh absolute inset-0 opacity-15" />
      </div>

      <header className="glass-header">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
          <Link
            href="/"
            className="flex items-center gap-4 transition-opacity hover:opacity-80"
          >
            <Image
              src="/PenniLogo.webp"
              width={56}
              height={56}
              alt="Penni Logo"
              className="rounded-[1.25rem] shadow-[0_0_20px_rgba(139,255,98,0.15)]"
            />
            <div className="hidden sm:block">
              <p className="text-foreground text-sm font-bold tracking-tight">
                Penni
              </p>
              <p className="text-muted-foreground text-[11px] leading-none font-medium tracking-widest uppercase">
                Know where your money goes
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {['Accounts', 'Recurring', 'Insights', 'Security'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="font-semibold">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button
                size="sm"
                className="neon-glow font-semibold transition-transform active:scale-95"
              >
                Join Penni
              </Button>
            </SignUpButton>
          </div>
        </div>
      </header>

      <section className="relative px-6 pt-20 pb-32 md:px-12 md:pt-32">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <FadeIn>
            <div className="border-primary/20 bg-primary/5 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(139,255,98,0.1)]">
              Dashboard
            </div>

            <h1 className="premium-header mt-6 text-white">
              Know where your{' '}
              <span className="text-primary italic">money goes.</span>
            </h1>

            <p className="text-muted-foreground mt-8 max-w-xl text-lg leading-relaxed md:text-xl">
              Penni provides a high-fidelity view of your balances, budgets, and
              upcoming bills in one calm place. No noisy dashboards—just the
              picture you need.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  className="neon-glow h-14 px-8 text-base font-bold"
                >
                  Sign up with Penni
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </SignUpButton>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  document
                    .getElementById('accounts')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="h-14 border-white/10 px-8 text-base font-bold backdrop-blur-sm transition-all hover:bg-white/5"
              >
                How it works
              </Button>
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
          <h2 className="premium-header mt-4 !text-4xl text-white md:!text-6xl">
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
                className="glass-card group hover:border-primary/20 hover:bg-primary/[0.02] overflow-hidden rounded-3xl p-8 transition-all"
              >
                <div
                  className={`flex size-14 items-center justify-center rounded-2xl ${item.surface} transition-transform group-hover:scale-110`}
                >
                  <Icon className={`size-6 ${item.tone}`} />
                </div>
                <h3 className="mt-8 text-2xl font-bold tracking-tight text-white">
                  {item.title}
                </h3>
                <p className="text-muted-foreground mt-4 leading-relaxed">
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
        <FadeIn className="glass-card relative overflow-hidden rounded-[3rem] p-12 text-center md:p-20">
          <div className="bg-primary/10 absolute -top-24 -left-24 size-64 rounded-full blur-[100px]" />
          <div className="bg-income/10 absolute -right-24 -bottom-24 size-64 rounded-full blur-[100px]" />

          <div className="relative">
            <p className="page-eyebrow">Ready for clarity?</p>
            <h2 className="premium-header mt-6 !text-4xl text-white md:!text-6xl">
              Start with one account. <br className="hidden md:block" />
              Build the rest as you go.
            </h2>
            <p className="text-muted-foreground mx-auto mt-8 max-w-2xl text-lg">
              Penni works best when it starts simple. Connect your main account,
              track your next bill, and see how much calmer your finance view
              becomes.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  className="neon-glow h-16 px-12 text-lg font-bold"
                >
                  Create your account
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-16 border-white/10 px-12 text-lg font-bold backdrop-blur-sm transition-all hover:bg-white/5"
                >
                  Sign in
                </Button>
              </SignInButton>
            </div>
          </div>
        </FadeIn>
      </section>

      <footer className="bg-background/50 border-t border-white/5 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-3">
              <Image
                src="/PenniLogo.webp"
                width={40}
                height={40}
                alt="Penni Logo"
                className="rounded-[14px]"
              />
              <p className="text-foreground text-sm font-bold">Penni</p>
            </div>

            <p className="text-muted-foreground text-xs">
              © 2026 Penni Finance. All rights reserved.
            </p>

            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Support'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-muted-foreground hover:text-primary text-xs font-medium transition-colors"
                >
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
