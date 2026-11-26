import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "rb-btn relative isolate overflow-hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-300 ease-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.965] active:translate-y-0 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:scale-110",
  {
    variants: {
      variant: {
        default:
          "rb-glare bg-gradient-to-r from-[#002878] via-[#00308F] to-[#2349B6] text-primary-foreground shadow-[0_8px_22px_-8px_rgba(0,48,143,0.48)] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-8px_rgba(0,48,143,0.62)] hover:brightness-110",
        destructive:
          "rb-glare bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground shadow-[0_8px_20px_-8px_rgba(220,38,38,0.45)] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-8px_rgba(220,38,38,0.6)]",
        outline:
          "rb-glare border border-primary/20 bg-background/95 text-foreground shadow-[0_2px_10px_-4px_rgba(14,26,51,0.08)] hover:-translate-y-0.5 hover:border-primary/60 hover:bg-gradient-to-r hover:from-[#EEF4FF] hover:to-[#F7FAFF] hover:text-primary hover:shadow-[0_12px_26px_-10px_rgba(0,48,143,0.28)]",
        secondary:
          "rb-glare bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-secondary/90 hover:shadow-[0_10px_22px_-10px_rgba(0,48,143,0.25)]",
        ghost:
          "hover:-translate-y-0.5 hover:bg-primary/8 hover:text-primary",
        link:
          "text-primary underline-offset-4 hover:underline active:scale-100",
        instagram:
          "rb-glare rb-instagram-btn text-white hover:-translate-y-0.5",
        whatsapp:
          "rb-glare rb-whatsapp-btn text-white hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3.5",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
