"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import {
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  Monitor,
  Moon,
  Sun,
  UserRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { logoutUser } from "@/app/api/actions/auth/logoutUser";
import { useGetUserInfo } from "@/tanstack/query/personQuery";
import { labels } from "@/utils/label";
import { roleLabel } from "@/utils/roleLabel";

const THEMES = [
  { value: "light", label: labels.themeLight, icon: Sun },
  { value: "dark", label: labels.themeDark, icon: Moon },
  { value: "system", label: labels.themeSystem, icon: Monitor },
];

/** The foot of both sidebars: who is signed in, and everything about the
 *  account in one menu — the other area, the theme and logout. */
export default function AccountMenu({ area }: { area: "admin" | "user" }) {
  // Shares the "user-info" query the owner layout already loads.
  const { data } = useGetUserInfo();
  const person = data?.person;
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const name = person ? `${person.firstName} ${person.lastName}` : "";
  const initials = person
    ? `${person.firstName.charAt(0)}${person.lastName.charAt(0)}`
    : "";
  const canUseAdmin = person?.role === "ADMIN" || person?.role === "MANAGER";
  const switchTo =
    area === "admin"
      ? { href: "/user", label: labels.personalAccount, icon: UserRound }
      : canUseAdmin
        ? { href: "/admin", label: labels.adminPanel, icon: LayoutDashboard }
        : null;

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground"
                >
                  {initials}
                </span>
                <span className="grid min-w-0 flex-1 text-start leading-tight">
                  <span className="truncate font-semibold">{name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {roleLabel(person?.role)}
                  </span>
                </span>
                <ChevronsUpDown className="ms-auto size-4 shrink-0" />
                <span className="sr-only">{labels.accountMenu}</span>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="end"
              sideOffset={4}
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
            >
              {switchTo && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={switchTo.href}>
                      <switchTo.icon />
                      {switchTo.label}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                {labels.theme}
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                {THEMES.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                  >
                    <option.icon />
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  queryClient.clear();
                  logoutUser();
                }}
                className="text-destructive focus:text-destructive"
              >
                <LogOut />
                {labels.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
