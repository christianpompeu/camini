import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PublicLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Camini — página inicial"
      className={cn("inline-flex items-center gap-2.5 text-lg font-bold tracking-tight group", className)}
    >
      <Image
        src="/logos/current/logo_icon_color.png"
        alt="Camini"
        width={56}
        height={56}
        className="size-7 object-contain transition-transform duration-200 group-hover:scale-105"
        priority
      />
      <span className="transition-colors group-hover:text-violet-600">Camini</span>
    </Link>
  );
}
