'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

type StarRatingProps = {
  value: number | null
  onChange: (value: number) => void
}

const labels: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent',
}

export function StarRating({ value, onChange }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const display = hovered ?? value

  return (
    <div className="mt-5">
      <div className="flex items-center gap-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChange(star)}
            className="group transition-transform duration-100 hover:scale-110 active:scale-90"
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className="size-9 transition-colors duration-150"
              style={{
                color:
                  display !== null && star <= display ? '#ffc857' : '#1f2e28',
                fill:
                  display !== null && star <= display
                    ? '#ffc857'
                    : 'transparent',
              }}
            />
          </button>
        ))}
        {display !== null ? (
          <span className="ml-2 text-[13px] font-bold text-[#ffc857]">
            {labels[display]}
          </span>
        ) : null}
      </div>
    </div>
  )
}
