import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "FORÇA | Camini Hub",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FORÇA",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function ForcaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
