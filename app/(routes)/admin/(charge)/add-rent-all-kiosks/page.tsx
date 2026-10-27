"use client";

import { useState } from "react";
import { useAddRentAllKiosks } from "@/tanstack/mutation/chargeMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Page,
  PageHeader,
  PageTitle,
  PageBody,
  PageFooter,
} from "@/components/layout/Page";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmDialog";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { AddChargeAllShopsData } from "@/schema/chargeSchema";
import DateObject from "react-date-object";
import JalaliMonthCalendar from "@/components/calendar/JalaliMonthCalendar";
import { labels } from "@/utils/label";
import { toPersianDigits } from "@/utils/formatNumber";

export default function AddRentToAllKiosksPage() {
  const [formData, setFormData] = useState({
    month: "",
    title: "",
  });

  const [dataState, setDataState] = useState<AddChargeAllShopsData>({
    startDate: new Date(),
    endDate: new Date(),
    title: "",
  });

  const { confirm, dialog } = useConfirm();
  const addRentAllKiosksMutation = useAddRentAllKiosks();

  const handleDateChange = (date: DateObject) => {
    if (date) {
      const persianDate = new DateObject(date).convert(persian, persian_fa);
      const formattedDate = `${persianDate.year}-${String(
        persianDate.month.number
      ).padStart(2, "0")}`;
      const title = `اجاره ماهانه ${persianDate.month.name} ${toPersianDigits(persianDate.year)}`;
      setFormData({
        title,
        month: formattedDate,
      });
      const startDate = date.toFirstOfMonth().toDate();
      const endDate = date.toLastOfMonth().toDate();
      // endDate.setHours(23, 59, 59, 999); // Set time to 23:59:59.999
      setDataState({
        startDate,
        endDate,
        title,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Without a month the request would charge every unit for "now" with an
    // empty title, so refuse before asking.
    if (!formData.month || !dataState.title) {
      toast.error(labels.selectMonthFirst);
      return;
    }
    const ok = await confirm({
      title: `${labels.addRentToAllKiosks}؟`,
      description: `«${dataState.title}» — ${labels.bulkChargeUndoHint}`,
      confirmLabel: labels.addRentToAllKiosks,
    });
    if (!ok) return;
    try {
      // The mutation hook toasts the server's own success or error message.
      const result = await addRentAllKiosksMutation.mutateAsync(dataState);

      if (result.success) {
        // Reset form after successful submission
        setFormData({
          month: "",
          title: "",
        });
        setDataState({
          startDate: new Date(),
          endDate: new Date(),
          title: "",
        });
      }
    } catch (error) {
      console.error("Error adding charges:", error);
    }
  };

  return (
    <Page width="form">
      <div>
        <PageHeader>
          <PageTitle>{labels.addRentToAllKiosks}</PageTitle>
        </PageHeader>
        <form onSubmit={handleSubmit}>
          <PageBody className="space-y-4">
            <JalaliMonthCalendar handleDateChange={handleDateChange} />
            <div className="space-y-2">
              <Label htmlFor="title">{labels.title}</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                disabled
                required
              />
            </div>
          </PageBody>
          <PageFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={addRentAllKiosksMutation.isPending || !formData.month}
            >
              {addRentAllKiosksMutation.isPending
                ? labels.addingRentToAllKiosks
                : labels.addRentToAllKiosks}
            </Button>
          </PageFooter>
        </form>
      </div>
      {dialog}
    </Page>
  );
}
