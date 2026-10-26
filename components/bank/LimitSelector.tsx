import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { labels } from "@/utils/label";
import { toPersianDigits } from "@/utils/formatNumber";

export function LimitSelector({
  limit,
  setLimit,
}: {
  limit: number;
  setLimit: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="limit-select">{labels.rowsPerPage}</Label>
      <Select
        value={limit.toString()}
        onValueChange={(value) => setLimit(Number(value))}
      >
        <SelectTrigger id="limit-select" className="w-24">
          <SelectValue placeholder={labels.rowsPerPage} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">{toPersianDigits(10)}</SelectItem>
          <SelectItem value="25">{toPersianDigits(25)}</SelectItem>
          <SelectItem value="50">{toPersianDigits(50)}</SelectItem>
          <SelectItem value="100">{toPersianDigits(100)}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}