import { formatJalaliDate } from "@/utils/localeDate";
import { formatNumber } from "@/utils/formatNumber";
import React, { useMemo, useState } from "react";
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
import { labels } from "@/utils/label";
import { COST_CATEGORY_OPTIONS, costCategoryLabel } from "@/utils/costCategory";
import { Cost } from "@prisma/client";
import { Textarea } from "../ui/textarea";
import ReceiptImage from "../payment/ReceiptImage";
import { AddCostData } from "@/schema/cost-IncomeSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "../ui/dialog";
import EmptyState from "../EmptyState";
import Pager from "../Pager";
import ListToolbar from "../table/ListToolbar";
import { useClientList } from "@/hooks/useClientList";

type SortKey = "title" | "amount" | "date" | "category" | "proprietor";
type CategoryType = AddCostData["category"];

export function CostsTable({ costs }: { costs: Cost[] }) {
  const [filter, setFilter] = useState<CategoryType | "ALL">("ALL");
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  }>({
    key: "date",
    direction: "desc",
  });

  const [description, setDescription] = useState<string>("");
  const [viewImage, setViewImage] = useState<boolean>(false);
  const [viewImageSrc, setViewImageSrc] = useState<string>("");

  function requestSort(key: SortKey) {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  const visibleCosts = useMemo(() => {
    const filtered =
      filter === "ALL" ? costs : costs.filter((c) => c.category === filter);
    const { key, direction } = sortConfig;
    const sign = direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const x = a[key];
      const y = b[key];
      if (x instanceof Date && y instanceof Date)
        return (x.getTime() - y.getTime()) * sign;
      if (typeof x === "string" && typeof y === "string")
        return x.localeCompare(y, "fa") * sign;
      return (Number(x) - Number(y)) * sign;
    });
  }, [costs, filter, sortConfig]);

  const list = useClientList(visibleCosts, (cost) => [
    cost.title,
    cost.description,
    costCategoryLabel(cost.category),
    cost.amount,
  ]);

  return (
    <>
      <div className="mt-6 mb-4">
        <ListToolbar
          query={list.query}
          onQueryChange={list.setQuery}
          placeholder={labels.searchCostsPlaceholder}
          pageSize={list.pageSize}
          onPageSizeChange={list.setPageSize}
          matchCount={list.matchCount}
        >
          <Select
            onValueChange={(value) => {
              setFilter(value as CategoryType | "ALL");
              list.resetPage();
            }}
            dir="rtl"
            value={filter}
          >
            <SelectTrigger
              aria-label={labels.costCategory}
              className="w-full sm:w-[220px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{labels.all}</SelectItem>
              {COST_CATEGORY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ListToolbar>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => requestSort("title")}>
                {labels.title} <ArrowUpDown className="ms-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => requestSort("amount")}>
                {labels.amount} <ArrowUpDown className="ms-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => requestSort("date")}>
                {labels.date} <ArrowUpDown className="ms-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => requestSort("category")}>
                {labels.type} <ArrowUpDown className="ms-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => requestSort("proprietor")}>
                {labels.costCategory} <ArrowUpDown className="ms-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">{labels.description}</TableHead>
            <TableHead className="text-center">{labels.receiptImage}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.pageItems.map((cost) => (
            <TableRow key={cost.id}>
              <TableCell className="text-center">{cost.title}</TableCell>
              <TableCell className="text-center">
                {formatNumber(cost.amount)}
              </TableCell>
              <TableCell className="text-center">
                {formatJalaliDate(cost.date)}
              </TableCell>
              <TableCell className="text-center">
                {costCategoryLabel(cost.category)}
              </TableCell>
              <TableCell className="text-center">
                {cost.proprietor
                  ? labels.proprietorCharge
                  : labels.monthlyCharge}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => setDescription(cost.description)}
                  disabled={cost.description === ""}
                >
                  {cost.description === "" ? labels.noDescription : labels.view}
                </Button>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setViewImageSrc(cost.billImage);
                    setViewImage(true);
                  }}
                  disabled={cost.billImage === ""}
                >
                  {cost.billImage === "" ? labels.noImage : labels.view}
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {list.pageItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>
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
      <Dialog
        open={description !== ""}
        onOpenChange={(open) => !open && setDescription("")}
      >
        <DialogContent className="max-w-2xl">
          <DialogTitle>{labels.description}</DialogTitle>
          <Textarea className="min-h-[200px]" value={description} readOnly />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDescription("")}>
              {labels.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {viewImage && viewImageSrc !== "" && (
        <ReceiptImage src={viewImageSrc} viewPage={setViewImage} />
      )}
    </>
  );
}
