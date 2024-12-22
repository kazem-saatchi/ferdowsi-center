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
import { format } from "date-fns-jalali";
import { ShopHistory } from "@prisma/client";
import { useState } from "react";

const historyTypeColors = {
  ownership: "bg-blue-500",
  activePeriod: "bg-green-500",
  deactivePeriod: "bg-red-500",
  rental: "bg-yellow-500",
};

interface TableProps {
  allHistories: ShopHistory[];
}

function HistoryTable({ allHistories }: TableProps) {
    const [page, setPage] = useState(1);
    const itemsPerPage = 40;
    const totalPages = Math.ceil(allHistories.length / itemsPerPage);

    const paginatedHistories = allHistories?.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    );

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Shop ID</TableHead>
            <TableHead className="text-center">Person ID</TableHead>
            <TableHead className="text-center">Type</TableHead>
            <TableHead className="text-center">Start Date</TableHead>
            <TableHead className="text-center">End Date</TableHead>
            <TableHead className="text-center">Status</TableHead>
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
                  {history.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              Next
            </button>
          </div>
        )}
    </>
  );
}

export default HistoryTable;
