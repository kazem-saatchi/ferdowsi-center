import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import TanstackProvider from "@/provider/TanstackProvider";
import { Toaster } from "@/components/ui/sonner";

const rubik = Rubik({ subsets: ["arabic"] });

export const metadata: Metadata = {
  title: "Ferdowsi App",
  description: "Ferdowsi Department Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={cn(rubik.className)}>
        <TanstackProvider>{children}</TanstackProvider>
        <Toaster
            toastOptions={{
              unstyled: false,
              classNames: {
                toast: "bg-neutral-100 p-x4 rounded-lg",
                error: "bg-red-300 dark:bg-red-700",
                success:
                  "bg-neutral-100 dark:bg-neutral-800 dard:text-neutral-200",
                title: "text-primary",
                description: "",
                actionButton: "bg-neutral-400 p-4",
                cancelButton: "bg-orange-400",
                closeButton: "bg-red-400",
              },
            }}
          />
      </body>
    </html>
  );
}
