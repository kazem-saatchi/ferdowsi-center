import React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

function UserQuickState() {
  return (
    <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Quick Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">واحدهای فعال</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Shops & offices</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">پرداخت های معوق</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$1,250</p>
              <p className="text-sm text-muted-foreground">Due this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">اطلاعیه های جدید</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">New announcements</p>
            </CardContent>
          </Card>
        </div>
      </div>
   
  )
}

export default UserQuickState