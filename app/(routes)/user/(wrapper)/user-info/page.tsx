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
import { roleLabel } from "@/utils/roleLabel";

function UserInfoPage() {
  const { userInfo } = useStore(
    useShallow((state) => ({
      userInfo: state.userInfo,
    }))
  );

  const formatPhoneNumber = (phone: string | null) => {
    return phone || labels.noValue;
  };


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
        { label: labels.role, value: roleLabel(userInfo.role) },
      ]
    : [];

  return (
    <div className="max-w-2xl">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle>{labels.userInfo}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
        {userInfo && (
          <>
            {/* Mobile stacked layout */}
            <div className="divide-y sm:hidden">
              {infoRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <span className="text-sm text-muted-foreground shrink-0">
                    {row.label}
                  </span>
                  <span className="text-sm font-medium text-end break-all">
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
