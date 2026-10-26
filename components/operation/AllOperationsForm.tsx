"use client";

import deleteChargesByOperation from "@/app/api/actions/operation/deleteChargesByOperation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useConfirm } from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import Pager from "@/components/Pager";
import ListToolbar from "@/components/table/ListToolbar";
import { useClientList } from "@/hooks/useClientList";
import { labels } from "@/utils/label";
import { formatJalaliDateTime } from "@/utils/localeDate";
import { useQueryClient } from "@tanstack/react-query";
import { Loader, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DataItem {
  id: string;
  title: string;
  date: string | Date;
  createdAt: string | Date;
  deleted: boolean;
}

export function AllOperationsTable({ data }: { data: DataItem[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { confirm, dialog } = useConfirm();
  const router = useRouter();
  const queryClient = useQueryClient();
  const list = useClientList(data, (item) => [item.title]);

  const handleDelete = async (item: DataItem) => {
    // One operation is a whole run (e.g. a month's charge for every unit).
    const ok = await confirm({
      title: labels.undoOperationTitle,
      description: `«${item.title}» — ${labels.irreversibleWarning}`,
      confirmLabel: labels.undoOperationConfirm,
      destructive: true,
    });
    if (!ok) return;

    setDeletingId(item.id);
    try {
      const res = await deleteChargesByOperation(item.id);
      if (res.success && res.data?.success) {
        toast.success(res.data.message);
        // Charges and every balance built on them just changed.
        queryClient.invalidateQueries();
        router.refresh();
      } else {
        toast.error(res.message || labels.undoOperationFailed);
      }
    } catch {
      toast.error(labels.undoOperationFailed);
    } finally {
      setDeletingId(null);
    }
  };

  if (data.length === 0) {
    return <p className="text-muted-foreground">{labels.operationsNotFound}</p>;
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      <ListToolbar
        query={list.query}
        onQueryChange={list.setQuery}
        placeholder={labels.searchOperationsPlaceholder}
        pageSize={list.pageSize}
        onPageSizeChange={list.setPageSize}
        matchCount={list.matchCount}
      />
      <Table className="border rounded-lg">
        <TableHeader className="">
          <TableRow>
            <TableHead className="text-start">عنوان</TableHead>
            <TableHead className="text-start">تاریخ</TableHead>
            <TableHead className="text-start w-[100px]">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.pageItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium text-start">
                {item.title}
              </TableCell>
              <TableCell className="text-start">
                {formatJalaliDateTime(item.createdAt)}
              </TableCell>
              <TableCell className="text-start">
                {item.deleted ? (
                  <span className="text-sm text-muted-foreground">
                    {labels.operationDeleted}
                  </span>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(item)}
                    disabled={deletingId !== null}
                    aria-label={labels.undoOperationAria}
                    title={labels.undoOperationAria}
                  >
                    {deletingId === item.id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {list.pageItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={3}>
                <EmptyState />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Pager
        page={list.page}
        totalPages={list.totalPages}
        onPageChange={list.setPage}
      />
      {dialog}
    </div>
  );
}
