"use client";

import { useEffect, useState } from "react";
import { useGetShopBalance, useFindAllShops } from "@/tanstack/queries";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CustomSelect } from "@/components/CustomSelect";
import { Label } from "@/components/ui/label";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ErrorComponent from "@/components/ErrorComponent";

export default function ShopBalancePage() {
  const [selectedShopId, setSelectedShopId] = useState("");
  const {
    data: shopsData,
    isLoading: isLoadingAllShops,
    isError: isErrorAllShops,
    error: errorAllShops,
    refetch: refetchAllShops,
  } = useFindAllShops();
  const {
    data: balanceData,
    isLoading,
    isError,
  } = useGetShopBalance(selectedShopId);

  const {
    shopBalance,
    setShopBalance,
    personsBalance,
    setPersonsBalance,
    setShopsAll,
    shopsAll,
  } = useStore(
    useShallow((state) => ({
      shopBalance: state.shopBalance,
      setShopBalance: state.setShopBalance,
      personsBalance: state.personsBalance,
      setPersonsBalance: state.setPersonsBalance,
      shopsAll: state.shopsAll,
      setShopsAll: state.setshopsAll,
    }))
  );

  useEffect(() => {
    if (shopsData?.data?.shops) {
      setShopsAll(shopsData.data.shops);
    }
  }, [shopsData, setShopsAll]);

  useEffect(() => {
    if (balanceData?.data?.shopBalance) {
      setShopBalance(balanceData.data.shopBalance);
    }
    if (balanceData?.data?.personsBalance) {
      setPersonsBalance(balanceData.data.personsBalance);
    }
  }, [balanceData, setShopBalance, setPersonsBalance]);

  const shopOptions =
    shopsAll?.map((shop) => ({
      id: shop.id,
      label: `Shop ${shop.plaque} (Floor ${shop.floor})`,
    })) || [];

  const renderShopBalanceTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Plaque</TableHead>
          <TableHead className="text-center">Total Charge</TableHead>
          <TableHead className="text-center">Total Payment</TableHead>
          <TableHead className="text-center">Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="text-center">{shopBalance?.plaque}</TableCell>
          <TableCell className="text-center">
            {shopBalance?.totalCharge.toLocaleString()} Rials
          </TableCell>
          <TableCell className="text-center">
            {shopBalance?.totalPayment.toLocaleString()} Rials
          </TableCell>
          <TableCell className="text-center">
            {shopBalance && (shopBalance?.balance).toLocaleString()} Rials
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );

  const renderPersonsBalanceTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Person Name</TableHead>
          <TableHead className="text-center">Total Charge</TableHead>
          <TableHead className="text-center">Total Payment</TableHead>
          <TableHead className="text-center">Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {personsBalance &&
          personsBalance.map((person) => (
            <TableRow key={person.personId}>
              <TableCell className="text-center">{person.personName}</TableCell>
              <TableCell className="text-center">
                {person.totalCharge.toLocaleString()} Rials
              </TableCell>
              <TableCell className="text-center">
                {person.totalPayment.toLocaleString()} Rials
              </TableCell>
              <TableCell className="text-center">
                {person.balance.toLocaleString()} Rials
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );

  if (isLoadingAllShops) {
    return <LoadingComponent text="loading Shops Data" />;
  }

  if (isErrorAllShops) {
    return (
      <ErrorComponent
        error={errorAllShops}
        message={shopsData?.message || "Something Went Wrong"}
        retry={refetchAllShops}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shop Balance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shop">Select Shop</Label>
            <CustomSelect
              options={shopOptions}
              value={selectedShopId}
              onChange={setSelectedShopId}
              label="Shop"
            />
          </div>
          {isLoading && selectedShopId !== "" ? (
            <LoadingComponent text="Loading Shop Data" />
          ) : isError ? (
            <ErrorComponentSimple message="An Error Occurred" />
          ) : shopBalance ? (
            renderShopBalanceTable()
          ) : (
            <p>No balance information found for this shop.</p>
          )}
        </CardContent>
      </Card>

      {personsBalance && personsBalance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>People's Balances</CardTitle>
          </CardHeader>
          <CardContent>{renderPersonsBalanceTable()}</CardContent>
        </Card>
      )}
    </div>
  );
}
