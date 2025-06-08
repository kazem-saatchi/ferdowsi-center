import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const floorsNumber: number[] = [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7];

const parkingFloorsLabel = (number: number) => {
  if (number === -4) return "P3";
  if (number === -3) return "P2";
  if (number === -2) return "P1";
  return number;
};

interface SelectShopFloorProps {
  floorValue: number;
  setFloorValue: (property: string, value: any) => void;
}

function ShopFloorSelect({ floorValue, setFloorValue }: SelectShopFloorProps) {
  return (
    <div>
      <div className="flex flex-row items-center justify-end" dir="ltr">
        {floorsNumber.map((floor) => (
          <Button
            type="button"
            key={floor}
            size="sm"
            onClick={() => {
              setFloorValue("floor", floor);
            }}
            variant="outline"
            className={cn(floorValue === floor && "bg-primary")}
          >
            {parkingFloorsLabel(floor)}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default ShopFloorSelect;
