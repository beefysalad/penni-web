import Link from 'next/link'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SettingsRowProps {
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

export function SettingsRow({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  href,
  onClick,
  isLast,
  destructive,
  as = 'button',
  comingSoon = false,
}: SettingsRowProps) {
  const content = (
    <div
      className={cn(
        'flex flex-row items-start gap-4 px-4 py-4 transition-colors hover:bg-white/5 md:items-center md:px-6',
        !isLast && 'border-b border-[#17211c]/60'
      )}
    >
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl',
          iconBg ? iconBg : destructive ? 'bg-[#241719]' : 'bg-[#18221d]'
        )}
      >
        <Icon
          className={cn(
            'size-5',
            iconColor ? iconColor : destructive ? 'text-[#ff8a94]' : 'text-[#8bff62]'
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('text-[15px] font-bold', destructive ? 'text-[#ff8a94]' : 'text-[#f4f7f5]')}>
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
