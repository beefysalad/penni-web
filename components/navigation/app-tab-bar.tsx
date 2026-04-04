'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  House,
  CreditCard,
  ReceiptText,
  BarChart3,
  UserRound,
} from 'lucide-react'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TABS = [
  { key: 'home', label: 'Home', href: '/dashboard', icon: House },
  {
    key: 'accounts',
    label: 'Accounts',
    href: '/dashboard/accounts',
    icon: CreditCard,
  },
  {
    key: 'activity',
    label: 'Activity',
    href: '/dashboard/activity',
    icon: ReceiptText,
  },
  { key: 'stats', label: 'Stats', href: '/dashboard/stats', icon: BarChart3 },
  {
    key: 'profile',
    label: 'Profile',
    href: '/dashboard/settings',
    icon: UserRound,
  },
] as const

export function AppTabBar() {
  const pathname = usePathname()
  const { user } = useUser()
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  const openUserMenu = () => {
    const trigger = userMenuRef.current?.querySelector('button')
    trigger?.click()
  }

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[248px] lg:flex-col lg:border-r lg:border-[#162019] lg:bg-[#08100c]/85 lg:px-4 lg:py-6 lg:backdrop-blur">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-[22px] px-3 py-2"
        >
          <Image
            src="/PenniLogo.webp"
            width={44}
            height={44}
            alt="Penni Logo"
            className="rounded-2xl"
          />
          <div>
            <p className="text-sm font-semibold text-[#f4f7f5]">Penni</p>
            <p className="text-xs text-[#7f8c86]">
              Track where your money goes
            </p>
          </div>
        </Link>

        <div className="mt-8 flex flex-1 flex-col gap-2">
          {TABS.map((tab) => {
            const isActive =
              tab.key === 'home'
                ? pathname === tab.href
                : pathname.startsWith(tab.href)

            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={cn(
                  'flex items-center gap-3 rounded-[18px] px-4 py-3 transition-all duration-200',
                  isActive
                    ? 'bg-[#8bff62] text-[#07110a] shadow-[0_0_18px_rgba(139,255,98,0.18)]'
                    : 'text-[#8b9490] hover:bg-[#111916] hover:text-[#f4f7f5]'
                )}
              >
                <tab.icon className="size-[18px] shrink-0" />
                <span className="text-sm font-semibold">{tab.label}</span>
              </Link>
            )
          })}
        </div>

        <div
          className="mt-auto cursor-pointer rounded-[22px] border border-[#162019] bg-[#0d1511] p-3 transition-colors hover:bg-[#111916]"
          onClick={openUserMenu}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openUserMenu()
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div ref={userMenuRef}>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'h-10 w-10',
                    userButtonPopoverCard: 'bg-[#111916] text-[#f4f7f5]',
                    userButtonPopoverActionButton: 'text-[#f4f7f5]',
                    userButtonPopoverFooter: 'hidden',
                  },
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#f4f7f5]">
                {user?.fullName || 'Penni User'}
              </p>
              <p className="truncate text-xs text-[#7f8c86]">
                {user?.primaryEmailAddress?.emailAddress || 'Manage account'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#162019] bg-[#08100c] pt-2 pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="flex flex-row items-center justify-between gap-1 px-4 pb-3">
          {TABS.map((tab) => {
            const isActive =
              tab.key === 'home'
                ? pathname === tab.href
                : pathname.startsWith(tab.href)

            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={cn(
                  'flex h-[58px] flex-1 flex-col items-center justify-center gap-1.5 rounded-[20px] transition-all duration-200',
                  isActive
                    ? 'scale-100 bg-[#8bff62] shadow-[0_0_15px_rgba(139,255,98,0.2)]'
                    : 'bg-transparent'
                )}
              >
                <tab.icon
                  className={cn(
                    'size-[18px] transition-colors',
                    isActive ? 'text-[#07110a]' : 'text-[#8b9490]'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-bold tracking-tight transition-colors',
                    isActive ? 'text-[#07110a]' : 'text-[#8b9490]'
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
