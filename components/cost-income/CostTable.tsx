import React, { useState } from "react";
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
import { format } from "date-fns-jalali";
import { labels } from "@/utils/label";
import { Cost } from "@prisma/client";
import { Textarea } from "../ui/textarea";
import ReceiptImage from "../payment/ReceiptImage";
import { AddCostData } from "@/schema/costSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";

type SortKey = keyof Cost;

interface CostsTableProps {
  costs: Cost[];
}

export function CostsTable({ costs }: CostsTableProps) {
  type CategoryType = AddCostData["category"];

  const [sortConfig, setSortConfig] = useState<{
    filter: CategoryType | "ALL";
    key: SortKey;
    direction: "asc" | "desc";
  }>({
    filter: "ALL",
    key: "date",
    direction: "desc",
  });

  const [description, setDescription] = useState<string>("");
  const [viewImage, setViewImage] = useState<boolean>(false);
  const [viewImageSrc, setViewImageSrc] = useState<string>("");

  const sortedCosts = React.useMemo(() => {
    const sortableCosts = [...costs];
    if (sortConfig !== null) {
      sortableCosts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    if (sortConfig.filter !== "ALL") {
      return sortableCosts.filter(
        (cost) => cost.category === sortConfig.filter
      );
    }
    return sortableCosts;
  }, [costs, sortConfig]);

  const requestSort = (key: SortKey) => {
    setSortConfig((currentConfig) => {
      if (currentConfig.key === key && currentConfig.direction === "asc") {
        return { key, direction: "desc", filter: currentConfig.filter };
      }
      return { key, direction: "asc", filter: currentConfig.filter };
    });
  };

  return (
    <>
      <div
        className="flex flex-row items-center justify-between
       mt-6 mb-4 max-w-[180px]"
      >
        <Select
          onValueChange={(value) =>
            setSortConfig((prev) => ({
              ...prev,
              filter: value as CategoryType | "ALL",
            }))
          }
          dir="rtl"
          defaultValue="ALL"
        >
          <SelectTrigger>
            <SelectValue>{labels.costCategory}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{labels.all}</SelectItem>
            <SelectItem value="ELECTRICITY">{labels.electricity}</SelectItem>
            <SelectItem value="WATER">{labels.water}</SelectItem>
            <SelectItem value="GAS">{labels.gas}</SelectItem>
            <SelectItem value="CHILLER">{labels.chiller}</SelectItem>
            <SelectItem value="ELEVATOR">{labels.elevator}</SelectItem>
            <SelectItem value="ESCALATOR">{labels.elevator}</SelectItem>
            <SelectItem value="SECURITY">{labels.security}</SelectItem>
            <SelectItem value="CLEANING">{labels.cleaning}</SelectItem>
            <SelectItem value="OTHER">{labels.other}</SelectItem>
          </SelectContent>
        </Select>
        <Badge>{sortConfig.filter}</Badge>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => requestSort("title")}>
                {labels.title} <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => requestSort("amount")}>
                {labels.amount} <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => requestSort("date")}>
                {labels.date} <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => requestSort("category")}>
                {labels.type} <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button variant="ghost" onClick={() => requestSort("proprietor")}>
                {labels.costCategory} <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">{labels.description}</TableHead>
            <TableHead className="text-center">{labels.receiptImage}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCosts.map((cost) => (
            <TableRow key={cost.id}>
              <TableCell className="text-center">{cost.title}</TableCell>
              <TableCell className="text-center">
                {cost.amount.toLocaleString()}
              </TableCell>
              <TableCell className="text-center">
                {format(new Date(cost.date), "yyyy/MM/dd")}
              </TableCell>
              <TableCell className="text-center">
                {labels[cost.category.toLowerCase() as keyof typeof labels]}
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
                  onClick={() => setDescription(cost.description)}
                  disabled={cost.billImage === ""}
                >
                  {cost.billImage === "" ? labels.noImage : labels.view}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {description !== "" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-full">
          <div
            className="bg-white p-4 rounded-lg max-w-3xl max-h-[90vh] overflow-auto
             min-w-[400px] min-h-[300px] flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <Textarea className="min-h-[200px]">{description}</Textarea>
            <button
              className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              onClick={() => setDescription("")}
            >
              {labels.close}
            </button>
          </div>
        </div>
      )}
      {viewImage && viewImageSrc !== "" && (
        <ReceiptImage src={viewImageSrc} viewPage={setViewImage} />
      )}
    </>
  );
}
