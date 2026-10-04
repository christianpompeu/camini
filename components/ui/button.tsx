import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-all duration-150 select-none tap-effect focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
        destructive: "bg-destructive text-white hover:bg-destructive/90 shadow-xs",
        outline: "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground shadow-xs",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        energy: "bg-gradient-camini text-white font-semibold shadow-md hover:brightness-105 active:brightness-95",
        camini: "bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90",
        effort: "bg-gradient-effort text-white font-semibold shadow-md hover:brightness-105",
        coral: "bg-energy-coral text-white font-semibold hover:brightness-105",
      },
      size: {
        default: "min-h-[36px] h-9 px-4 py-2 text-sm rounded-md gap-2",
        sm: "min-h-[32px] h-8 px-3 py-1 text-xs rounded-md gap-1.5",
        md: "min-h-[36px] h-9 px-4 py-2 text-sm rounded-md gap-2",
        lg: "min-h-[44px] h-11 px-6 py-2.5 text-base rounded-lg gap-2.5",
        icon: "min-h-[36px] min-w-[36px] h-9 w-9 p-2 rounded-md",
        "icon-sm": "min-h-[32px] min-w-[32px] h-8 w-8 p-1.5 rounded-md",
        "icon-lg": "min-h-[40px] min-w-[40px] h-10 w-10 p-2.5 rounded-md",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
