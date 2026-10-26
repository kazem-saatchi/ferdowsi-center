"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useFindShopById } from "@/tanstack/query/shopQuery";
import { useUpateShopInfo } from "@/tanstack/mutation/shopMutation";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { labels } from "@/utils/label";
import NumericInput from "@/components/NumericInput";
import { ShopType } from "@prisma/client";

export default function EditShopPageById() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;

  const { data, isLoading, isError, error, refetch } = useFindShopById(shopId);
  const updateShopMutation = useUpateShopInfo();

  const [formData, setFormData] = useState({
    plaque: "",
    area: "",
    floor: "",
    bankCardMonthly: "",
    bankCardYearly: "",
  });

  const [shopType, setShopType] = useState<ShopType>("STORE");

  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    if (data?.data?.shop) {
      setFormData({
        plaque: data?.data.shop.plaque.toString(),
        area: data?.data.shop.area.toString(),
        floor: data?.data.shop.floor.toString(),
        bankCardMonthly: data?.data.shop.bankCardMonthly,
        bankCardYearly: data?.data.shop.bankCardYearly,
      });
      setShopType(data.data.shop.type);
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateShopMutation.mutateAsync({
        id: shopId,
        plaque: parseInt(formData.plaque),
        area: parseFloat(formData.area),
        floor: parseInt(formData.floor),
        type: shopType,
        bankCardMonthly: formData.bankCardMonthly,
        bankCardYearly: formData.bankCardYearly,
      });
      router.push("/admin/all-shops");
    } catch (error) {
      console.error("Error updating shop:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <LoadingComponent text="loading Data" />;

  if (isError)
    return (
      <ErrorComponent
        error={error}
        message={data?.message || "somthing went wrong"}
        retry={refetch}
      />
    );
  if (!data?.data?.shop) return <div>Shop not found</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{labels.editShopInfo}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{labels.shopDetails}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plaque">{labels.plaqueNumber}</Label>
              <NumericInput
                id="plaque"
                grouping={false}
                name="plaque"
                value={formData.plaque}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, plaque: value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">{labels.areaM2}</Label>
              <NumericInput
                id="area"
                name="area"
                value={formData.area}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, area: value }))
                }
                allowDecimal
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">{labels.floorNumber}</Label>
              <NumericInput
                id="floor"
                grouping={false}
                name="floor"
                value={formData.floor}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, floor: value }))
                }
                allowNegative
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{labels.ownerName}</Label>
              <Input value={data.data.shop.ownerName} disabled />
            </div>
            <div className="space-y-2">
              <Label>{labels.renterName}</Label>
              <Input
                value={data.data.shop.renterName || labels.notAvailable}
                disabled
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isUpdating}>
              {isUpdating ? labels.updatingShopInfo : labels.updateShopInfo}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
