import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const pillVariants = cva(
  'inline-flex items-center justify-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-[#17211c] bg-[#131b17] text-[#dce2de] hover:bg-[#1a2620]',
        subtle: 'border-transparent bg-[#131b17] text-[#dce2de]',
        selected: 'border-[#8bff62] bg-[#1f3526] text-[#8bff62]',
        success: 'border-transparent bg-[#8bff62] text-[#07110a]',
      },
      size: {
        sm: 'px-2.5 py-0.5 text-[11px] font-bold',
        md: 'px-3.5 py-1 text-[12px] font-bold',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
)

export interface PillProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pillVariants> {
  label: string
}

export function Pill({ label, className, variant, size, ...props }: PillProps) {
  return (
    <div className={cn(pillVariants({ variant, size }), className)} {...props}>
      {label}
    </div>
  )
}

export function Badge({ label, className, variant = 'success', size = 'sm', ...props }: PillProps) {
  return (
    <div className={cn(pillVariants({ variant, size }), className)} {...props}>
      {label}
    </div>
  )
}
