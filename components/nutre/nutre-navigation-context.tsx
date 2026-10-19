"use client";

import React, { createContext, useContext, useMemo, forwardRef } from "react";
import Link, { LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  normalizeNutrePath,
  resolveNutrePath,
  isNutrePathActive,
} from "@/lib/nutre/navigation";

export interface NutreNavigationContextType {
  isSubdomain: boolean;
  resolveUrl: (path: string) => string;
  isActive: (path: string) => boolean;
  push: (path: string) => void;
  replace: (path: string) => void;
  pathname: string;
}

const NutreNavigationContext = createContext<NutreNavigationContextType | null>(null);

export interface NutreNavigationProviderProps {
  children: React.ReactNode;
  initialIsSubdomain?: boolean;
}

export function NutreNavigationProvider({
  children,
  initialIsSubdomain = false,
}: NutreNavigationProviderProps) {
  const pathname = usePathname() || "/";
  const router = useRouter();

  // Se o pathname no browser começar explicitamente com /nutre, estamos no domínio principal (/nutre/...)
  // Se não começar com /nutre (ex: /, /pacientes, /pacientes/novo), estamos navegando no subdomínio.
  // Usamos initialIsSubdomain garantido pelo Server Component Layout para sincronia SSR perfeita.
  const isSubdomain = useMemo(() => {
    if (pathname.startsWith("/nutre")) {
      return false;
    }
    return initialIsSubdomain || !pathname.startsWith("/nutre");
  }, [pathname, initialIsSubdomain]);

  const resolveUrl = useMemo(
    () => (path: string) => resolveNutrePath(path, isSubdomain),
    [isSubdomain]
  );

  const isActive = useMemo(
    () => (targetPath: string) => isNutrePathActive(pathname, targetPath, isSubdomain),
    [pathname, isSubdomain]
  );

  const push = useMemo(
    () => (path: string) => {
      const target = resolveUrl(path);
      // Se for URL externa completa (ex: https://camini.dev.br/dashboard), redirecionar via window
      if (target.startsWith("http://") || target.startsWith("https://")) {
        window.location.href = target;
      } else {
        router.push(target);
      }
    },
    [router, resolveUrl]
  );

  const replace = useMemo(
    () => (path: string) => {
      const target = resolveUrl(path);
      if (target.startsWith("http://") || target.startsWith("https://")) {
        window.location.replace(target);
      } else {
        router.replace(target);
      }
    },
    [router, resolveUrl]
  );

  const contextValue = useMemo<NutreNavigationContextType>(
    () => ({
      isSubdomain,
      resolveUrl,
      isActive,
      push,
      replace,
      pathname,
    }),
    [isSubdomain, resolveUrl, isActive, push, replace, pathname]
  );

  return (
    <NutreNavigationContext.Provider value={contextValue}>
      {children}
    </NutreNavigationContext.Provider>
  );
}

export function useNutreNavigation(): NutreNavigationContextType {
  const context = useContext(NutreNavigationContext);
  if (!context) {
    return {
      isSubdomain: false,
      resolveUrl: (path: string) => resolveNutrePath(path, false),
      isActive: (path: string) => isNutrePathActive("", path, false),
      push: () => {},
      replace: () => {},
      pathname: "",
    };
  }
  return context;
}

export interface NutreLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>,
    LinkProps {
  children: React.ReactNode;
}

export const NutreLink = forwardRef<HTMLAnchorElement, NutreLinkProps>(
  function NutreLink({ href, ...props }, ref) {
    const { resolveUrl } = useNutreNavigation();
    const resolvedHref = typeof href === "string" ? resolveUrl(href) : href;

    return <Link ref={ref} href={resolvedHref} {...props} />;
  }
);
