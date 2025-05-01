"use client"
import { ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn("px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700", className)}
    {...props}
  />
))
Button.displayName = "Button"
