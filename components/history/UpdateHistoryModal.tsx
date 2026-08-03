"use client";

import { useState } from "react";
import { ShopHistory } from "@prisma/client";
import { format } from "date-fns-jalali";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import JalaliDayCalendar from "@/components/calendar/JalaliDayCalendar";
import { labels } from "@/utils/label";
import {
  useUpdateShopHistory,
  usePreviewHistoryDateChange,
} from "@/tanstack/mutation/historyMutation";
import type { UpdateHistoryData } from "@/app/api/actions/history/updateHistory";
import type { OperationChargeDiff } from "@/app/api/actions/charge/recalcCharges";
import { toast } from "sonner";

interface UpdateHistoryModalProps {
  history: ShopHistory | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatAmount = (amount: number) => amount.toLocaleString("fa-IR");

export function UpdateHistoryModal({
  history,
  isOpen,
  onClose,
}: UpdateHistoryModalProps) {
  const [dateType, setDateType] = useState<"startDate" | "endDate" | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [previewData, setPreviewData] = useState<OperationChargeDiff[] | null>(
    null
  );

  const updateMutation = useUpdateShopHistory();
  const previewMutation = usePreviewHistoryDateChange();

  // Reset state when modal closes or history changes
  const handleClose = () => {
    setDateType(null);
    setSelectedDate(null);
    setPreviewData(null);
    onClose();
  };

  // Initialize date when date type is selected
  const handleDateTypeChange = (type: "startDate" | "endDate") => {
    setDateType(type);
    setPreviewData(null);
    if (history) {
      if (type === "startDate") {
        setSelectedDate(new Date(history.startDate));
      } else if (type === "endDate" && history.endDate) {
        setSelectedDate(new Date(history.endDate));
      }
    }
  };

  const buildUpdateData = (): UpdateHistoryData | null => {
    if (!history || !dateType || !selectedDate) return null;
    if (dateType === "endDate" && history.endDate === null) return null;
    return {
      id: history.id,
      shopId: history.shopId,
      personId: history.personId,
      date: selectedDate,
      type: dateType,
    };
  };

  const handlePreview = async () => {
    const updateData = buildUpdateData();
    if (!updateData) return;

    const res = await previewMutation.mutateAsync(updateData);
    if (res.success && res.data?.success) {
      setPreviewData(res.data.diffs);
    } else {
      toast.error(res.data?.message || res.message);
    }
  };

  const handleConfirm = () => {
    const updateData = buildUpdateData();
    if (!updateData) return;

    updateMutation.mutate(updateData, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  if (!history) return null;

  const canUpdateEndDate = history.endDate !== null;
  const showingPreview = previewData !== null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {showingPreview ? labels.chargeRecalcTitle : labels.updateHistoryDate}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Type Selection */}
          {!dateType && (
            <div className="space-y-3">
              <Label>{labels.selectDateType}</Label>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleDateTypeChange("startDate")}
                  className="w-full"
                >
                  {labels.startDate}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDateTypeChange("endDate")}
                  className="w-full"
                  disabled={!canUpdateEndDate}
                >
                  {labels.endDate}
                  {!canUpdateEndDate && (
                    <span className="text-xs text-muted-foreground mr-2">
                      ({labels.notAvailable})
                    </span>
                  )}
                </Button>
              </div>
              {!canUpdateEndDate && (
                <p className="text-sm text-muted-foreground">
                  {labels.cannotUpdateNullEndDate}
                </p>
              )}
            </div>
          )}

          {/* Date Picker (before preview) */}
          {dateType && !showingPreview && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  {dateType === "startDate" ? labels.startDate : labels.endDate}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateType(null);
                    setSelectedDate(null);
                  }}
                >
                  {labels.cancel}
                </Button>
              </div>
              <JalaliDayCalendar
                date={selectedDate}
                setDate={(d) => {
                  setSelectedDate(d);
                  setPreviewData(null);
                }}
                title=""
              />
            </div>
          )}

          {/* Charge recalculation preview */}
          {showingPreview && (
            <div className="space-y-4">
              {previewData.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {labels.noChargeImpact}
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {labels.chargeRecalcNotice}
                  </p>
                  {previewData.some((op) => op.hasPaymentConflict) && (
                    <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 space-y-1">
                      <div className="text-sm font-medium text-amber-700 dark:text-amber-500">
                        {labels.paymentConflictTitle}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {labels.paymentConflictNotice}
                      </p>
                    </div>
                  )}
                  {previewData.map((op) => (
                    <div
                      key={op.operationId}
                      className="rounded-md border p-3 space-y-2"
                    >
                      <div className="text-sm font-medium">
                        {op.operationName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {labels.chargePeriod}:{" "}
                        {format(new Date(op.windowStart), "PPP")} -{" "}
                        {format(new Date(op.windowEnd), "PPP")}
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-muted-foreground">
                            <th className="text-right font-normal">
                              {labels.personName}
                            </th>
                            <th className="text-center font-normal">
                              {labels.oldValue}
                            </th>
                            <th className="text-center font-normal">
                              {labels.newValue}
                            </th>
                            <th className="text-center font-normal">
                              {labels.paidColumn}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {op.perPerson.map((p) => (
                            <tr key={p.personId} className="border-t">
                              <td className="py-1">{p.personName}</td>
                              <td className="text-center text-muted-foreground">
                                {formatAmount(p.oldAmount)}
                                <span className="text-xs mr-1">
                                  ({p.oldDays} {labels.daysColumn})
                                </span>
                              </td>
                              <td className="text-center font-medium">
                                {formatAmount(p.newAmount)}
                                <span className="text-xs mr-1">
                                  ({p.newDays} {labels.daysColumn})
                                </span>
                              </td>
                              <td
                                className={
                                  p.needsPaymentReview
                                    ? "text-center font-medium text-amber-600 dark:text-amber-500"
                                    : "text-center text-muted-foreground"
                                }
                              >
                                {p.paidInWindow > 0
                                  ? formatAmount(p.paidInWindow)
                                  : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* History Info */}
          <div className="space-y-2 text-sm border-t pt-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{labels.shopId}:</span>
              <span>{history.plaque}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{labels.personId}:</span>
              <span>{history.personName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{labels.type}:</span>
              <span>{history.type}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {labels.cancel}
          </Button>

          {!showingPreview ? (
            <Button
              onClick={handlePreview}
              disabled={
                !dateType || !selectedDate || previewMutation.isPending
              }
            >
              {previewMutation.isPending
                ? labels.loadingChargeChanges
                : labels.previewChargeChanges}
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => setPreviewData(null)}
                disabled={updateMutation.isPending}
              >
                {labels.backToDate}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending
                  ? labels.updatingHistoryDate
                  : labels.confirmAndApply}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
