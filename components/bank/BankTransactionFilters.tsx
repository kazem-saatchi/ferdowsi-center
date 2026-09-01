"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Filter, RotateCcw, Search } from "lucide-react";
import { TransactionCategory } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import JalaliDayCalendar from "@/components/calendar/JalaliDayCalendar";

import { labels, bankTransactionCategoryLabels } from "@/utils/label";
import { formatNumberFromString } from "@/utils/formatNumber";
import { toUtcDayStart, toUtcNextDayStart } from "@/utils/jalaliRange";
import {
  BankTransactionFilters,
  UNCATEGORIZED,
} from "@/utils/bankTransactionFilters";

const ALL = "ALL";
type RegisteredChoice = typeof ALL | "YES" | "NO";
type CategoryChoice = typeof ALL | TransactionCategory | typeof UNCATEGORIZED;

interface BankTransactionFiltersProps {
  /**
   * Called with the filters the user committed. Only the date/amount/text
   * fields live here; the account-type and income/expense button groups stay
   * on the page and apply on click.
   */
  onApply: (filters: BankTransactionFilters) => void;
  onClear: () => void;
  isFetching?: boolean;
}

/**
 * Draft-then-apply, rather than filtering as you type.
 *
 * There is no debounce hook in this codebase, and a free-text search that
 * fired per keystroke would put one round trip per character on a server
 * action. An explicit apply button also lets the amount and date fields be
 * validated against each other before anything is sent.
 */
export default function BankTransactionFiltersCard({
  onApply,
  onClear,
  isFetching = false,
}: BankTransactionFiltersProps) {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  // Amounts are kept twice: the Persian, comma-grouped string the user sees,
  // and the plain digits actually sent. Same split as the payment forms.
  const [amountFrom, setAmountFrom] = useState("");
  const [amountFromDisplay, setAmountFromDisplay] = useState("");
  const [amountTo, setAmountTo] = useState("");
  const [amountToDisplay, setAmountToDisplay] = useState("");
  const [exactAmount, setExactAmount] = useState(false);

  const [search, setSearch] = useState("");
  const [registered, setRegistered] = useState<RegisteredChoice>(ALL);
  const [category, setCategory] = useState<CategoryChoice>(ALL);

  const handleAmountFrom = (value: string) => {
    const { formattedPersianNumber, formattedNumber } =
      formatNumberFromString(value);
    setAmountFromDisplay(formattedPersianNumber);
    setAmountFrom(formattedNumber);
  };

  const handleAmountTo = (value: string) => {
    const { formattedPersianNumber, formattedNumber } =
      formatNumberFromString(value);
    setAmountToDisplay(formattedPersianNumber);
    setAmountTo(formattedNumber);
  };

  const handleApply = () => {
    const min = amountFrom ? Number(amountFrom) : undefined;
    const max = amountTo ? Number(amountTo) : undefined;

    if (fromDate && toDate && fromDate.getTime() > toDate.getTime()) {
      toast.error(labels.invalidDateRange);
      return;
    }
    if (!exactAmount && min !== undefined && max !== undefined && min > max) {
      toast.error(labels.invalidAmountRange);
      return;
    }

    onApply({
      // UTC bounds, not the pickers' local midnight — see utils/jalaliRange.ts.
      startDate: fromDate ? toUtcDayStart(fromDate) : undefined,
      endDateExclusive: toDate ? toUtcNextDayStart(toDate) : undefined,
      ...(exactAmount ? { amount: min } : { minAmount: min, maxAmount: max }),
      search: search.trim() || undefined,
      registered: registered === ALL ? undefined : registered === "YES",
      category: category === ALL ? undefined : category,
    });
  };

  const handleClear = () => {
    setFromDate(null);
    setToDate(null);
    setAmountFrom("");
    setAmountFromDisplay("");
    setAmountTo("");
    setAmountToDisplay("");
    setExactAmount(false);
    setSearch("");
    setRegistered(ALL);
    setCategory(ALL);
    onClear();
  };

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle className="text-right flex items-center gap-2">
          <Filter className="h-5 w-5" />
          {labels.bankTransactionFilters}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Free text — matches the description and the bank's own identifiers */}
        <div className="space-y-2">
          <Label htmlFor="tx-search">{labels.searchTransactions}</Label>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="tx-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              placeholder={labels.searchTransactionsPlaceholder}
              className="pr-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <JalaliDayCalendar
            id="tx-from-date"
            date={fromDate}
            setDate={setFromDate}
            title={labels.fromDate}
          />
          <JalaliDayCalendar
            id="tx-to-date"
            date={toDate}
            setDate={setToDate}
            title={labels.toDate}
          />

          <div className="space-y-2">
            <Label htmlFor="tx-amount-from">
              {exactAmount ? labels.exactAmountOnly : labels.amountFrom}
            </Label>
            <Input
              id="tx-amount-from"
              inputMode="numeric"
              value={amountFromDisplay}
              onChange={(e) => handleAmountFrom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-amount-to">{labels.amountTo}</Label>
            <Input
              id="tx-amount-to"
              inputMode="numeric"
              value={amountToDisplay}
              onChange={(e) => handleAmountTo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              disabled={exactAmount}
            />
          </div>
        </div>

        {/* Ticking this turns the lower amount bound into an exact match, which
            is the common case when reconciling a known figure off a statement. */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="tx-exact-amount"
            checked={exactAmount}
            onCheckedChange={(checked) => setExactAmount(checked === true)}
          />
          <Label htmlFor="tx-exact-amount" className="cursor-pointer">
            {labels.exactAmountOnly}
          </Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tx-registered">{labels.registrationStatus}</Label>
            <Select
              value={registered}
              onValueChange={(value) => setRegistered(value as RegisteredChoice)}
            >
              <SelectTrigger id="tx-registered">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>
                  {labels.allRegistrationStatus}
                </SelectItem>
                <SelectItem value="YES">{labels.registeredOnly}</SelectItem>
                <SelectItem value="NO">{labels.unregisteredOnly}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-category">{labels.transactionCategory}</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as CategoryChoice)}
            >
              <SelectTrigger id="tx-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{labels.allCategories}</SelectItem>
                <SelectItem value={UNCATEGORIZED}>
                  {labels.uncategorized}
                </SelectItem>
                {Object.values(TransactionCategory).map((value) => (
                  <SelectItem key={value} value={value}>
                    {bankTransactionCategoryLabels[value] ?? value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleApply}
            disabled={isFetching}
            className="w-full sm:w-auto"
          >
            {labels.applyFilters}
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={isFetching}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 shrink-0" />
            {labels.clearFilters}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
