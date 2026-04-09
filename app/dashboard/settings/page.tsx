'use client'

import { useUser, SignOutButton } from '@clerk/nextjs'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import { 
  User, 
  Wallet, 
  Tag, 
  Globe, 
  Bell, 
  Shield, 
  MessageSquare, 
  LogOut, 
  ChevronRight,
  Bot,
  Shapes,
  HandCoins
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface SettingsRowProps {
  icon: LucideIcon
  iconBg?: string
  iconColor?: string
  label: string
  value?: string
  href?: string
  onClick?: () => void
  isLast?: boolean
  destructive?: boolean
  as?: 'button' | 'div'
  comingSoon?: boolean
}

function SettingsRow({ icon: Icon, iconBg, iconColor, label, value, href, onClick, isLast, destructive, as = 'button', comingSoon = false }: SettingsRowProps) {
  const content = (
    <div className={cn(
      "flex flex-row items-start gap-4 px-4 py-4 transition-colors hover:bg-white/5 md:items-center md:px-6",
      !isLast && "border-b border-[#17211c]/60"
    )}>
      <div className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl",
        iconBg ? iconBg : (destructive ? "bg-[#241719]" : "bg-[#18221d]")
      )}>
        <Icon className={cn("size-5", iconColor ? iconColor : (destructive ? "text-[#ff8a94]" : "text-[#8bff62]"))} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-[15px] font-bold", destructive ? "text-[#ff8a94]" : "text-[#f4f7f5]")}>
          {label}
        </p>
        {value ? (
          <p className="mt-1 pr-4 text-[13px] leading-5 font-medium text-[#7f8c86] md:hidden">
            {value}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-row items-center gap-2 self-center md:w-[250px] md:justify-end">
        {comingSoon ? (
          <span className="rounded-full bg-[#2a2518] px-3 py-1 text-[10px] font-bold uppercase tracking-[1.6px] text-[#ffc857]">
            Coming soon
          </span>
        ) : null}
        {value ? (
          <span className="hidden max-w-[220px] text-right text-[14px] leading-6 font-medium text-[#93a19a] md:inline">
            {value}
          </span>
        ) : null}
        <ChevronRight className="size-4 shrink-0 text-[#4a5650]" />
      </div>
    </div>
  )

  if (href) return <Link href={href} className="block">{content}</Link>
  const Component = as
  return <Component onClick={onClick} className="w-full text-left">{content}</Component>
}

export default function SettingsPage() {
  const { user } = useUser()

  const sections = [
    {
      title: 'Finance',
      items: [
        { iconBg: 'bg-[#1e2a22]', iconColor: 'text-[#8bff62]', icon: Shapes, label: 'Recurring items', value: 'Upcoming scheduled bills and income', href: '/dashboard/planned-items' },
        { iconBg: 'bg-[#231b33]', iconColor: 'text-[#c89dff]', icon: Tag, label: 'Categories', value: 'Organize spending and income', href: '/dashboard/categories' },
        { iconBg: 'bg-[#2a2518]', iconColor: 'text-[#ffc857]', icon: Wallet, label: 'Budgets', value: 'Set monthly limits by category', href: '/dashboard/budgets' },
        { iconBg: 'bg-[#1f2217]', iconColor: 'text-[#d9f27c]', icon: HandCoins, label: 'Debts', value: 'Track what you owe and what is owed to you', href: '/dashboard/debts' },
      ]
    },
    {
      title: 'App',
      items: [
        { iconBg: 'bg-[#16231b]', iconColor: 'text-[#8bff62]', icon: Bot, label: 'AI Chat', value: 'Natural-language command assistant', href: '#', comingSoon: true },
        { iconBg: 'bg-[#18221d]', iconColor: 'text-[#41d6b2]', icon: Globe, label: 'Preferences', value: 'Currency, appearance, and defaults', href: '#', comingSoon: true },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { iconBg: 'bg-[#18221d]', iconColor: 'text-[#41d6b2]', icon: Globe, label: 'Currency', value: 'PHP (₱)', href: '#', comingSoon: true },
        { iconBg: 'bg-[#1a262d]', iconColor: 'text-[#5aa9ff]', icon: Bell, label: 'Notifications', value: 'Enabled', href: '#', comingSoon: true },
        { iconBg: 'bg-[#1a2c1f]', iconColor: 'text-[#8bff62]', icon: Shield, label: 'Privacy & Security', href: '#', comingSoon: true },
      ]
    },
    {
      title: 'Support',
      items: [
        { iconBg: 'bg-[#1e1c2e]', iconColor: 'text-[#a084ff]', icon: MessageSquare, label: 'Send Feedback', value: 'Report a bug, suggest a feature', href: '/dashboard/feedback' },
      ]
    }
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

      <div className="flex flex-col gap-8 px-4 pt-8 md:px-6 lg:px-8 animate-in fade-in duration-500 pb-32">
        {/* Profile Card */}
        <div className="flex flex-row items-center gap-4 rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5">
          {user?.imageUrl ? (
            <div className="relative size-16 rounded-2xl overflow-hidden border-2 border-[#1b2a21]/50">
              <Image 
                src={user.imageUrl} 
                alt="Avatar" 
                fill 
                className="object-cover"
                unoptimized // Clerk images sometimes need this or proper domain config
              />
            </div>
          ) : (
            <div className="size-16 rounded-2xl bg-[#18221d] flex items-center justify-center border-2 border-[#1b2a21]/50">
              <User className="size-8 text-[#8bff62]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-[18px] font-bold text-[#f4f7f5] truncate">
              {user?.fullName || 'Penni User'}
            </h3>
            <p className="text-[13px] font-medium text-[#7f8c86] truncate">
              {user?.primaryEmailAddress?.emailAddress || 'User ID: ' + user?.id}
            </p>
          </div>
        </div>

        {/* Setting Groups */}
        {sections.map((section) => (
          <div key={section.title} className="flex flex-col gap-3">
            <h4 className="px-1 text-[11px] font-bold uppercase tracking-[2px] text-[#4a5650]">
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
          <h4 className="px-1 text-[11px] font-bold uppercase tracking-[2px] text-[#4a5650]">
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
          <p className="text-[11px] font-bold text-[#1b2a21] uppercase tracking-widest">Penni Web v1.0.0</p>
          <p className="mt-1 text-[10px] font-medium text-[#1b2a21]">Made with care for your wallet</p>
        </div>
      </div>
    </>
  )
}
