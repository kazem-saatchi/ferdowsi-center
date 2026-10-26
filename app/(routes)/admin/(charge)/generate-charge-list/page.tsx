"use client";

import { useState } from "react";
import { useCreateChargeReference } from "@/tanstack/mutation/chargeMutation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmDialog";
import { ShopChargeReferenceSchema } from "@/schema/chargeSchema";
import { labels } from "@/utils/label";
import { AlertCircle } from "lucide-react";
import NumericInput from "@/components/NumericInput";

export default function GenerateShopChargeReferencePage() {
  const [formData, setFormData] = useState({
    storeConst: "",
    storeMetric: "",
    officeConst: "",
    officeMetric: "",
    savingPercent: "0",
  });

  const createChargeReferenceMutation = useCreateChargeReference();

  const setField = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const { confirm, dialog } = useConfirm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await confirm({
      title: "مرجع شارژ دوباره ساخته شود؟",
      description: "مرجع شارژ فعلی همه واحدها حذف و با این مقادیر جایگزین می‌شود.",
    });
    if (!ok) return;
    try {
      const validatedData = ShopChargeReferenceSchema.parse({
        storeConst: Number(formData.storeConst.replace(/,/g, "")),
        storeMetric: Number(formData.storeMetric.replace(/,/g, "")),
        officeConst: Number(formData.officeConst.replace(/,/g, "")),
        officeMetric: Number(formData.officeMetric.replace(/,/g, "")),
        savingPercent: Number(formData.savingPercent.replace(/,/g, "")),
      });

      const result = await createChargeReferenceMutation.mutateAsync(
        validatedData
      );

      // The mutation hook toasts the server's own success or error message.
      if (result.success) {
        setFormData({
          storeConst: "",
          storeMetric: "",
          officeConst: "",
          officeMetric: "",
          savingPercent: "0",
        });
      }
    } catch (error) {
      console.error("Error generating shop charge reference:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(labels.generalErrorMessage);
      }
    }
  };


  return (
    <div className="max-w-2xl">
      <div>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle>{labels.generateShopChargeReference}</CardTitle>
          <CardDescription className="pt-2 flex flex-row items-center justify-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-300" />{" "}
            {labels.rialAllert}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeConst">{labels.shopConstantValue}</Label>
              <NumericInput
                id="storeConst"
                name="storeConst"
                value={formData.storeConst}
                onChange={(value) => setField("storeConst", value)}
                allowDecimal
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeMetric">{labels.shopMetricValue}</Label>
              <NumericInput
                id="storeMetric"
                name="storeMetric"
                value={formData.storeMetric}
                onChange={(value) => setField("storeMetric", value)}
                allowDecimal
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="officeConst">{labels.officeConstantValue}</Label>
              <NumericInput
                id="officeConst"
                name="officeConst"
                value={formData.officeConst}
                onChange={(value) => setField("officeConst", value)}
                allowDecimal
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="officeMetric">{labels.officeMetricValue}</Label>

              <NumericInput
                id="officeMetric"
                name="officeMetric"
                value={formData.officeMetric}
                onChange={(value) => setField("officeMetric", value)}
                allowDecimal
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="savingPercent">{labels.savingPercentValue}</Label>

              <NumericInput
                id="savingPercent"
                name="savingPercent"
                value={formData.savingPercent}
                onChange={(value) => setField("savingPercent", value)}
                allowDecimal
                required
              />
            </div>
          </CardContent>
          <CardFooter className="p-3 pt-0 sm:p-6 sm:pt-0">
            <Button
              type="submit"
              className="w-full"
              disabled={createChargeReferenceMutation.isPending}
            >
              {createChargeReferenceMutation.isPending
                ? labels.generating
                : labels.generateChargeReference}
            </Button>
          </CardFooter>
        </form>
      </div>
      {dialog}
    </div>
  );
}

