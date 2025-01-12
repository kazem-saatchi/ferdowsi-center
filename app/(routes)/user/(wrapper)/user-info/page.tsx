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
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>User Information</CardTitle>
      </CardHeader>
      <CardContent>
        {userInfo && (
          <Table>
            <TableBody>
              <TableRow>
                <TableHead className="font-medium text-center">
                  ID Number
                </TableHead>
                <TableCell>{userInfo.IdNumber}</TableCell>
              </TableRow>
              <TableRow>
                <TableHead className="font-medium text-center">
                  First Name
                </TableHead>
                <TableCell>{userInfo.firstName}</TableCell>
              </TableRow>
              <TableRow>
                <TableHead className="font-medium text-center">
                  Last Name
                </TableHead>
                <TableCell>{userInfo.lastName}</TableCell>
              </TableRow>
              <TableRow>
                <TableHead className="font-medium text-center">
                  Primary Phone
                </TableHead>
                <TableCell>{formatPhoneNumber(userInfo.phoneOne)}</TableCell>
              </TableRow>
              <TableRow>
                <TableHead className="font-medium text-center">
                  Secondary Phone
                </TableHead>
                <TableCell>{formatPhoneNumber(userInfo.phoneTwo)}</TableCell>
              </TableRow>
              <TableRow>
                <TableHead className="font-medium text-center">
                  Status
                </TableHead>
                <TableCell>
                  <Badge
                    variant={userInfo.isActive ? "default" : "destructive"}
                  >
                    {userInfo.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableHead className="font-medium text-center">Role</TableHead>
                <TableCell>{userInfo.role}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default UserInfoPage;
