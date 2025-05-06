import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import TanstackProvider from "@/provider/TanstackProvider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const fontFamily = Vazirmatn({ subsets: ["arabic"] });

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
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={cn(fontFamily.className)}>
        <TanstackProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </TanstackProvider>
        <Toaster
          toastOptions={{
            classNames: {
              toast:
                "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
              description: "group-[.toast]:text-muted-foreground",
              actionButton:
                "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
              cancelButton:
                "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
              // For error toasts
              error:
                "bg-red-100 border-red-400 text-red-900 [&>svg]:text-red-500",
              // For warning toasts
              warning:
                "bg-orange-100 border-orange-400 text-orange-900 [&>svg]:text-orange-500",
            },
          }}
        />
      </body>
    </html>
  );
}
