"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { useAddShop } from "@/tanstack/mutation/shopMutation";
import { PersonSelect } from "@/components/person/PersonSelect";
import { useFindAllPersons } from "@/tanstack/query/personQuery";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { addShopSchema } from "@/schema/shopSchema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { labels } from "@/utils/label";
import { SHOP_TYPE_LABELS } from "@/utils/shopType";
import type { ShopType } from "@prisma/client";
import LoadingComponent from "@/components/LoadingComponent";
import BankCardOTP from "@/components/shop/BankCardOTP";
import ShopFloorSelect from "@/components/shop/ShopFloorSelect";
import NumericInput from "@/components/NumericInput";

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
  // The store keeps a half-filled form across navigation, so start from it.
  const [plaqueText, setPlaqueText] = useState(
    newShop.plaque ? String(newShop.plaque) : ""
  );
  const [areaText, setAreaText] = useState(
    newShop.area ? String(newShop.area) : ""
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
          setPlaqueText("");
          setAreaText("");
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
      <Card>
        <CardHeader>
          <CardTitle>{labels.addNewShop}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plaque">{labels.plaqueNumber}</Label>
              <NumericInput
                id="plaque"
                grouping={false}
                name="plaque"
                value={plaqueText}
                onChange={(value) => {
                  setPlaqueText(value);
                  // An empty field stays 0 so the schema reports it, rather than
                  // NaN showing up in the input.
                  setNewShop("plaque", value ? parseInt(value, 10) : 0);
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
              <NumericInput
                id="area"
                name="area"
                value={areaText}
                allowDecimal
                onChange={(value) => {
                  // Kept as text so a half-typed "12." survives until the next digit.
                  setAreaText(value);
                  setNewShop("area", value ? parseFloat(value) : 0);
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

              <ShopFloorSelect
                floorValue={newShop.floor}
                setFloorValue={setNewShop}
              />
              {formErrors.floor && (
                <span className="text-red-500 text-sm">
                  {formErrors.floor?._errors[0]}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerId">{labels.owner}</Label>
              <PersonSelect property="ownerId" label={labels.owner} />
              {formErrors.ownerId && (
                <span className="text-red-500 text-sm">
                  {formErrors.ownerId?._errors[0]}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="renterId">{`${labels.renter} (${labels.optional})`}</Label>
              <PersonSelect property="renterId" label={labels.renter} />
              {formErrors.renterId && (
                <span className="text-red-500 text-sm">
                  {formErrors.renterId?._errors[0]}
                </span>
              )}
            </div>
            <div className="space-y-2 ">
              <Label htmlFor="bankCardMonthly">{labels.bankCardMonthly}</Label>
              <BankCardOTP title="bankCardMonthly" />
            </div>
            <div className="space-y-2 ">
              <Label htmlFor="bankCardYearly">{labels.bankCardYearly}</Label>
              <BankCardOTP title="bankCardYearly" />
            </div>
            <div className="space-y-2">
              <Label id="shopType-label">{labels.type}</Label>
              <RadioGroup
                aria-labelledby="shopType-label"
                value={newShop.type}
                onValueChange={(value) => setNewShop("type", value as ShopType)}
                dir="rtl"
                className="flex flex-wrap gap-2"
              >
                {(Object.keys(SHOP_TYPE_LABELS) as ShopType[]).map((type) => (
                  <Label
                    key={type}
                    htmlFor={`shopType-${type}`}
                    className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 font-normal has-[[data-state=checked]]:border-primary"
                  >
                    <RadioGroupItem value={type} id={`shopType-${type}`} />
                    {SHOP_TYPE_LABELS[type]}
                  </Label>
                ))}
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
