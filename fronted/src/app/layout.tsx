import sidebar from "./components/sidebar";
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/sidebar";

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
    <html lang="en">
      <body>
        <Sidebar />
        <div className="ml-64">{children}</div>
      </body>
    </html>
  );
}
