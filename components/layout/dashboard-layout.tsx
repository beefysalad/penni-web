'use client'

import { AppTabBar } from '@/components/navigation/app-tab-bar'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function InternalDashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen overflow-x-hidden flex-col bg-[#060b08] text-[#f4f7f5]">
      <div className="flex min-h-screen min-w-0 flex-1 overflow-x-hidden">
        <AppTabBar />

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto pb-28 lg:ml-[248px] lg:pb-10">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mx-auto flex w-full min-w-0 max-w-[1360px] flex-col"
          >
            {children}
          </motion.div>
        </main>
      </div>

      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(139,255,98,0.03),transparent_50%)]" />
    </div>
  )
}
