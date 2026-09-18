import type { Metadata } from "next";
import "./globals.css";
import AppShell from "./components/AppShell";
import ThemeProvider from "./components/ThemeProvider";

export const metadata: Metadata = {
  title: "FleetFlow ERP",
  description: "Fleet management and enterprise resource planning system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
