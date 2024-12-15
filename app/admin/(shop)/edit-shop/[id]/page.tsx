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
import { toast } from "sonner";
import { useFindShopById } from "@/tanstack/queries";
import { useUpateShopInfo } from "@/tanstack/mutations";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";

export default function EditShopPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;

  const { data, isLoading, isError, error, refetch } = useFindShopById(shopId);
  const updateShopMutation = useUpateShopInfo();

  const [formData, setFormData] = useState({
    plaque: "",
    area: "",
    floor: "",
  });

  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    if (data?.data?.shop) {
      setFormData({
        plaque: data?.data.shop.plaque.toString(),
        area: data?.data.shop.area.toString(),
        floor: data?.data.shop.floor.toString(),
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateShopMutation.mutateAsync({
        id: shopId,
        plaque: parseInt(formData.plaque),
        area: parseFloat(formData.area),
        floor: parseInt(formData.floor),
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
      <h1 className="text-3xl font-bold mb-8">Edit Shop</h1>
      <Card>
        <CardHeader>
          <CardTitle>Shop Details</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plaque">Plaque Number</Label>
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
              <Label htmlFor="area">Area (sq m)</Label>
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
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                name="floor"
                type="number"
                value={formData.floor}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Owner</Label>
              <Input value={data.data.shop.ownerName} disabled />
            </div>
            <div className="space-y-2">
              <Label>Renter</Label>
              <Input value={data.data.shop.renterName || "N/A"} disabled />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isUpdating}>
              {isUpdating ? "Updating Shop..." : "Update Shop"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
