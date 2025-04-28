"use client";

import { useEffect, useState } from "react";
import { useFindAllChargesReference } from "@/tanstack/queries";
import { useStore } from "@/store/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import type { ShopChargeReference } from "@prisma/client";
import { formatNumber } from "@/utils/formatNumber";
import { useShallow } from "zustand/react/shallow";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { labels } from "@/utils/label";

type SortKey = keyof ShopChargeReference;

export default function ChargeReferenceListPage() {
  const { data, isLoading, isError, error, refetch } =
    useFindAllChargesReference();

  const {
    allChargesReference,
    setAllChargesReference,
    allAnnualChargeReference,
    setAllAnnualChargesReference,
    exportChargeListToPDF,
    exportChargeListToExcel,
  } = useStore(
    useShallow((state) => ({
      allChargesReference: state.allChargesReference,
      setAllChargesReference: state.setAllChargesReference,
      allAnnualChargeReference: state.allAnnualChargesReference,
      setAllAnnualChargesReference: state.setAllAnnualChargesReference,
      exportChargeListToPDF: state.exportChargeListToPDF,
      exportChargeListToExcel: state.exportChargeListToExcel,
    }))
  );

  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
    proprietor: boolean;
  }>({ key: "plaque", direction: "asc", proprietor: false });

  useEffect(() => {
    if (data?.data?.chargeList) {
      setAllChargesReference(data.data.chargeList);
    }
    if (data?.data?.annualChargeList) {
      setAllAnnualChargesReference(data.data.annualChargeList);
    }
  }, [data, setAllChargesReference, setAllAnnualChargesReference]);

  const sortedChargeReferences = [
    ...(allChargesReference || []),
    ...(allAnnualChargeReference || []),
  ]
    .filter((charge) => charge.proprietor === sortConfig.proprietor)
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
          proprietor: current.proprietor,
        };
      }
      return { key, direction: "asc", proprietor: current.proprietor };
    });
  };

  if (isLoading) return <LoadingComponent text={labels.loadingData} />;
  if (isError)
    return (
      <ErrorComponent
        error={error}
        message={labels.errorOccurred}
        retry={refetch}
      />
    );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle>
            {sortConfig.proprietor
              ? labels.proprietorChargeList
              : labels.monthlyChargeList}
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => {
              setSortConfig((prev) => {
                return { ...prev, proprietor: !prev.proprietor };
              });
            }}
          >
            {sortConfig.proprietor
              ? labels.viewMonthlyList
              : labels.viewProprietorList}
          </Button>
        </div>
      </CardHeader>
      <div className="flex flex-row items-center justify-start gap-2 mb-4 px-2">
        <Button onClick={exportChargeListToPDF}>{labels.downloadAsPDF}</Button>
        <Button onClick={exportChargeListToExcel}>
          {labels.downloadAsExcel}
        </Button>
      </div>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">
                <Button variant="ghost" onClick={() => handleSort("plaque")}>
                  {labels.plaque} <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button variant="ghost" onClick={() => handleSort("area")}>
                  {labels.areaM2} <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("constantAmount")}
                >
                  {labels.constAmount} <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("metricAmount")}
                >
                  {labels.metricAmount} <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("totalAmount")}
                >
                  {labels.totalCharge} <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button variant="ghost" onClick={() => handleSort("year")}>
                  {labels.date} <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedChargeReferences.map((reference) => (
              <TableRow key={reference.id}>
                <TableCell className="text-center">
                  {reference.plaque}
                </TableCell>
                <TableCell className="text-center">
                  {reference.area.toFixed(2)}
                </TableCell>
                <TableCell className="text-center text-2xl">
                  {formatNumber(reference.constantAmount)}
                </TableCell>
                <TableCell className="text-center text-2xl">
                  {formatNumber(reference.metricAmount)}
                </TableCell>
                <TableCell className="text-center text-2xl">
                  {formatNumber(reference.totalAmount)}
                </TableCell>
                <TableCell className="text-center">{reference.year}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
