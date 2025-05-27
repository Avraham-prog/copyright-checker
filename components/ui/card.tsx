import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border bg-white shadow-sm p-4",
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardContent = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("pt-2", className)}
      {...props}
    />
  )
})
CardContent.displayName = "CardContent"

export { Card, CardContent }
