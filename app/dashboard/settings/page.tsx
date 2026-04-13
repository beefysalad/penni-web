'use client'

import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import { SignOutButton, useUser } from '@clerk/nextjs'
import {
  Bell,
  Bot,
  Globe,
  HandCoins,
  LogOut,
  MessageSquare,
  Shapes,
  Shield,
  Tag,
  User,
  Wallet,
} from 'lucide-react'
import Image from 'next/image'
import { SettingsRow } from './_components/settings-row'

export default function SettingsPage() {
  const { user } = useUser()

  const sections = [
    {
      title: 'Finance',
      items: [
        {
          iconBg: 'bg-[#1e2a22]',
          iconColor: 'text-[#8bff62]',
          icon: Shapes,
          label: 'Recurring items',
          value: 'Upcoming scheduled bills and income',
          href: '/dashboard/planned-items',
        },
        {
          iconBg: 'bg-[#231b33]',
          iconColor: 'text-[#c89dff]',
          icon: Tag,
          label: 'Categories',
          value: 'Organize spending and income',
          href: '/dashboard/categories',
        },
        {
          iconBg: 'bg-[#2a2518]',
          iconColor: 'text-[#ffc857]',
          icon: Wallet,
          label: 'Budgets',
          value: 'Set monthly limits by category',
          href: '/dashboard/budgets',
        },
        {
          iconBg: 'bg-[#1f2217]',
          iconColor: 'text-[#d9f27c]',
          icon: HandCoins,
          label: 'Debts',
          value: 'Track what you owe and what is owed to you',
          href: '/dashboard/debts',
        },
      ],
    },
    {
      title: 'App',
      items: [
        {
          iconBg: 'bg-[#16231b]',
          iconColor: 'text-[#8bff62]',
          icon: Bot,
          label: 'AI Chat',
          value: 'Natural-language command assistant',
          href: '#',
          comingSoon: true,
        },
        {
          iconBg: 'bg-[#18221d]',
          iconColor: 'text-[#41d6b2]',
          icon: Globe,
          label: 'Preferences',
          value: 'Currency, appearance, and defaults',
          href: '#',
          comingSoon: true,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          iconBg: 'bg-[#18221d]',
          iconColor: 'text-[#41d6b2]',
          icon: Globe,
          label: 'Currency',
          value: 'PHP (₱)',
          href: '#',
          comingSoon: true,
        },
        {
          iconBg: 'bg-[#1a262d]',
          iconColor: 'text-[#5aa9ff]',
          icon: Bell,
          label: 'Notifications',
          value: 'Enabled',
          href: '#',
          comingSoon: true,
        },
        {
          iconBg: 'bg-[#1a2c1f]',
          iconColor: 'text-[#8bff62]',
          icon: Shield,
          label: 'Privacy & Security',
          href: '#',
          comingSoon: true,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          iconBg: 'bg-[#1e1c2e]',
          iconColor: 'text-[#a084ff]',
          icon: MessageSquare,
          label: 'Send Feedback',
          value: 'Report a bug, suggest a feature',
          href: '/dashboard/feedback',
        },
      ],
    },
  ]

  return (
    <>
      <DashboardHeaderShell>
        <AppPageHeader
          eyebrow="Your account"
          title="Profile"
          subtitle="Review your details, connected sources, and the preferences that shape Penni."
          inverted
        />
      </DashboardHeaderShell>

      <div className="animate-in fade-in flex flex-col gap-8 px-4 pt-8 pb-32 duration-500 md:px-6 lg:px-8">
        {/* Profile Card */}
        <div className="flex flex-row items-center gap-4 rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5">
          {user?.imageUrl ? (
            <div className="relative size-16 overflow-hidden rounded-2xl border-2 border-[#1b2a21]/50">
              <Image
                src={user.imageUrl}
                alt="Avatar"
                fill
                className="object-cover"
                unoptimized // Clerk images sometimes need this or proper domain config
              />
            </div>
          ) : (
            <div className="flex size-16 items-center justify-center rounded-2xl border-2 border-[#1b2a21]/50 bg-[#18221d]">
              <User className="size-8 text-[#8bff62]" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[18px] font-bold text-[#f4f7f5]">
              {user?.fullName || 'Penni User'}
            </h3>
            <p className="truncate text-[13px] font-medium text-[#7f8c86]">
              {user?.primaryEmailAddress?.emailAddress ||
                'User ID: ' + user?.id}
            </p>
          </div>
        </div>

        {/* Setting Groups */}
        {sections.map((section) => (
          <div key={section.title} className="flex flex-col gap-3">
            <h4 className="px-1 text-[11px] font-bold tracking-[2px] text-[#4a5650] uppercase">
              {section.title}
            </h4>
            <div className="overflow-hidden rounded-[24px] border border-[#17211c] bg-[#111916]">
              {section.items.map((item, index) => (
                <SettingsRow
                  key={item.label}
                  icon={item.icon}
                  iconBg={item.iconBg}
                  iconColor={item.iconColor}
                  label={item.label}
                  value={item.value}
                  href={item.href}
                  isLast={index === section.items.length - 1}
                  comingSoon={'comingSoon' in item ? item.comingSoon : false}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <div className="flex flex-col gap-3">
          <h4 className="px-1 text-[11px] font-bold tracking-[2px] text-[#4a5650] uppercase">
            Account
          </h4>
          <div className="overflow-hidden rounded-[24px] border border-[#17211c] bg-[#111916]">
            <SignOutButton>
              <div className="w-full cursor-pointer">
                <SettingsRow
                  icon={LogOut}
                  label="Sign Out"
                  isLast={true}
                  destructive={true}
                  as="div"
                />
              </div>
            </SignOutButton>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center pt-4">
          <p className="text-[11px] font-bold tracking-widest text-[#1b2a21] uppercase">
            Penni Web v1.0.0
          </p>
          <p className="mt-1 text-[10px] font-medium text-[#1b2a21]">
            Made with care for your wallet
          </p>
        </div>
      </div>
    </>
  )
}
