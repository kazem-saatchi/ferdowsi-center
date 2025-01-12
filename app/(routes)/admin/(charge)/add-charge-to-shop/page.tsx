"use client";

import { useState, useEffect } from "react";
import { useAddChargeByShop } from "@/tanstack/mutations";
import { useFindAllShops } from "@/tanstack/queries";
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
import { toast } from "sonner";
import { CustomSelect } from "@/components/CustomSelect";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import DateObject from "react-date-object";
import { AddChargeByShopData } from "@/schema/chargeSchema";
import JalaliMonthCalendar from "@/components/calendar/JalaliMonthCalendar";



export default function AddChargeToShopPage() {
  const [formData, setFormData] = useState({
    month: "",
    shopId: "",
    title: "",
  });

  const [dataState, setDataState] = useState<AddChargeByShopData>({
    startDate: new Date(),
    endDate: new Date(),
    title: "",
    shopId: "",
  });

  const addChargeMutation = useAddChargeByShop();
  const { data: shopsData, isLoading: isLoadingShops } = useFindAllShops();

  const { setShopsAll, shopsAll } = useStore(
    useShallow((state) => ({
      shopsAll: state.shopsAll,
      setShopsAll: state.setshopsAll,
    }))
  );

  useEffect(() => {
    if (shopsData?.data?.shops) {
      setShopsAll(shopsData.data.shops);
    }
  }, [shopsData, setShopsAll]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date: DateObject) => {
    if (date) {
      const persianDate = new DateObject(date).convert(persian, persian_fa);
      const formattedDate = `${persianDate.year}-${String(
        persianDate.month.number
      ).padStart(2, "0")}`;
      const title = `شارژ ${persianDate.month.name} ${persianDate.year}`;
      setFormData((prev) => ({
        ...prev,
        title,
        month: formattedDate,
      }));
      const startDate = date.toFirstOfMonth().toDate();
      const endDate = date.toLastOfMonth().toDate();
      endDate.setHours(23, 59, 59, 999); // Set time to 23:59:59.999
      setDataState({
        startDate,
        endDate,
        title,
        shopId: formData.shopId,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.shopId) {
        toast.error("Please select a shop");
        return;
      }

      const result = await addChargeMutation.mutateAsync(dataState);

      if (result.success) {
        toast.success("Charge added successfully");
        // Reset form after successful submission
        setFormData({
          month: "",
          shopId: "",
          title: "",
        });
      } else {
        toast.error(result.message || "Failed to add charge");
      }
    } catch (error) {
      console.error("Error adding charge:", error);
      toast.error("An error occurred while adding the charge");
    }
  };

  const shopOptions =
    shopsAll?.map((shop) => ({
      id: shop.id,
      label: `Shop ${shop.plaque} (Floor ${shop.floor})`,
    })) || [];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Add Charge to Shop</h1>
      <Card>
        <CardHeader>
          <CardTitle>Charge Details</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopId">Shop</Label>
              <CustomSelect
                options={shopOptions}
                value={formData.shopId}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, shopId: value }))
                }
                label="Shop"
              />
            </div>
            <JalaliMonthCalendar handleDateChange={handleDateChange} />
       
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={addChargeMutation.isPending}
            >
              {addChargeMutation.isPending ? "Adding Charge..." : "Add Charge"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
