import React from "react"
import { cn } from "@/lib/utils"

export const Alert = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("border-l-4 border-yellow-500 bg-yellow-100 p-4", className)} {...props} />
)

export const AlertDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-yellow-700", className)} {...props} />
)
