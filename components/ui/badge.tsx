import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive: "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        camini: "bg-primary text-primary-foreground font-semibold shadow-sm h-auto py-1",
        active: "bg-camini-cobalt text-white font-semibold shadow-sm h-auto py-1",
        energy: "bg-gradient-camini text-white font-semibold shadow-sm h-auto py-1",
        success: "bg-camini-aqua/15 text-camini-aqua border border-energy-green/30 font-semibold h-auto py-1",
        warning: "bg-amber-500/15 text-amber-500 border border-amber-500/30 font-semibold h-auto py-1",
      },
      interactive: {
        true: "tap-effect cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camini-cobalt",
      },
      size: {
        sm: "px-3 py-1 text-xs gap-1.5",
        md: "px-4 py-1.5 text-sm gap-2 min-h-[36px]",
        default: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps extends useRender.ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

function Badge({
  className,
  variant = "default",
  interactive,
  size,
  render,
  ...props
}: BadgeProps) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, interactive, size }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants, Badge as Chip }

