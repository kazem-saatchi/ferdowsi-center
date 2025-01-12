"use client";

import { useEffect } from "react";
import { useGetAllShopsByPerson } from "@/tanstack/queries";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponentSimple from "@/components/ErrorComponentSimple";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MyShopsPage() {
  const { data, isLoading, isError } = useGetAllShopsByPerson();

  const { personShopsBalance, setPersonShopsBalance } = useStore(
    useShallow((state) => ({
      personShopsBalance: state.personShopsBalance,
      setPersonShopsBalance: state.setPersonShopsBalance,
    }))
  );

  useEffect(() => {
    if (data?.data) {
      setPersonShopsBalance(data.data);
    }
  }, [data, setPersonShopsBalance]);

  const renderShopsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Plaque</TableHead>
          <TableHead className="text-center">Total Shop Balance</TableHead>
          <TableHead className="text-center">My Balance</TableHead>
          <TableHead className="text-center">View Details</TableHead>
          <TableHead className="text-center">Owner</TableHead>

        </TableRow>
      </TableHeader>
      <TableBody>
        {personShopsBalance?.shops.map((shop) => {
          const shopBalance = personShopsBalance.shopsBalance.find(
            (balance) => balance.shopBalance.shopId === shop.id
          );
          const personBalance = personShopsBalance.shopsBalanceByPerson.find(
            (balance) => balance.shopId === shop.id
          );

          return (
            <TableRow key={shop.id}>
              <TableCell className="text-center">{shop.plaque}</TableCell>
              <TableCell className="text-center">
                {shopBalance
                  ? `${shopBalance.shopBalance.balance.toLocaleString()} Rials`
                  : "N/A"}
              </TableCell>
              <TableCell className="text-center">
                {personBalance
                  ? `${personBalance.balance.toLocaleString()} Rials`
                  : "N/A"}
              </TableCell>
              <TableCell className="text-center">
                <Link href={`/user/shop-detail/${shop.id}`}>
                  <Button>View</Button>
                </Link>
              </TableCell>
              <TableCell className="text-center">
                  <Badge>
                    {shop.ownerId}
                  </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  if (isLoading) {
    return <LoadingComponent text="Loading Your Shops Data" />;
  }

  if (isError) {
    return (
      <ErrorComponentSimple message="An Error Occurred While Fetching Your Shops" />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Shops and Balances</CardTitle>
      </CardHeader>
      <CardContent>
        {personShopsBalance && personShopsBalance.shops.length > 0 ? (
          renderShopsTable()
        ) : (
          <p>You don't have any shops associated with your account.</p>
        )}
      </CardContent>
    </Card>
  );
}
