"use client";

import { useState } from "react";
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
import { useAddShop } from "@/tanstack/mutations";

export default function AddShopPage() {
  const [formData, setFormData] = useState({
    plaque: "",
    area: "",
    floor: "",
    ownerId: "",
    renterId: "",
  });

  const addShopMutation = useAddShop();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    addShopMutation.mutate(
      {
        plaque: parseInt(formData.plaque),
        area: parseFloat(formData.area),
        floor: parseInt(formData.floor),
        ownerId: formData.ownerId,
        renterId: formData.renterId,
      },
      {
        onSettled: () => {
          // Reset form after successful submission
          setFormData({
            plaque: "",
            area: "",
            floor: "",
            ownerId: "",
            renterId: "",
          });
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Add New Shop</h1>
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
              <Label htmlFor="ownerId">Owner ID</Label>
              <Input
                id="ownerId"
                name="ownerId"
                value={formData.ownerId}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="renterId">Renter ID (Optional)</Label>
              <Input
                id="renterId"
                name="renterId"
                value={formData.renterId}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={addShopMutation.isPending}
            >
              {addShopMutation.isPending ? "Adding Shop..." : "Add Shop"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
