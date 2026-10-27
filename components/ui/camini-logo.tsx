import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type CaminiLogoVariant =
  | "icon"          // Apenas o ícone colorido oficial (logo_icon_color.png)
  | "full"          // Logo completa com ajuste automático claro/escuro
  | "color"         // Logo completa colorida (logo_color.png)
  | "black"         // Logo completa preta monocromática (logo_black_trimmed.png)
  | "white"         // Logo completa branca monocromática (logo_trimmed.png)
  | "symbol-text";  // Ícone colorido + tipografia 'Camini' com suporte a subtitle

export interface CaminiLogoProps {
  variant?: CaminiLogoVariant;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  href?: string;
  subtitle?: string;
  titleClassName?: string;
}

const ICON_SIZES = {
  xs: { width: 20, height: 20, className: "size-5" },
  sm: { width: 24, height: 24, className: "size-6" },
  md: { width: 32, height: 32, className: "size-8" },
  lg: { width: 40, height: 40, className: "size-10" },
  xl: { width: 48, height: 48, className: "size-12" },
} as const;

const LOGO_HEIGHTS = {
  xs: { height: 18, width: 62, className: "h-4.5 w-auto" },
  sm: { height: 22, width: 76, className: "h-5.5 w-auto" },
  md: { height: 28, width: 97, className: "h-7 w-auto" },
  lg: { height: 36, width: 125, className: "h-9 w-auto" },
  xl: { height: 46, width: 160, className: "h-11.5 w-auto" },
} as const;

export function CaminiLogo({
  variant = "full",
  size = "md",
  className,
  imageClassName,
  priority = false,
  href,
  subtitle,
  titleClassName,
}: CaminiLogoProps) {
  const iconConfig = ICON_SIZES[size];
  const logoConfig = LOGO_HEIGHTS[size];

  let content: React.ReactNode = null;

  if (variant === "icon") {
    content = (
      <Image
        src="/logos/current/logo_icon_color.png"
        alt="Camini"
        width={iconConfig.width * 2}
        height={iconConfig.height * 2}
        priority={priority}
        className={cn(
          iconConfig.className,
          "object-contain select-none shrink-0",
          imageClassName
        )}
      />
    );
  } else if (variant === "color") {
    content = (
      <Image
        src="/logos/current/logo_color.png"
        alt="Camini"
        width={logoConfig.width * 2}
        height={logoConfig.height * 2}
        priority={priority}
        className={cn(
          logoConfig.className,
          "object-contain select-none shrink-0",
          imageClassName
        )}
      />
    );
  } else if (variant === "black") {
    content = (
      <Image
        src="/logos/current/logo_black_trimmed.png"
        alt="Camini"
        width={logoConfig.width * 2}
        height={logoConfig.height * 2}
        priority={priority}
        className={cn(
          logoConfig.className,
          "object-contain select-none shrink-0",
          imageClassName
        )}
      />
    );
  } else if (variant === "white") {
    content = (
      <Image
        src="/logos/current/logo_trimmed.png"
        alt="Camini"
        width={logoConfig.width * 2}
        height={logoConfig.height * 2}
        priority={priority}
        className={cn(
          logoConfig.className,
          "object-contain select-none shrink-0",
          imageClassName
        )}
      />
    );
  } else if (variant === "symbol-text") {
    content = (
      <div className={cn("inline-flex items-center gap-2.5", className)}>
        <Image
          src="/logos/current/logo_icon_color.png"
          alt="Camini"
          width={iconConfig.width * 2}
          height={iconConfig.height * 2}
          priority={priority}
          className={cn(
            iconConfig.className,
            "object-contain select-none shrink-0 transition-transform duration-200 group-hover:scale-105",
            imageClassName
          )}
        />
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-bold tracking-tight text-foreground transition-colors group-hover:text-primary",
              size === "xs" && "text-sm",
              size === "sm" && "text-base",
              size === "md" && "text-lg",
              size === "lg" && "text-xl",
              size === "xl" && "text-2xl",
              titleClassName
            )}
          >
            Camini
          </span>
          {subtitle && (
            <span className="text-[11px] font-medium text-muted-foreground tracking-normal mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  } else {
    // variant === "full" (Theme adaptive)
    content = (
      <div className={cn("inline-flex items-center", className)}>
        {/* Light theme: black logo */}
        <Image
          src="/logos/current/logo_black_trimmed.png"
          alt="Camini"
          width={logoConfig.width * 2}
          height={logoConfig.height * 2}
          priority={priority}
          className={cn(
            logoConfig.className,
            "object-contain select-none shrink-0 dark:hidden",
            imageClassName
          )}
        />
        {/* Dark theme: color logo with white text & cyan accents */}
        <Image
          src="/logos/current/logo_color.png"
          alt="Camini"
          width={logoConfig.width * 2}
          height={logoConfig.height * 2}
          priority={priority}
          className={cn(
            logoConfig.className,
            "object-contain select-none shrink-0 hidden dark:block",
            imageClassName
          )}
        />
      </div>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "group inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md",
          className
        )}
      >
        {content}
      </Link>
    );
  }

  return <div className={cn("inline-flex items-center", className)}>{content}</div>;
}
