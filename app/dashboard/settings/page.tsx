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
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface SettingsRowProps {
  icon: LucideIcon
  label: string
  value?: string
  href?: string
  onClick?: () => void
  isLast?: boolean
  destructive?: boolean
  as?: 'button' | 'div'
}

function SettingsRow({ icon: Icon, label, value, href, onClick, isLast, destructive, as = 'button' }: SettingsRowProps) {
  const content = (
    <div className={cn(
      "flex flex-row items-center gap-4 px-4 py-4 transition-colors hover:bg-white/5",
      !isLast && "border-b border-[#17211c]/60"
    )}>
      <div className={cn(
        "flex size-10 items-center justify-center rounded-xl",
        destructive ? "bg-[#241719]" : "bg-[#18221d]"
      )}>
        <Icon className={cn("size-5", destructive ? "text-[#ff8a94]" : "text-[#8bff62]")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-[15px] font-bold", destructive ? "text-[#ff8a94]" : "text-[#f4f7f5]")}>
          {label}
        </p>
      </div>
      <div className="flex flex-row items-center gap-2">
        {value && <span className="text-[13px] font-medium text-[#7f8c86]">{value}</span>}
        <ChevronRight className="size-4 text-[#4a5650]" />
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
        { icon: Wallet, label: 'Linked Accounts', value: '3 linked', href: '/dashboard/accounts' },
        { icon: Tag, label: 'Categories', value: 'Manage labels', href: '/dashboard/categories' },
        { icon: Sparkles, label: 'Planned Items', href: '/dashboard/planned-items' },
        { icon: Wallet, label: 'Budgets', value: 'Manage limits', href: '/dashboard/budgets' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Globe, label: 'Currency', value: 'PHP (₱)', href: '#' },
        { icon: Bell, label: 'Notifications', value: 'Enabled', href: '#' },
        { icon: Shield, label: 'Privacy & Security', href: '#' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: MessageSquare, label: 'Send Feedback', href: '#' },
      ]
    }
  ]

  return (
    <>
      <DashboardHeaderShell>
        <AppPageHeader
          eyebrow="Profile and settings"
          title="Settings"
          subtitle="Manage your profile, connected accounts, and preferences."
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
                  label={item.label}
                  value={item.value}
                  href={item.href}
                  isLast={index === section.items.length - 1}
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
          <p className="mt-1 text-[10px] font-medium text-[#1b2a21]">Made with love for your wallet</p>
        </div>
      </div>
    </>
  )
}
