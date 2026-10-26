import { Building2 } from "lucide-react";
import { SidebarHeader } from "@/components/ui/sidebar";
import { labels } from "@/utils/label";

/** The top of both sidebars: the building, and which area this is. */
export default function SidebarBrand({ areaTitle }: { areaTitle: string }) {
  return (
    <SidebarHeader>
      <div className="flex items-center gap-2 p-1">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Building2 className="size-4" />
        </span>
        <span className="grid min-w-0 leading-tight">
          <span className="truncate font-semibold">{labels.buildingName}</span>
          <span className="truncate text-xs text-muted-foreground">
            {areaTitle}
          </span>
        </span>
      </div>
    </SidebarHeader>
  );
}
