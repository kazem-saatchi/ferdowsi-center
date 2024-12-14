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

export default function AddShopPage() {
  // Tansack Query and Mutation
  const { data, isLoading, isError, error, refetch } = useFindPersonAll();
  const addShopMutation = useAddShop();

  // Error State
  const [saving, setSaving] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<any>({});

  const { setPersonAll, newShop, setNewShop, resetNewShop } = useStore(
    useShallow((state) => ({
      personsAll: state.personsAll,
      setPersonAll: state.setPersonAll,
      newShop: state.newShop,
      setNewShop: state.setNewShop,
      resetNewShop: state.resetNewShop,
    }))
  );

  useEffect(() => {
    if (data?.data?.persons) {
      setPersonAll(data.data.persons);
    }
  }, [data]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    // Validate input
    const validation = addShopSchema.safeParse(newShop);
    if (!validation.success) {
      // Set form errors
      const errors = validation.error.format();
      setSaving(false)
      setFormErrors(errors);
    } else {
      addShopMutation.mutate(validation.data, {
        onSuccess: () => {
          resetNewShop();
        },
        onSettled: () => {
          setSaving(false);
        },
      });
    }
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
                value={newShop.plaque}
                onChange={(event) => {
                  setNewShop("plaque", parseInt(event.target.value));
                }}
              />
              {formErrors.plaque && (
                <span className="text-red-500 text-sm">
                  {formErrors.plaque?._errors[0]}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area (sq m)</Label>
              <Input
                id="area"
                name="area"
                type="number"
                step="0.01"
                value={newShop.area}
                onChange={(event) => {
                  setNewShop("area", parseFloat(event.target.value));
                }}
              />
              {formErrors.area && (
                <span className="text-red-500 text-sm">
                  {formErrors.area?._errors[0]}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                name="floor"
                type="number"
                value={newShop.floor}
                onChange={(event) => {
                  setNewShop("floor", parseInt(event.target.value));
                }}
              />
              {formErrors.floor && (
                <span className="text-red-500 text-sm">
                  {formErrors.floor?._errors[0]}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerId">Owner</Label>
              <PersonSelect property="ownerId" label="Owner" />
              {formErrors.ownerId && (
                <span className="text-red-500 text-sm">
                  {formErrors.ownerId?._errors[0]}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="renterId">Renter (Optional)</Label>
              <PersonSelect property="renterId" label="Renter" />
              {formErrors.renterId && (
                <span className="text-red-500 text-sm">
                  {formErrors.renterId?._errors[0]}
                </span>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={addShopMutation.isPending}
            >
              {saving ? "Adding Shop..." : "Add Shop"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
