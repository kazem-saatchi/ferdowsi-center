"use client";

import { useEffect, useState } from "react";
import { useShopHistoryAll } from "@/tanstack/queries";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";

const historyTypeColors = {
  ownership: "bg-blue-500",
  activePeriod: "bg-green-500",
  deactivePeriod: "bg-red-500",
  rental: "bg-yellow-500",
};

export default function AllShopHistoryPage() {
  const { data, isLoading, isError, error, refetch } = useShopHistoryAll();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Zustand State
  const { allHistories, setAllHistories } = useStore(
    useShallow((state) => ({
      allHistories: state.allHistories,
      setAllHistories: state.setAllHistories,
    }))
  );

  useEffect(() => {
    if (!!data && !!data.data?.histories) {
      setAllHistories(data?.data?.histories);
    }
  }, [data]);

  if (isLoading) {
    return <LoadingComponent text="Loading shop history..." />;
  }

  if (isError) {
    return (
      <ErrorComponent
        message={error instanceof Error ? error.message : "Unknown error"}
        retry={refetch}
        error={error}
      />
    );
  }

  if(!allHistories) {
    return <ErrorComponentSimple message="Histories Not Found" />
  }

  
  const totalPages = Math.ceil(allHistories.length / itemsPerPage);

  const paginatedHistories = allHistories?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Shop History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shop ID</TableHead>
              <TableHead>Person ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedHistories?.map((history) => (
              <TableRow key={history.id}>
                <TableCell>{history.shopId}</TableCell>
                <TableCell>{history.personId}</TableCell>
                <TableCell>
                  <Badge className={historyTypeColors[history.type]}>
                    {history.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(history.startDate), "PPP")}
                </TableCell>
                <TableCell>
                  {history.endDate
                    ? format(new Date(history.endDate), "PPP")
                    : "N/A"}
                </TableCell>
                <TableCell>
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
      </CardContent>
    </Card>
  );
}
