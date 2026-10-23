import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PublicLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Camini — página inicial"
      className={cn("inline-flex items-center gap-2 text-lg font-bold tracking-tight", className)}
    >
      <span className="grid size-8 place-items-center overflow-hidden rounded-xl bg-[#5b2cff] shadow-sm shadow-violet-500/25">
        <Image
          src="/logos/current/camini_logos (2).png"
          alt=""
          width={26}
          height={26}
          className="size-6 object-contain"
        />
      </span>
      <span>Camini</span>
    </Link>
  );
}
