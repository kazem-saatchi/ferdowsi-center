import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مجتمع تجاری فردوسی",
  description: "مجتمع تجاری فردوسی - راهنمای مشاغل و خدمات",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 min-h-screen flex-col">{children}</div>
  );
}
