"use client";

import { useEffect, useState } from "react";
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

import { useAddShop } from "@/tanstack/mutations";
import { PersonSelect } from "@/components/person/PersonSelect";
import { useFindPersonAll } from "@/tanstack/queries";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { addShopSchema } from "@/schema/shopSchema";
import { toast } from "sonner";

export default function AddShopPage() {
  const { data, isLoading, isError, error, refetch } = useFindPersonAll();
  const [formData, setFormData] = useState({
    plaque: "",
    area: "",
    floor: "",
    ownerId: "",
    renterId: "",
  });

  const { personsAll, setPersonAll } = useStore(
    useShallow((state) => ({
      personsAll: state.personsAll,
      setPersonAll: state.setPersonAll,
    }))
  );

  useEffect(() => {
    if (data?.data?.persons) {
      setPersonAll(data.data.persons);
    }
  }, [data, setPersonAll]);

  const addShopMutation = useAddShop();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate input
    const validation = addShopSchema.safeParse(data);
    if (!validation.success) {
      toast.error(
        validation.error.errors.map((err) => err.message).join(", ")
      );
      return
    }

    addShopMutation.mutate(
      {
        plaque: parseInt(formData.plaque),
        area: parseFloat(formData.area),
        floor: parseInt(formData.floor),
        ownerId: formData.ownerId,
        renterId: formData.renterId,
      },
      {
        onSuccess: () => {
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
              <Label htmlFor="ownerId">Owner</Label>
              <PersonSelect
                value={formData.ownerId}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, ownerId: value }))
                }
                label="Owner"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="renterId">Renter (Optional)</Label>
              <PersonSelect
                value={formData.renterId}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, renterId: value }))
                }
                label="Renter"
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
