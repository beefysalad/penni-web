import { InternalDashboardLayout } from '@/components/layout/dashboard-layout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <InternalDashboardLayout>{children}</InternalDashboardLayout>
}
