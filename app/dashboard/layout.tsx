import React from "react";
import { cookies } from "next/headers";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sidebarCookie = cookieStore.get("sidebar_state");
  const defaultOpen = sidebarCookie ? sidebarCookie.value === "true" : true;

  return <DashboardShell defaultOpen={defaultOpen}>{children}</DashboardShell>;
}
