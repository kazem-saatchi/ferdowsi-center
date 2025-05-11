"use client";

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
import { Badge } from "@/components/ui/badge";
import { labels } from "@/utils/label";

function UserInfoPage() {
  const { userInfo } = useStore(
    useShallow((state) => ({
      userInfo: state.userInfo,
    }))
  );

  const formatPhoneNumber = (phone: string | null) => {
    return phone || "N/A";
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>{labels.userInfo}</CardTitle>
      </CardHeader>
      <CardContent className="border rounded-lg">
        {userInfo && (
          <Table>
            <TableBody>
              <TableRow>
                <TableHead className="font-medium text-center">
                  {labels.idNumber}
                </TableHead>
                <TableCell>{userInfo.IdNumber}</TableCell>
              </TableRow>
              <TableRow>
                <TableHead className="font-medium text-center">
                  {labels.firstName}
                </TableHead>
                <TableCell>{userInfo.firstName}</TableCell>
              </TableRow>
              <TableRow>
                <TableHead className="font-medium text-center">
                  {labels.lastName}
                </TableHead>
                <TableCell>{userInfo.lastName}</TableCell>
              </TableRow>
              <TableRow>
                <TableHead className="font-medium text-center">
                  {labels.primaryPhone}
                </TableHead>
                <TableCell>{formatPhoneNumber(userInfo.phoneOne)}</TableCell>
              </TableRow>
              <TableRow>
                <TableHead className="font-medium text-center">
                  {labels.secondaryPhone}
                </TableHead>
                <TableCell>{formatPhoneNumber(userInfo.phoneTwo)}</TableCell>
              </TableRow>
              <TableRow>
                <TableHead className="font-medium text-center">
                  {labels.status}
                </TableHead>
                <TableCell>
                  <Badge
                    variant={userInfo.isActive ? "default" : "destructive"}
                  >
                    {userInfo.isActive ? labels.active : labels.inactive}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHead className="font-medium text-center">
                  {labels.role}
                </TableHead>
                <TableCell>
                  {userInfo.role === "ADMIN"
                    ? labels.admin
                    : userInfo.role === "MANAGER"
                    ? labels.manager
                    : userInfo.role === "STAFF"
                    ? labels.staff
                    : labels.user}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </div>
  );
}

export default UserInfoPage;
