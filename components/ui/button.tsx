import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-all duration-150 select-none tap-effect focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camini-cobalt focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-outline text-text-primary hover:bg-camini-cobalt/10 hover:border-camini-cobalt hover:text-camini-cobalt",
        secondary: "bg-surface-elevated text-text-primary border border-outline hover:bg-surface-elevated/90 dark:hover:bg-surface-elevated/70",
        ghost: "text-text-secondary hover:text-text-primary hover:bg-surface-elevated/60",
        link: "text-primary underline-offset-4 hover:underline",
        energy: "bg-gradient-camini text-white font-semibold shadow-md hover:brightness-105 active:brightness-95",
        camini: "bg-gradient-camini text-white font-semibold shadow-md shadow-blue-500/25 hover:brightness-105 active:brightness-95",
        effort: "bg-gradient-effort text-white font-semibold shadow-md hover:brightness-105",
        coral: "bg-energy-coral text-white font-semibold hover:brightness-105",
      },
      size: {
        default: "min-h-[40px] px-5 py-2 text-sm rounded-md gap-2",
        sm: "min-h-[36px] px-3 py-1.5 text-sm rounded-md gap-1.5",
        md: "min-h-[40px] px-5 py-2 text-sm rounded-md gap-2",
        lg: "min-h-[48px] px-6 py-2.5 text-base rounded-lg gap-2.5",
        icon: "min-h-[40px] min-w-[40px] p-2 rounded-md",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "energy",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends Omit<ButtonPrimitive.Props, "size">,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => {
    return (
      <ButtonPrimitive
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
