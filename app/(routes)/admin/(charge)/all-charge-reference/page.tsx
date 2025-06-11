"use client";

import { useEffect, useState } from "react";
import { useFindAllChargesReference } from "@/tanstack/query/chargeQuery";
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
import { ShopChargeReference, ShopType } from "@prisma/client";
import { formatNumber } from "@/utils/formatNumber";
import { useShallow } from "zustand/react/shallow";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { labels } from "@/utils/label";
import ChargeReferenceTable from "@/components/charge/ChargeReferenceTable";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";

export default function ChargeReferenceListPage() {
  const { data, isLoading, isError, error, refetch } =
    useFindAllChargesReference();

  const [tableType, setTableType] = useState<"CHARGE" | "ANNUAL" | "RENT">(
    "CHARGE"
  );
  const [shopTypeFilter, setShopTypeFilter] = useState<ShopType | undefined>(
    undefined
  );

  const {
    allChargesReference,
    setAllChargesReference,
    allAnnualChargeReference,
    setAllAnnualChargesReference,
    allRentReference,
    setAllRentReference,
    exportChargeListToPDF,
    exportChargeListToExcel,
  } = useStore(
    useShallow((state) => ({
      allChargesReference: state.allChargesReference,
      setAllChargesReference: state.setAllChargesReference,
      allAnnualChargeReference: state.allAnnualChargesReference,
      setAllAnnualChargesReference: state.setAllAnnualChargesReference,
      allRentReference: state.allRentReference,
      setAllRentReference: state.setAllRentReference,
      exportChargeListToPDF: state.exportChargeListToPDF,
      exportChargeListToExcel: state.exportChargeListToExcel,
    }))
  );

  useEffect(() => {
    if (data?.data?.chargeList) {
      setAllChargesReference(data.data.chargeList);
    }
    if (data?.data?.annualChargeList) {
      setAllAnnualChargesReference(data.data.annualChargeList);
    }
    if (data?.data?.rentList) {
      setAllRentReference(data.data.rentList);
    }
  }, [
    data,
    setAllChargesReference,
    setAllAnnualChargesReference,
    setAllRentReference,
  ]);

  if (isLoading) return <LoadingComponent text={labels.loadingData} />;
  if (
    isError ||
    !allChargesReference ||
    !allAnnualChargeReference ||
    !allRentReference
  )
    return <ErrorComponentSimple message={labels.errorOccurred} />;

  return (
    <div>
      <CardHeader className="flex flex-row items-center justify-between gap-2 mb-4 px-2">
        <div className="flex flex-col items-start justify-start gap-2 mb-4 px-2">
          <div className="flex flex-row items-center justify-start gap-2 mb-4 px-2">
            <Button
              variant={tableType === "CHARGE" ? "default" : "outline"}
              onClick={() => setTableType("CHARGE")}
            >
              {labels.monthlyCharge}
            </Button>
            <Button
              variant={tableType === "ANNUAL" ? "default" : "outline"}
              onClick={() => setTableType("ANNUAL")}
            >
              {labels.proprietorCharge}
            </Button>
            <Button
              variant={tableType === "RENT" ? "default" : "outline"}
              onClick={() => setTableType("RENT")}
            >
              {labels.rentCharge}
            </Button>
          </div>
          <div className="flex flex-row items-center justify-start gap-2 mb-4 px-2">
            <Button
              variant={
                shopTypeFilter === ShopType.STORE ? "default" : "outline"
              }
              onClick={() => setShopTypeFilter(ShopType.STORE)}
            >
              {labels.shop}
            </Button>
            <Button
              variant={
                shopTypeFilter === ShopType.OFFICE ? "default" : "outline"
              }
              onClick={() => setShopTypeFilter(ShopType.OFFICE)}
            >
              {labels.office}
            </Button>
            <Button
              variant={
                shopTypeFilter === ShopType.KIOSK ? "default" : "outline"
              }
              onClick={() => setShopTypeFilter(ShopType.KIOSK)}
            >
              {labels.kiosk}
            </Button>
            <Button
              variant={
                shopTypeFilter === ShopType.BOARD ? "default" : "outline"
              }
              onClick={() => setShopTypeFilter(ShopType.BOARD)}
            >
              {labels.board}
            </Button>
            <Button
              variant={
                shopTypeFilter === ShopType.PARKING ? "default" : "outline"
              }
              onClick={() => setShopTypeFilter(ShopType.PARKING)}
            >
              {labels.parking}
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-end justify-end gap-2 mb-4 px-2">
          <Button onClick={exportChargeListToPDF} className="w-40">
            {labels.downloadAsPDF}
          </Button>
          <Button onClick={exportChargeListToExcel} className="w-40">
            {labels.downloadAsExcel}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChargeReferenceTable
          chargeReferences={
            tableType === "CHARGE"
              ? allChargesReference
              : tableType === "ANNUAL"
              ? allAnnualChargeReference
              : allRentReference
          }
        />
      </CardContent>
    </div>
  );
}
