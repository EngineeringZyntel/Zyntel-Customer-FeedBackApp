/**
 * Card Component
 * 
 * Reusable card container for content sections
 */

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  style?: React.CSSProperties
}

export function Card({ children, className, hover = false, style }: CardProps) {
  return (
    <div
      style={style}
      className={cn(
        'bg-bg-primary rounded-xl border border-border p-6',
        'shadow-sm',
        hover && 'transition-shadow hover:shadow-md cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

