"use client";

import { useEffect, useState } from "react";
import { useFindAllChargesReference } from "@/tanstack/query/chargeQuery";
import { useStore } from "@/store/store";
import {
  Page,
  PageHeader,
  PageTitle,
  PageBody,
} from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { ShopChargeReference, ShopType } from "@prisma/client";
import { useShallow } from "zustand/react/shallow";
import LoadingComponent from "@/components/LoadingComponent";
import { labels } from "@/utils/label";
import ChargeReferenceTable from "@/components/charge/ChargeReferenceTable";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";
import {
  exportChargeReferenceToExcel,
  type ChargeReferenceVariant,
} from "@/utils/chargeReferenceExcel";
import { exportToPDF } from "@/utils/tableExport";
import { Download, FileText } from "lucide-react";
import Pager from "@/components/Pager";
import ListToolbar from "@/components/table/ListToolbar";
import { useClientList } from "@/hooks/useClientList";

/** The page's three tabs, in the vocabulary the report builder uses. */
const VARIANTS: Record<"CHARGE" | "ANNUAL" | "RENT", ChargeReferenceVariant> = {
  CHARGE: "monthly",
  ANNUAL: "yearly",
  RENT: "rent",
};

const PDF_COLUMNS = [
  { header: labels.referenceYear, accessor: "year" },
  { header: labels.referenceAmount, accessor: "totalAmount" },
  { header: labels.metricAmount, accessor: "metricAmount" },
  { header: labels.constAmount, accessor: "constantAmount" },
  { header: labels.areaM2, accessor: "area" },
  { header: labels.plaque, accessor: "plaque" },
];

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
  } = useStore(
    useShallow((state) => ({
      allChargesReference: state.allChargesReference,
      setAllChargesReference: state.setAllChargesReference,
      allAnnualChargeReference: state.allAnnualChargesReference,
      setAllAnnualChargesReference: state.setAllAnnualChargesReference,
      allRentReference: state.allRentReference,
      setAllRentReference: state.setAllRentReference,
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

  const baseData: ShopChargeReference[] | null =
    tableType === "CHARGE"
      ? allChargesReference
      : tableType === "ANNUAL"
        ? allAnnualChargeReference
        : allRentReference;

  const list = useClientList(
    baseData,
    (reference) => [reference.plaque],
    (reference) => !shopTypeFilter || reference.shopType === shopTypeFilter
  );
  // The downloads follow what is on screen: tab, unit type and search, across
  // every page rather than just the one showing.
  const tableData = list.matching;

  const showTable = (type: typeof tableType) => {
    setTableType(type);
    list.resetPage();
  };
  const showShopType = (type: ShopType | undefined) => {
    setShopTypeFilter(type);
    list.resetPage();
  };

  const reportTitle = `${labels.chargeReferenceSheetName} - ${
    tableType === "ANNUAL"
      ? labels.proprietorCharge
      : tableType === "RENT"
        ? labels.rentCharge
        : labels.monthlyCharge
  }`;

  const handleExportExcel = () => {
    void exportChargeReferenceToExcel({
      rows: tableData,
      variant: VARIANTS[tableType],
      shopTypeFilter,
      fileName: reportTitle,
    });
  };

  const handleExportPDF = () => {
    exportToPDF({
      fileName: reportTitle,
      data: tableData,
      columns: PDF_COLUMNS,
    });
  };

  if (isLoading) return <LoadingComponent text={labels.loadingData} />;
  if (
    isError ||
    !allChargesReference ||
    !allAnnualChargeReference ||
    !allRentReference
  )
    return <ErrorComponentSimple message={labels.errorOccurred} />;

  return (
    <Page>
      <PageHeader>
        <PageTitle>{labels.chargeReferenceList}</PageTitle>
      </PageHeader>
      <PageBody className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="flex flex-col items-start justify-start gap-2">
            <div className="flex flex-wrap items-center justify-start gap-2">
              <Button
                variant={tableType === "CHARGE" ? "default" : "outline"}
                aria-pressed={tableType === "CHARGE"}
                onClick={() => showTable("CHARGE")}
              >
                {labels.monthlyCharge}
              </Button>
              <Button
                variant={tableType === "ANNUAL" ? "default" : "outline"}
                aria-pressed={tableType === "ANNUAL"}
                onClick={() => showTable("ANNUAL")}
              >
                {labels.proprietorCharge}
              </Button>
              <Button
                variant={tableType === "RENT" ? "default" : "outline"}
                aria-pressed={tableType === "RENT"}
                onClick={() => showTable("RENT")}
              >
                {labels.rentCharge}
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-start gap-2">
              <Button
                variant={shopTypeFilter === undefined ? "default" : "outline"}
                aria-pressed={shopTypeFilter === undefined}
                onClick={() => showShopType(undefined)}
              >
                {labels.all}
              </Button>
              <Button
                variant={
                  shopTypeFilter === ShopType.STORE ? "default" : "outline"
                }
                aria-pressed={shopTypeFilter === ShopType.STORE}
                onClick={() => showShopType(ShopType.STORE)}
              >
                {labels.shop}
              </Button>
              <Button
                variant={
                  shopTypeFilter === ShopType.OFFICE ? "default" : "outline"
                }
                aria-pressed={shopTypeFilter === ShopType.OFFICE}
                onClick={() => showShopType(ShopType.OFFICE)}
              >
                {labels.office}
              </Button>
              <Button
                variant={
                  shopTypeFilter === ShopType.KIOSK ? "default" : "outline"
                }
                aria-pressed={shopTypeFilter === ShopType.KIOSK}
                onClick={() => showShopType(ShopType.KIOSK)}
              >
                {labels.kiosk}
              </Button>
              <Button
                variant={
                  shopTypeFilter === ShopType.BOARD ? "default" : "outline"
                }
                aria-pressed={shopTypeFilter === ShopType.BOARD}
                onClick={() => showShopType(ShopType.BOARD)}
              >
                {labels.board}
              </Button>
              <Button
                variant={
                  shopTypeFilter === ShopType.PARKING ? "default" : "outline"
                }
                aria-pressed={shopTypeFilter === ShopType.PARKING}
                onClick={() => showShopType(ShopType.PARKING)}
              >
                {labels.parking}
              </Button>
            </div>
          </div>
          <div className="flex flex-row flex-wrap sm:flex-col sm:items-end gap-2">
            <Button
              onClick={handleExportPDF}
              className="w-44"
              variant="outline"
              disabled={tableData.length === 0}
            >
              <FileText className="me-2 h-4 w-4" />
              {labels.downloadAsPDF}
            </Button>
            <Button
              onClick={handleExportExcel}
              className="w-44"
              disabled={tableData.length === 0}
            >
              <Download className="me-2 h-4 w-4" />
              {labels.downloadAsExcel}
            </Button>
          </div>
        </div>
        <ListToolbar
          query={list.query}
          onQueryChange={list.setQuery}
          placeholder={labels.searchPlaquePlaceholder}
          pageSize={list.pageSize}
          onPageSizeChange={list.setPageSize}
          matchCount={list.matchCount}
        />
        <ChargeReferenceTable chargeReferences={list.pageItems} />
        <Pager
          page={list.page}
          totalPages={list.totalPages}
          onPageChange={list.setPage}
        />
      </PageBody>
    </Page>
  );
}
