import { ArrowUpRight } from 'lucide-react'

type AccountDetailStatsTileProps = {
  label: string
  value: string
  hint: string
  tone?: 'default' | 'positive' | 'negative' | 'transfer'
  icon: typeof ArrowUpRight
}

export function AccountDetailStatsTile({
  label,
  value,
  hint,
  tone = 'default',
  icon: Icon,
}: AccountDetailStatsTileProps) {
  const toneClass =
    tone === 'positive'
      ? 'text-[#41d6b2]'
      : tone === 'negative'
        ? 'text-[#ff8a94]'
        : tone === 'transfer'
          ? 'text-[#ffd66b]'
          : 'text-[#f4f7f5]'
  const iconWrapClass =
    tone === 'positive'
      ? 'bg-[#16211b]'
      : tone === 'negative'
        ? 'bg-[#241719]'
        : tone === 'transfer'
          ? 'bg-[#2a2412]'
          : 'bg-[#18221d]'

  return (
    <div className="rounded-[24px] border border-[#17211c] bg-[#111916] p-4">
      <div className={`flex size-10 items-center justify-center rounded-full ${iconWrapClass}`}>
        <Icon className={`size-5 ${toneClass}`} />
      </div>
      <p className="mt-4 text-[10px] font-bold tracking-[1.8px] text-[#6d786f] uppercase">
        {label}
      </p>
      <p className={`mt-2 text-[20px] font-bold tracking-tight ${toneClass}`}>
        {value}
      </p>
      <p className="mt-1 text-[13px] font-medium text-[#7f8c86]">{hint}</p>
    </div>
  )
}
