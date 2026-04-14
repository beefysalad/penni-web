'use client'

import { Suspense } from 'react'
import { ActivityPageContent } from './_components/activity-page-content'

export default function ActivityPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] bg-[#060b08]" />}>
      <ActivityPageContent />
    </Suspense>
  )
}
