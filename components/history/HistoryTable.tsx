"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns-jalali";
import { ShopHistory } from "@prisma/client";
import { useState } from "react";
import { labels } from "@/utils/label";
import { UpdateHistoryModal } from "./UpdateHistoryModal";
import { Pencil } from "lucide-react";

type HistoryType =
  | "Ownership"
  | "ActiveByOwner"
  | "ActiveByRenter"
  | "InActive";

const historyTypeColors: Record<HistoryType, string> = {
  Ownership: "bg-blue-500",
  ActiveByOwner: "bg-green-500",
  ActiveByRenter: "bg-yellow-500",
  InActive: "bg-red-500",
};

interface TableProps {
  allHistories: ShopHistory[];
}

function HistoryTable({ allHistories }: TableProps) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 40;
  const totalPages = Math.ceil(allHistories.length / itemsPerPage);

  const [selectedHistory, setSelectedHistory] = useState<ShopHistory | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const paginatedHistories = allHistories?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleEditClick = (history: ShopHistory) => {
    setSelectedHistory(history);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHistory(null);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">{labels.shopId}</TableHead>
            <TableHead className="text-center">{labels.personId}</TableHead>
            <TableHead className="text-center">{labels.type}</TableHead>
            <TableHead className="text-center">{labels.startDate}</TableHead>
            <TableHead className="text-center">{labels.endDate}</TableHead>
            <TableHead className="text-center">{labels.status}</TableHead>
            <TableHead className="text-center">{labels.edit}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedHistories?.map((history) => (
            <TableRow key={history.id}>
              <TableCell className="text-center">{history.plaque}</TableCell>
              <TableCell className="text-center">
                {history.personName}
              </TableCell>
              <TableCell className="text-center">
                <Badge className={historyTypeColors[history.type]}>
                  {history.type}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {format(new Date(history.startDate), "PPP")}
              </TableCell>
              <TableCell className="text-center">
                {history.endDate
                  ? format(new Date(history.endDate), "PPP")
                  : "N/A"}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={history.isActive ? "default" : "secondary"}>
                  {history.isActive ? labels.active : labels.inactive}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditClick(history)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <UpdateHistoryModal
        history={selectedHistory}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            {labels.previous}
          </button>
          <span>
            {labels.page} {page} {labels.of} {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            {labels.next}
          </button>
        </div>
      )}
    </>
  );
}

export default HistoryTable;
