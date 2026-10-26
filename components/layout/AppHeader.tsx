"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export type PageTitle = { href: string; name: string };

/** The page whose href is the longest prefix of the path, so a detail page
 *  such as /admin/edit-shop/12 takes the title of /admin/edit-shop. */
function titleFor(pathname: string, titles: PageTitle[]) {
  let best: PageTitle | undefined;
  for (const page of titles) {
    const matches =
      pathname === page.href || pathname.startsWith(`${page.href}/`);
    if (matches && (!best || page.href.length > best.href.length)) {
      best = page;
    }
  }
  return best?.name;
}

/** The bar across the top of the admin and owner content: the sidebar
 *  button next to the sidebar, then the name of the page. It stays put
 *  while the page scrolls under it. */
export default function AppHeader({
  areaTitle,
  titles,
}: {
  areaTitle: string;
  titles: PageTitle[];
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 px-2 backdrop-blur sm:px-3">
      <SidebarTrigger className="h-8 w-8 touch-manipulation" />
      <Separator orientation="vertical" className="h-5" />
      <p className="min-w-0 truncate text-sm font-semibold sm:text-base">
        {titleFor(pathname, titles) ?? areaTitle}
      </p>
    </header>
  );
}
