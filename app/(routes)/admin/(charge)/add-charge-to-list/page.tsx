"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import JalaliDayCalendar from "@/components/calendar/JalaliDayCalendar";
import { useAddChargeByAmountToShopList } from "@/tanstack/mutation/chargeMutation";
import { useFindAllShops } from "@/tanstack/query/shopQuery";
import { AddChargeByAmountToShopListData } from "@/schema/chargeSchema";
import { labels } from "@/utils/label";
import { convertToEnglishNumber, formatNumber } from "@/utils/formatNumber";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Shop } from "@prisma/client";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";

function AddChargeToListPage() {
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState<
    Omit<AddChargeByAmountToShopListData, "shopIdList">
  >({
    date: new Date(),
    amount: 0,
    title: "",
    proprietor: false,
    description: "",
  });

  // Selected shops state
  const [selectedShops, setSelectedShops] = useState<Shop[]>([]);

  // Shop selection dialog state
  const [isShopDialogOpen, setIsShopDialogOpen] = useState(false);
  const [shopSearchTerm, setShopSearchTerm] = useState("");

  // Fetch all shops
  const {
    data: shopsData,
    isLoading: isLoadingShops,
    isError: isErrorShops,
  } = useFindAllShops();

  // Mutation
  const addChargeToShopListMutation = useAddChargeByAmountToShopList();

  // Filter shops based on search term and exclude already selected ones
  const filteredShops =
    shopsData?.data?.shops?.filter((shop: Shop) => {
      const matchesSearch =
        shop.plaque.toString().includes(shopSearchTerm) ||
        shop.ownerName.toLowerCase().includes(shopSearchTerm.toLowerCase()) ||
        (shop.renterName &&
          shop.renterName.toLowerCase().includes(shopSearchTerm.toLowerCase()));

      const notSelected = !selectedShops.find(
        (selected) => selected.id === shop.id
      );

      return matchesSearch && notSelected;
    }) || [];

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("e.target.value", e.target.value);
    const value = convertToEnglishNumber(e.target.value).replace(/[^\d]/g, "");
    console.log("value", value);
    const numericValue = value ? parseInt(value) : 0;
    console.log("numericValue", numericValue);
    handleInputChange("amount", numericValue);
  };

  const addShopToSelection = (shop: Shop) => {
    if (!selectedShops.find((selected) => selected.id === shop.id)) {
      setSelectedShops((prev) => [...prev, shop]);
    }
  };

  const removeShopFromSelection = (shopId: string) => {
    setSelectedShops((prev) => prev.filter((shop) => shop.id !== shopId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedShops.length === 0) {
      toast.error("حداقل یک واحد انتخاب کنید");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("عنوان را وارد کنید");
      return;
    }

    if (formData.amount <= 0) {
      toast.error("مبلغ باید بزرگتر از صفر باشد");
      return;
    }

    const submitData: AddChargeByAmountToShopListData = {
      ...formData,
      shopIdList: selectedShops.map((shop) => shop.id),
    };

    try {
      await addChargeToShopListMutation.mutateAsync(submitData);
      // Reset form
      setFormData({
        date: new Date(),
        amount: 0,
        title: "",
        proprietor: false,
        description: "",
      });
      setSelectedShops([]);
      router.push("/admin/charge");
    } catch (error) {
      console.error("Error adding charges:", error);
    }
  };

  if (isLoadingShops) {
    return <LoadingComponent text={labels.gettingData} />;
  }

  if (isErrorShops) {
    return <ErrorComponentSimple message={labels.errorOccurred} />;
  }

  return (
    <div className="border-2 rounded-md mx-auto p-6 max-w-5xl lg:max-w-7xl max-h-[90vh] overflow-y-hidden">
      <>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            افزودن شارژ به لیست واحدها
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <JalaliDayCalendar
                    date={formData.date}
                    setDate={(date) => handleInputChange("date", date)}
                    title={labels.date}
                  />
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount">{labels.amount}</Label>
                  <Input
                    id="amount"
                    type="text"
                    value={formData.amount ? formatNumber(formData.amount) : ""}
                    onChange={handleAmountChange}
                    placeholder="مبلغ را وارد کنید"
                    className="text-right"
                  />
                </div>

                {/* Title Input */}
                <div className="space-y-2">
                  <Label htmlFor="title">{labels.title}</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="عنوان شارژ را وارد کنید"
                    className="text-right"
                  />
                </div>

                {/* Description Input */}
                <div className="space-y-2">
                  <Label htmlFor="description">{labels.description}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="توضیحات (اختیاری)"
                    className="text-right min-h-[80px]"
                    maxLength={250}
                  />
                  <p className="text-sm text-gray-500 text-left">
                    {formData.description.length}/250
                  </p>
                </div>

                {/* Proprietor Checkbox */}
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="proprietor"
                    checked={formData.proprietor}
                    onCheckedChange={(checked) =>
                      handleInputChange("proprietor", checked)
                    }
                  />
                  <Label htmlFor="proprietor" className="cursor-pointer">
                    {labels.proprietorType}
                  </Label>
                </div>
              </div>

              <div className="space-y-4">
                {/* Shop Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>انتخاب واحدها</Label>
                    <Dialog
                      open={isShopDialogOpen}
                      onOpenChange={setIsShopDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                          <Plus className="w-4 h-4 ml-2" />
                          افزودن واحد
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[600px]">
                        <DialogHeader>
                          <DialogTitle>انتخاب واحد</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="relative">
                            <Search className="absolute right-3 top-3 h-4 w-4" />
                            <Input
                              placeholder="جستجو بر اساس پلاک، نام مالک یا مستاجر..."
                              value={shopSearchTerm}
                              onChange={(e) =>
                                setShopSearchTerm(e.target.value)
                              }
                              className="pr-10 text-right"
                            />
                          </div>
                          <div className="max-h-[400px] overflow-y-auto space-y-2">
                            {filteredShops.map((shop: Shop) => (
                              <div
                                key={shop.id}
                                className="p-3 border rounded-md cursor-pointer flex justify-between items-center"
                                onClick={() => {
                                  addShopToSelection(shop);
                                  setIsShopDialogOpen(false);
                                  setShopSearchTerm("");
                                }}
                              >
                                <div className="text-right">
                                  <div className="font-medium">
                                    پلاک {shop.plaque} - طبقه {shop.floor}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    مالک: {shop.ownerName}
                                    {shop.renterName &&
                                      ` | مستاجر: ${shop.renterName}`}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    نوع: {shop.type} | مساحت: {shop.area} متر
                                  </div>
                                </div>
                              </div>
                            ))}
                            {filteredShops.length === 0 && (
                              <p className="text-center text-gray-500 py-8">
                                {shopSearchTerm
                                  ? "واحدی یافت نشد"
                                  : "همه واحدها انتخاب شده‌اند"}
                              </p>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Selected Shops List */}
                  <div className="space-y-2">
                    {selectedShops.length === 0 ? (
                      <p className="text-gray-500 text-center py-4 border-2 border-dashed rounded-md">
                        هیچ واحدی انتخاب نشده است
                      </p>
                    ) : (
                      <div className="grid gap-2">
                        <p className="text-sm font-medium">
                          واحدهای انتخاب شده ({selectedShops.length} واحد):
                        </p>
                        <div className="grid gap-2 max-h-[600px] overflow-y-auto border-2 rounded-md p-2">
                          {selectedShops.map((shop) => (
                            <div
                              key={shop.id}
                              className="flex items-center justify-between p-3 border rounded-md "
                            >
                              <div className="text-right flex-1">
                                <div className="font-medium">
                                  پلاک {shop.plaque} - طبقه {shop.floor}
                                </div>
                                <div className="text-sm text-gray-600">
                                  مالک: {shop.ownerName}
                                  {shop.renterName &&
                                    ` | مستاجر: ${shop.renterName}`}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeShopFromSelection(shop.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            {selectedShops.length > 0 && formData.amount > 0 && (
              <div className=" border-2 rounded-md">
                <h3 className="font-medium p-2 pb-0">خلاصه:</h3>
                <p className="text-sm p-2">
                  مبلغ {formatNumber(formData.amount)} ریال به{" "}
                  {selectedShops.length} واحد اضافه خواهد شد.
                </p>
                <p className="text-sm border-t-2 p-2 mt-2">
                  مجموع کل:{" "}
                  {formatNumber(formData.amount * selectedShops.length)} ریال
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={
                  selectedShops.length === 0 ||
                  !formData.title.trim() ||
                  formData.amount <= 0 ||
                  addChargeToShopListMutation.isPending
                }
              >
                {addChargeToShopListMutation.isPending
                  ? "در حال ثبت..."
                  : "ثبت شارژ"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={addChargeToShopListMutation.isPending}
              >
                بازگشت
              </Button>
            </div>
          </form>
        </CardContent>
      </>
    </div>
  );
}

export default AddChargeToListPage;
