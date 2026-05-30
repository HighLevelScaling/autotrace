import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ArrowUpRight, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-white/90",
        destructive:
          "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
        outline:
          "bg-transparent border border-white/10 text-white hover:bg-white/5 hover:border-white/20",
        secondary:
          "bg-white/5 text-white border border-white/10 hover:bg-white/10",
        ghost:
          "bg-transparent text-white/70 hover:text-white hover:bg-white/5",
        link: "text-indigo-400 underline-offset-4 hover:underline",
        pill:
          "rounded-full px-6 py-3 bg-white text-black font-semibold hover:bg-white/90",
        "pill-outline":
          "rounded-full px-6 py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
        pill: "px-6 py-3",
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
  trailingIcon?: LucideIcon
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, trailingIcon, children, ...props },
    ref
  ) => {
    const Icon = trailingIcon

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, className }),
          trailingIcon && "group",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        )}
        ref={ref}
        {...props}
      >
        {children}
        {Icon && (
          <span className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105">
            <Icon className="h-4 w-4" strokeWidth={1} />
          </span>
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

interface ButtonWithIconProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon
}

const ButtonWithIcon = React.forwardRef<
  HTMLButtonElement,
  ButtonWithIconProps
>(({ className, children, icon: Icon = ArrowUpRight, ...props }, ref) => {
  return (
    <button
      className={cn(
        "group inline-flex items-center gap-3 rounded-full px-6 py-3 bg-white text-black font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    >
      <span>{children}</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105">
        <Icon className="h-4 w-4" strokeWidth={1} />
      </span>
    </button>
  )
})
ButtonWithIcon.displayName = "ButtonWithIcon"

export { Button, ButtonWithIcon, buttonVariants }
