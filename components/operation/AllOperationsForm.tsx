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
import { Loader, Trash2, X } from "lucide-react";
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
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const handleDelete = async (operationId: string) => {
    setIsDeleting(true);
    setDeletingId(operationId);

    try {
      const res = await deleteChargesByOperation(operationId);
      console.log("Deleting operation with id:", operationId);
      toast.error("با موفقیت حذف شد");
    } catch (error) {
      toast.error("عملیات ناموفق بود");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Table className="border rounded-lg max-w-2xl">
      <TableHeader className="">
        <TableRow>
          <TableHead className="text-right">عنوان</TableHead>
          <TableHead className="text-right">تاریخ</TableHead>
          <TableHead className="text-right w-[100px]">عملیات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium text-right">
              {item.title}
            </TableCell>
            <TableCell className="text-right">
              {formatDate(item.createdAt)}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleDelete(item.id)}
                disabled={isDeleting || item.deleted}
              >
                {!isDeleting ? (
                  <Trash2 className="h-4 w-4" />
                ) : item.id === deletingId ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 animate-pulse" />
                )}

                {item.deleted && "حذف شده است"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
