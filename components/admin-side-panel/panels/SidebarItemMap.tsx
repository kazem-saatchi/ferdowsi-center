import Link from "next/link";
import { SidebarMenuButton, SidebarMenuItem } from "../../ui/sidebar";
import { MenuData } from "./menuData";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

function SidebarItemsMap({ menuData }: { menuData: MenuData }) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <SidebarMenuItem className={cn(open && "text-gray-500")}>
        <SidebarMenuButton asChild>
          <Link
            href="#"
            onClick={() => {
              setOpen((prev) => !prev);
            }}
          >
            <div
              className={cn(
                "flex flex-row items-center justify-between w-full"
              )}
            >
              <div className="flex flex-row items-center justify-start gap-2">
                <menuData.icon className="h-4 w-4" />
                <span>{menuData.title}</span>
              </div>
              {open ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {open &&
        menuData.items.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild>
              <Link href={`${menuData.baseUrl}${item.href}`}>
                <item.icon className="ml-2 h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
    </>
  );
}

export default SidebarItemsMap;
