import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-1",
        md: "h-2",
        lg: "h-4",
      },
      variant: {
        default: "bg-muted",
        secondary: "bg-secondary",
        destructive: "bg-destructive/20",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

const progressIndicatorVariants = cva(
  "h-full bg-primary transition-all duration-200 ease-out",
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
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof progressIndicatorVariants> {
  value: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      size,
      variant,
      indicatorColor,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, (value / max) * 100)

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn(progressVariants({ size, variant }), className)}
        {...props}
      >
        <div
          className={cn(progressIndicatorVariants({ indicatorColor }))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }
)

Progress.displayName = "Progress"

export { Progress, progressVariants }
