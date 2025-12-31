"use client";

import { useState } from "react";
import { ShopHistory } from "@prisma/client";
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
import { useUpdateShopHistory } from "@/tanstack/mutation/historyMutation";
import { UpdateHistoryData } from "@/app/api/actions/history/updateHistory";

interface UpdateHistoryModalProps {
  history: ShopHistory | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UpdateHistoryModal({
  history,
  isOpen,
  onClose,
}: UpdateHistoryModalProps) {
  const [dateType, setDateType] = useState<"startDate" | "endDate" | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const updateMutation = useUpdateShopHistory();

  // Reset state when modal closes or history changes
  const handleClose = () => {
    setDateType(null);
    setSelectedDate(null);
    onClose();
  };

  // Initialize date when date type is selected
  const handleDateTypeChange = (type: "startDate" | "endDate") => {
    setDateType(type);
    if (history) {
      if (type === "startDate") {
        setSelectedDate(new Date(history.startDate));
      } else if (type === "endDate" && history.endDate) {
        setSelectedDate(new Date(history.endDate));
      }
    }
  };

  const handleSubmit = () => {
    if (!history || !dateType || !selectedDate) return;

    // Prevent updating null end dates
    if (dateType === "endDate" && history.endDate === null) {
      return;
    }

    const updateData: UpdateHistoryData = {
      id: history.id,
      shopId: history.shopId,
      personId: history.personId,
      date: selectedDate,
      type: dateType,
    };

    updateMutation.mutate(updateData, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  if (!history) return null;

  const canUpdateEndDate = history.endDate !== null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{labels.updateHistoryDate}</DialogTitle>
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

          {/* Date Picker */}
          {dateType && (
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
                setDate={setSelectedDate}
                title=""
              />
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
          <Button
            onClick={handleSubmit}
            disabled={!dateType || !selectedDate || updateMutation.isPending}
          >
            {updateMutation.isPending
              ? labels.updatingHistoryDate
              : labels.update}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
