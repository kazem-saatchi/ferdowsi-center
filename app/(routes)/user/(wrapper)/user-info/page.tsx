"use client";

import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
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

  const roleLabel =
    userInfo?.role === "ADMIN"
      ? labels.admin
      : userInfo?.role === "MANAGER"
        ? labels.manager
        : userInfo?.role === "STAFF"
          ? labels.staff
          : labels.user;

  const infoRows = userInfo
    ? [
        { label: labels.idNumber, value: userInfo.IdNumber },
        { label: labels.firstName, value: userInfo.firstName },
        { label: labels.lastName, value: userInfo.lastName },
        {
          label: labels.primaryPhone,
          value: formatPhoneNumber(userInfo.phoneOne),
        },
        {
          label: labels.secondaryPhone,
          value: formatPhoneNumber(userInfo.phoneTwo),
        },
        {
          label: labels.status,
          value: (
            <Badge variant={userInfo.isActive ? "default" : "destructive"}>
              {userInfo.isActive ? labels.active : labels.inactive}
            </Badge>
          ),
        },
        { label: labels.role, value: roleLabel },
      ]
    : [];

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <CardHeader className="p-0">
        <CardTitle className="text-xl sm:text-2xl">{labels.userInfo}</CardTitle>
      </CardHeader>
      <CardContent className="border rounded-lg p-0 overflow-hidden">
        {userInfo && (
          <>
            {/* Mobile stacked layout */}
            <div className="divide-y sm:hidden">
              {infoRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <span className="text-sm text-muted-foreground shrink-0">
                    {row.label}
                  </span>
                  <span className="text-sm font-medium text-left break-all">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Desktop table layout */}
            <div className="hidden sm:block">
              <Table>
                <TableBody>
                  {infoRows.map((row) => (
                    <TableRow key={row.label}>
                      <TableHead className="font-medium text-center w-1/2">
                        {row.label}
                      </TableHead>
                      <TableCell className="text-center">{row.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </div>
  );
}

export default UserInfoPage;
