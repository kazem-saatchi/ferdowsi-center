import Link from "next/link";
import { SidebarMenuButton, SidebarMenuItem } from "../../ui/sidebar";
import { MenuData } from "./menuData";
import { useId, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

function SidebarItemsMap({ menuData }: { menuData: MenuData }) {
  const [open, setOpen] = useState<boolean>(false);
  const groupId = useId();
  return (
    <>
      <SidebarMenuItem className={cn(open && "text-muted-foreground")}>
        {/* A group heading only opens and closes, so it is a button, not a
            link to "#" that scrolled the page and added a history entry. */}
        <SidebarMenuButton
          type="button"
          aria-expanded={open}
          aria-controls={open ? groupId : undefined}
          onClick={() => setOpen((prev) => !prev)}
        >
          <div className="flex flex-row items-center justify-between w-full">
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
        </SidebarMenuButton>
      </SidebarMenuItem>

      {open && (
        <li id={groupId} className="list-none">
          <ul className="flex w-full min-w-0 flex-col gap-1">
            {menuData.items.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton asChild>
                  <Link href={`${menuData.baseUrl}${item.href}`}>
                    <item.icon className="me-2 h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </ul>
        </li>
      )}
    </>
  );
}

export default SidebarItemsMap;
