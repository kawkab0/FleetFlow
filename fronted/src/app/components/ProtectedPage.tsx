"use client";

import { ReactNode } from "react";

type ProtectedPageProps = {
  permission: string;
  children: ReactNode;
};

export default function ProtectedPage({
  children,
}: ProtectedPageProps) {
  return <>{children}</>;
}
