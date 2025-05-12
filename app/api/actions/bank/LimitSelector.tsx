import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LimitSelector({
  limit,
  setLimit,
}: {
  limit: number;
  setLimit: (value: number) => void;
}) {
  return (
    <div className="flex flex-row items-center justify-start gap-4 w-[180px]">
      <Label className="w-20" htmlFor="limit-select">تعداد </Label>
      <Select
        value={limit.toString()}
        onValueChange={(value) => setLimit(Number(value))}
      >
        <SelectTrigger id="limit-select" className="w-[180px]">
          <SelectValue placeholder="Select limit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="25">25</SelectItem>
          <SelectItem value="50">50</SelectItem>
          <SelectItem value="100">100</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}