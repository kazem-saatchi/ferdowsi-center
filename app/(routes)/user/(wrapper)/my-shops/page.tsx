"use client";

import { useEffect, useState } from "react";
import { useGetAllShopsByPerson } from "@/tanstack/query/personQuery";
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
import { labels } from "@/utils/label";
import { errorMSG } from "@/utils/messages";
import { Loader } from "lucide-react";
import { Shop } from "@prisma/client";

export default function MyShopsPage() {
  const { data, isLoading, isError } = useGetAllShopsByPerson();
  const [isLinking, setIsLinking] = useState<boolean>(false);

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

  let userShops: Shop[] = [];

  if (personShopsBalance) {
    userShops = [
      ...personShopsBalance?.shopsOwned,
      ...personShopsBalance.shopsRented,
    ];
  }

  const getShopBalances = (shopId: string) => {
    const shopBalance = personShopsBalance?.shopsBalance.find(
      (balance) => balance.shopBalance.shopId === shopId
    );
    const personBalance = personShopsBalance?.shopsBalanceByPerson.find(
      (balance) => balance.shopId === shopId
    );
    return { shopBalance, personBalance };
  };

  const renderShopsTable = () => (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">{labels.plaque}</TableHead>
            <TableHead className="text-center">{labels.type}</TableHead>
            <TableHead className="text-center">{labels.owner}</TableHead>
            <TableHead className="text-center">{labels.renter}</TableHead>
            <TableHead className="text-center">{labels.totalBalance}</TableHead>
            <TableHead className="text-center">{labels.myBalance}</TableHead>
            <TableHead className="text-center">{labels.viewDetail}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userShops.map((shop) => {
            const { shopBalance, personBalance } = getShopBalances(shop.id);

            return (
              <TableRow key={shop.id}>
                <TableCell className="text-center">{shop.plaque}</TableCell>
                <TableCell className="text-center">{shop.type}</TableCell>
                <TableCell className="text-center">
                  <Badge>{shop.ownerName}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge>{shop.renterName ?? "ندارد"}</Badge>
                </TableCell>
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
                    <Button
                      disabled={isLinking}
                      onClick={() => {
                        setIsLinking(true);
                      }}
                    >
                      {isLinking ? (
                        <Loader className="animate-spin" />
                      ) : (
                        labels.view
                      )}
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  const renderShopsCards = () => (
    <div className="grid grid-cols-1 gap-3 md:hidden">
      {userShops.map((shop) => {
        const { shopBalance, personBalance } = getShopBalances(shop.id);

        return (
          <Card key={shop.id} className="overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {labels.plaque}
                  </p>
                  <p className="text-lg font-bold">{shop.plaque}</p>
                </div>
                <Badge variant="outline">{shop.type}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">{labels.owner}</p>
                  <Badge className="max-w-full truncate">{shop.ownerName}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">{labels.renter}</p>
                  <Badge className="max-w-full truncate">
                    {shop.renterName ?? "ندارد"}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">
                    {labels.totalBalance}
                  </p>
                  <p className="font-medium break-all">
                    {shopBalance
                      ? `${shopBalance.shopBalance.balance.toLocaleString()} Rials`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">
                    {labels.myBalance}
                  </p>
                  <p className="font-medium break-all">
                    {personBalance
                      ? `${personBalance.balance.toLocaleString()} Rials`
                      : "N/A"}
                  </p>
                </div>
              </div>

              <Button asChild className="w-full" disabled={isLinking}>
                <Link
                  href={`/user/shop-detail/${shop.id}`}
                  onClick={() => setIsLinking(true)}
                >
                  {isLinking ? (
                    <Loader className="animate-spin" />
                  ) : (
                    labels.view
                  )}
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  if (isLoading) {
    return <LoadingComponent text={labels.loadingData} />;
  }

  if (isError) {
    return <ErrorComponentSimple message={errorMSG.somethingWentWrong} />;
  }

  return (
    <div className="w-full space-y-4">
      <CardHeader className="p-0">
        <CardTitle className="text-xl sm:text-2xl">{labels.myShops}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {personShopsBalance &&
        personShopsBalance.shopsOwned.length +
          personShopsBalance.shopsRented.length >
          0 ? (
          <>
            {renderShopsCards()}
            {renderShopsTable()}
          </>
        ) : (
          <p className="text-muted-foreground">{labels.youDontHaveAnyShop}</p>
        )}
      </CardContent>
    </div>
  );
}
