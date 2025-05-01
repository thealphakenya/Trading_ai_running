"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-2",
        md: "h-4",
        lg: "h-6",
      },
      track: {
        default: "bg-muted",
        secondary: "bg-secondary",
        destructive: "bg-destructive/20",
      },
    },
    defaultVariants: {
      size: "md",
      track: "default",
    },
  }
)

const indicatorVariants = cva(
  "h-full transition-all duration-200 ease-out",
  {
    variants: {
      indicatorColor: {
        default: "bg-primary",
        secondary: "bg-secondary",
        destructive: "bg-destructive",
      },
    },
    defaultVariants: {
      indicatorColor: "default",
    },
  }
)

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof indicatorVariants> {
  value: number
  indicatorClassName?: string
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, size, track, indicatorColor, value, indicatorClassName, ...props }, ref) => {
  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={value}
      className={cn(progressVariants({ size, track }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(indicatorVariants({ indicatorColor }), indicatorClassName)}
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})

Progress.displayName = "Progress"

export { Progress, progressVariants }
