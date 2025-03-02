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
    <html lang="fa" dir="rtl">
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
     
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
