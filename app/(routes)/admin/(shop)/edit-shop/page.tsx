"use client";

import { useState, useEffect } from "react";
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
import { useFindAllShops } from "@/tanstack/queries";
import { useUpateShopInfo } from "@/tanstack/mutation/shopMutation";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import type { Shop, ShopType } from "@prisma/client";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { CustomSelect } from "@/components/CustomSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { labels } from "@/utils/label";
import BankCardOTPForm from "@/components/shop/BankCardOTPForm";
import { Separator } from "@/components/ui/separator";

export default function EditShopPage() {
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  const { data, error, isError, isLoading, refetch } = useFindAllShops();

  const { shopsAll, setshopsAll } = useStore(
    useShallow((state) => ({
      shopsAll: state.shopsAll,
      setshopsAll: state.setshopsAll,
    }))
  );
  const updateShopMutation = useUpateShopInfo();

  const [formData, setFormData] = useState({
    plaque: "",
    area: "",
    floor: "",
    bankCardMonthly: "",
    bankCardYearly: "",
  });

  const [shopType, setShopType] = useState<ShopType>("STORE");

  useEffect(() => {
    if (data?.data?.shops) {
      setshopsAll(data.data.shops);
    }
  }, [data, setshopsAll]);

  useEffect(() => {
    if (shopsAll && selectedShopId) {
      const selected = shopsAll.find((shop) => shop.id === selectedShopId);
      if (selected) {
        setSelectedShop(selected);
        setFormData({
          plaque: selected.plaque.toString(),
          area: selected.area.toString(),
          floor: selected.floor.toString(),
          bankCardMonthly: selected.bankCardMonthly,
          bankCardYearly: selected.bankCardYearly,
        });
        setShopType(selected.type);
      }
    } else {
      setSelectedShop(null);
      setFormData({
        plaque: "",
        area: "",
        floor: "",
        bankCardMonthly: "",
        bankCardYearly: "",
      });
      setShopType("STORE");
    }
  }, [selectedShopId, shopsAll]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeOTP = ({
    value,
    name,
  }: {
    value: string;
    name: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId) {
      toast.error(labels.pleaseSelectShop);
      return;
    }
    try {
      const result = await updateShopMutation.mutateAsync({
        id: selectedShopId,
        plaque: Number.parseInt(formData.plaque),
        area: Number.parseFloat(formData.area),
        floor: Number.parseInt(formData.floor),
        type: shopType,
        bankCardMonthly: formData.bankCardMonthly,
        bankCardYearly: formData.bankCardYearly,
      });
      if (result.success) {
        toast.success(labels.shopUpdateSuccess);
      } else {
        toast.error(result.message || labels.shopUpdateError);
      }
    } catch (error) {
      console.error("Error updating shop:", error);
      toast.error(labels.shopUpdateError);
    }
  };

  if (isLoading) return <LoadingComponent text={labels.loadingData} />;

  if (isError)
    return (
      <ErrorComponent
        error={error as Error}
        message={data?.message || labels.errorOccurred}
        retry={refetch}
      />
    );

  const shopOptions =
    shopsAll?.map((shop) => ({
      id: shop.id,
      label: `${labels.shop} ${shop.plaque} (${labels.floorNumber} ${shop.floor})`,
    })) || [];

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{labels.editShopInfo}</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomSelect
            options={shopOptions}
            value={selectedShopId || ""}
            onChange={(value) => setSelectedShopId(value)}
            label={labels.selectShop}
          />
        </CardContent>
      </Card>
      <Separator className="mb-4" />
      {selectedShop ? (
        <Card>
          <CardHeader>
            <CardTitle>{labels.shopDetails}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plaque">{labels.plaqueNumber}</Label>
                <Input
                  id="plaque"
                  name="plaque"
                  type="number"
                  value={formData.plaque}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">{labels.areaM2}</Label>
                <Input
                  id="area"
                  name="area"
                  type="number"
                  step="0.01"
                  value={formData.area}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">{labels.floorNumber}</Label>
                <Input
                  id="floor"
                  name="floor"
                  type="number"
                  value={formData.floor}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 ">
                <Label htmlFor="bankCardMonthly">
                  {labels.bankCardMonthly}
                </Label>
                <BankCardOTPForm
                  title="bankCardMonthly"
                  value={formData.bankCardMonthly}
                  handleChange={handleChangeOTP}
                />
              </div>
              <div className="space-y-2 ">
                <Label htmlFor="bankCardYearly">{labels.bankCardYearly}</Label>
                <BankCardOTPForm
                  title="bankCardYearly"
                  value={formData.bankCardYearly}
                  handleChange={handleChangeOTP}
                />
              </div>
              <div className="space-y-2 max-w-72">
                <Label htmlFor="type">{labels.storeOrOffice}</Label>
                <Select
                  dir="rtl"
                  value={shopType}
                  onValueChange={(value: "STORE" | "OFFICE") =>
                    setShopType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب نوع مغازه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STORE">فروشگاه</SelectItem>
                    <SelectItem value="OFFICE">دفتر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>مالک</Label>
                <Input value={selectedShop.ownerName} disabled />
              </div>
              <div className="space-y-2">
                <Label>مستأجر</Label>
                <Input value={selectedShop.renterName || "ندارد"} disabled />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={updateShopMutation.isPending}
              >
                {updateShopMutation.isPending
                  ? labels.updatingShopInfo
                  : labels.updateShopInfo}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <p className="text-center text-gray-500">
          {labels.pleaseSelectShopForEdit}
        </p>
      )}
    </div>
  );
}
