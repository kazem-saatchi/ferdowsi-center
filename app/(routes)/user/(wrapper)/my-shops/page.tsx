"use client";

import { useEffect, useState } from "react";
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
import { labels } from "@/utils/label";
import { errorMSG } from "@/utils/messages";
import { Loader } from "lucide-react";

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

  const renderShopsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">{labels.plaque}</TableHead>
          <TableHead className="text-center">{labels.owner}</TableHead>
          <TableHead className="text-center">{labels.totalBalance}</TableHead>
          <TableHead className="text-center">{labels.myBalance}</TableHead>
          <TableHead className="text-center">{labels.viewDetail}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {personShopsBalance?.shopsOwned.map((shop) => {
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
                <Badge>{shop.ownerName}</Badge>
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
  );

  if (isLoading) {
    return <LoadingComponent text={labels.loadingData} />;
  }

  if (isError) {
    return <ErrorComponentSimple message={errorMSG.somethingWentWrong} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.myShops}</CardTitle>
      </CardHeader>
      <CardContent>
        {personShopsBalance && personShopsBalance.shopsOwned.length > 0 ? (
          renderShopsTable()
        ) : (
          <p>{labels.youDontHaveAnyShop}</p>
        )}
      </CardContent>
    </Card>
  );
}
