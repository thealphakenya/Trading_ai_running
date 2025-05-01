"use client"

import React from "react"
import { TooltipProps } from "recharts"

type ChartContainerProps = {
  children: React.ReactNode
  config?: Record<string, { label: string; color: string }>
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ children }) => {
  return (
    <div className="w-full h-full bg-white dark:bg-black rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
      {children}
    </div>
  )
}

export const ChartTooltipContent: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-md border bg-background p-2 shadow-sm text-sm">
      <div className="font-medium text-foreground">{label}</div>
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}
