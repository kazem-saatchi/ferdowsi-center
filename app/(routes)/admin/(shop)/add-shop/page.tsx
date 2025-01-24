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
import { useFindAllPersons } from "@/tanstack/queries";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { addShopSchema } from "@/schema/shopSchema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { labels } from "@/utils/label";
import LoadingComponent from "@/components/LoadingComponent";

export default function AddShopPage() {
  // Tansack Query and Mutation
  const { data, isLoading, isError, error, refetch } = useFindAllPersons();
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
      setSaving(false);
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

  if (isLoading) return <LoadingComponent text={labels.loadingData} />;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{labels.addNewShop}</h1>
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
              <Label htmlFor="area">{labels.areaM2}</Label>
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
              <Label htmlFor="floor">{labels.floorNumber}</Label>
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
              <Label htmlFor="ownerId">{labels.owner}</Label>
              <PersonSelect property="ownerId" label="Owner" />
              {formErrors.ownerId && (
                <span className="text-red-500 text-sm">
                  {formErrors.ownerId?._errors[0]}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="renterId">{`${labels.renter} (${labels.optional})`}</Label>
              <PersonSelect property="renterId" label="Renter" />
              {formErrors.renterId && (
                <span className="text-red-500 text-sm">
                  {formErrors.renterId?._errors[0]}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shopType">{labels.type}</Label>
              <RadioGroup
                property="shopType"
                defaultValue="STORE"
                dir="rtl"
                className="flex flex-row gap-2 items-center
                "
              >
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center space-x-2"
                  onClick={() => setNewShop("type", "STORE")}
                >
                  <RadioGroupItem value="STORE" id="r1" />
                  <Label htmlFor="r1">{labels.store}</Label>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center space-x-2"
                  onClick={() => setNewShop("type", "OFFICE")}
                >
                  <RadioGroupItem value="OFFICE" id="r2" />
                  <Label htmlFor="r2">{labels.office}</Label>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center space-x-2"
                  onClick={() => setNewShop("type", "KIOSK")}
                >
                  <RadioGroupItem value="KIOSK" id="r3" />
                  <Label htmlFor="r3">{labels.kiosk}</Label>
                </Button>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={addShopMutation.isPending}
            >
              {saving ? labels.addingShop : labels.addNewShop}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
