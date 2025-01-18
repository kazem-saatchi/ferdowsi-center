import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, UserPlus, DollarSign, CreditCard } from 'lucide-react'

export default function AdminMainPage() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">خوش آمدید</h1>
      <p className="mb-8 text-lg">
        به پنل مدیریت خوش آمدید. در اینجا لینک‌های سریع به بخش‌های مهم را مشاهده می‌کنید:
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="ml-2" />
              افزودن مغازه
            </CardTitle>
            <CardDescription>ثبت مغازه جدید در سیستم</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              در این بخش می‌توانید اطلاعات مغازه‌های جدید را وارد کرده و به سیستم اضافه کنید. شامل مشخصات مغازه، مالک و مستاجر.
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/add-shop">رفتن به صفحه افزودن مغازه</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="ml-2" />
              افزودن شخص
            </CardTitle>
            <CardDescription>ثبت شخص جدید در سیستم</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              در این قسمت می‌توانید اطلاعات افراد جدید را ثبت کنید. این شامل مالکان، مستاجران و سایر افراد مرتبط با مغازه‌ها می‌شود.
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/add-person">رفتن به صفحه افزودن شخص</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="ml-2" />
              ثبت شارژ
            </CardTitle>
            <CardDescription>ثبت هزینه جدید برای مغازه یا شخص</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              در این بخش می‌توانید هزینه‌های مربوط به مغازه‌ها یا اشخاص را ثبت کنید. این شامل اجاره، شارژ و سایر هزینه‌های مرتبط می‌شود.
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/add-charge-by-amount">رفتن به صفحه ثبت هزینه</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="ml-2" />
              ثبت پرداخت
            </CardTitle>
            <CardDescription>ثبت پرداخت جدید در سیستم</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              در این قسمت می‌توانید پرداخت‌های انجام شده توسط مستاجران یا مالکان را ثبت کنید. این شامل پرداخت اجاره، شارژ و سایر هزینه‌ها می‌شود.
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/add-payment">رفتن به صفحه ثبت پرداخت</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

