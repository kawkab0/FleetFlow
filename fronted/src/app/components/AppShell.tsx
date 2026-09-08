"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./sidebar";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="ml-64">{children}</div>
    </div>
  );
}
