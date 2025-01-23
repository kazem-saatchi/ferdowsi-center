import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PersonBalanceByShopData } from "@/schema/balanceSchema";
import { formatNumber } from "@/utils/formatNumber";
import {
  PersonBalanceResponce,
  ShopBalanceResponce,
} from "@/utils/calculateBalance";
import { Person } from "@prisma/client";

import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/store/store";


export function PersonBalanceDisplay() {
  const { personBalance, shopsBalance, personBalanceByShops, userInfo } =
    useStore(
      useShallow((state) => ({
        personBalance: state.personBalance,
        personBalanceByShops: state.personsBalance,
        shopsBalance: state.shopsBalance,
        userInfo: state.userInfo,
      }))
    );

  return (
    <div className="space-y-6">
      {userInfo && (
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات شخص</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">نام</TableHead>
                  <TableHead className="text-center">فامیلی</TableHead>
                  <TableHead className="text-center">شماره تماس</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-center">
                    {userInfo.firstName}
                  </TableCell>
                  <TableCell className="text-center">
                    {userInfo.lastName}
                  </TableCell>
                  <TableCell className="text-center">
                    {userInfo.phoneOne}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {personBalance && (
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات مالی شخص</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">کل هزینه‌ها</TableHead>
                  <TableHead className="text-center">کل پرداختی‌ها</TableHead>
                  <TableHead className="text-center">مانده حساب</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell
                    className={`text-center ${
                      personBalance.totalCharge < 0 && "text-red-500"
                    }`}
                  >
                    {formatNumber(personBalance.totalCharge)}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatNumber(personBalance.totalPayment)}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatNumber(personBalance.balance)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {personBalanceByShops && personBalanceByShops.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>مانده حساب شخص به تفکیک واحد</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">شماره پلاک</TableHead>
                  <TableHead className="text-center">کل هزینه‌ها</TableHead>
                  <TableHead className="text-center">کل پرداختی‌ها</TableHead>
                  <TableHead className="text-center">مانده حساب</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personBalanceByShops.map((shop) => (
                  <TableRow key={shop.shopId}>
                    <TableCell className="text-center">{shop.plaque}</TableCell>
                    <TableCell className="text-center">
                      {formatNumber(shop.totalCharge)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatNumber(shop.totalPayment)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatNumber(shop.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {shopsBalance && (
        <Card>
          <CardHeader>
            <CardTitle>جزئیات مالی واحدها</CardTitle>
          </CardHeader>
          <CardContent>
            {shopsBalance.map((shop) => (
              <div key={shop.shopId} className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  واحد شماره {shop.plaque}
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">کل هزینه‌ها</TableHead>
                      <TableHead className="text-center">
                        کل پرداختی‌ها
                      </TableHead>
                      <TableHead className="text-center">مانده حساب</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-center">
                        {formatNumber(shop.totalCharge)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatNumber(shop.totalPayment)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatNumber(shop.balance)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
