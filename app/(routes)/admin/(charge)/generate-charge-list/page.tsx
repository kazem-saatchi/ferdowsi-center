"use client";

import { useState } from "react";
import { useCreateChargeReference } from "@/tanstack/mutation/chargeMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ShopChargeReferenceSchema } from "@/schema/chargeSchema";
import { labels } from "@/utils/label";
import { AlertCircle } from "lucide-react";
import { NumericFormat } from "react-number-format";

export default function GenerateShopChargeReferencePage() {
  const [formData, setFormData] = useState({
    storeConst: "",
    storeMetric: "",
    officeConst: "",
    officeMetric: "",
    savingPercent: "0",
  });

  const createChargeReferenceMutation = useCreateChargeReference();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = ShopChargeReferenceSchema.parse({
        storeConst: Number(formData.storeConst.replace(/,/g, "")),
        storeMetric: Number(formData.storeMetric.replace(/,/g, "")),
        officeConst: Number(formData.officeConst.replace(/,/g, "")),
        officeMetric: Number(formData.officeMetric.replace(/,/g, "")),
        savingPercent: Number(formData.savingPercent.replace(/,/g, "")),
      });

      console.log("data validation", validatedData);

      const result = await createChargeReferenceMutation.mutateAsync(
        validatedData
      );

      if (result.success) {
        toast.success(labels.successMessage);
        setFormData({
          storeConst: "",
          storeMetric: "",
          officeConst: "",
          officeMetric: "",
          savingPercent: "0",
        });
      } else {
        toast.error(result.message || labels.errorMessage);
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
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{labels.generateShopChargeReference}</CardTitle>
          <CardDescription className="pt-2 flex flex-row items-center justify-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-300" />{" "}
            {labels.rialAllert}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeConst">{labels.shopConstantValue}</Label>
              <NumericFormat
                id="storeConst"
                name="storeConst"
                value={formData.storeConst}
                onChange={handleChange}
                thousandSeparator
                customInput={Input}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeMetric">{labels.shopMetricValue}</Label>
              <NumericFormat
                id="storeMetric"
                name="storeMetric"
                value={formData.storeMetric}
                onChange={handleChange}
                thousandSeparator
                customInput={Input}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="officeConst">{labels.officeConstantValue}</Label>
              <NumericFormat
                id="officeConst"
                name="officeConst"
                value={formData.officeConst}
                onChange={handleChange}
                thousandSeparator
                customInput={Input}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="officeMetric">{labels.officeMetricValue}</Label>

              <NumericFormat
                id="officeMetric"
                name="officeMetric"
                value={formData.officeMetric}
                onChange={handleChange}
                thousandSeparator
                customInput={Input}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="savingPercent">{labels.savingPercentValue}</Label>

              <NumericFormat
                id="savingPercent"
                name="savingPercent"
                value={formData.savingPercent}
                onChange={handleChange}
                thousandSeparator
                customInput={Input}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
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
      </Card>
    </div>
  );
}

{
  /*  <Input
                id="storeConst"
                name="storeConst"
                type="text"
                value={
                  formatNumberFromString(formData.storeConst)
                    .formattedPersianNumber
                }
                onChange={handleChange}
                required
              />
  <Input
                id="storeMetric"
                name="storeMetric"
                type="text"
                value={
                  formatNumberFromString(formData.storeMetric)
                    .formattedPersianNumber
                }
                onChange={handleChange}
                required
              /> */
  /* <Input
                id="officeConst"
                name="officeConst"
                type="text"
                value={
                  formatNumberFromString(formData.officeConst)
                    .formattedPersianNumber
                }
                onChange={handleChange}
                required
              /> */
  /* <Input
                id="officeMetric"
                name="officeMetric"
                type="text"
                value={
                  formatNumberFromString(formData.officeMetric)
                    .formattedPersianNumber
                }
                onChange={handleChange}
                required
              /> */
}
