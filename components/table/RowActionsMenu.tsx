"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { labels } from "@/utils/label";
import { useCanWrite } from "@/components/auth/WriteAccess";

export type RowAction = { label: string; href: string };

/** A row's links behind one "⋯" button. Four link columns pushed the persons
 *  and units lists far past a phone's width, with the actions hidden at the
 *  end of a horizontal scroll; one menu column fits. `edit` sits last, after a
 *  separator, as the one action that changes data. */
export default function RowActionsMenu({
  actions,
  edit,
  rowLabel,
}: {
  actions: RowAction[];
  edit?: RowAction;
  /** Names the row for screen readers, e.g. "واحد ۱۰۳". */
  rowLabel: string;
}) {
  const canWrite = useCanWrite();
  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`${labels.rowActions} ${rowLabel}`}
          title={labels.rowActions}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem key={action.href} asChild>
            <Link href={action.href}>{action.label}</Link>
          </DropdownMenuItem>
        ))}
        {edit && canWrite && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={edit.href}>{edit.label}</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
