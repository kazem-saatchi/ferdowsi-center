import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Instagram,
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { BackButton } from "@/components/BackButton";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with us through our various contact channels.",
};

export default function ContactPage() {
  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 md:px-6 lg:py-24">
      <div className="space-y-8 md:space-y-12">
        {/* Header Section */}
        <div className="relative">
          <BackButton className="absolute right-0 top-0" />
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              ارتباط با ما
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
              ما اینجا هستیم تا به شما کمک کنیم و به هر سؤالی که ممکن است داشته
              باشید پاسخ دهیم. منتظر شنیدن از شما هستیم.
            </p>
          </div>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Phone Card */}
          <Card className="group relative overflow-hidden">
            <CardContent className="p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">شماره تماس</h3>
                  <p className="text-muted-foreground">
                    همه روزه به جز ایام تعطیل
                  </p>
                  <p className="font-medium">
                    <a
                      href="tel:+1234567890"
                      className="hover:text-primary transition-colors"
                    >
                      +98 (028) 33333333
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Card */}
          <Card className="group relative overflow-hidden">
            <CardContent className="p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">آدرس</h3>
                  <p className="text-muted-foreground">به ما سر بزنید</p>
                  <p className="font-medium">
                    قزوین، خیابان فردوسی
                    <br />
                    قبل از سه راه شهرداری
                    <br />
                    حجتمع تجاری-اداری فردوسی
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instagram Card */}
          <Card className="group relative overflow-hidden">
            <CardContent className="p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Instagram className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">اینستاگرام</h3>
                  <p className="text-muted-foreground">
                    ما را در شبکه های اجتماعی دنبال کنید
                  </p>
                  <Link
                    href="https://instagram.com/ferdowsi.center"
                    target="_blank"
                    className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <span>@ferdowsi.center</span>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Hours Section */}
        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">ساعات کاری</h3>
                <p className="text-muted-foreground">
                  تیم ما در ساعات زیر آماده‌ی کمک به شما است
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">دوشنبه - جمعه</span>
                    <span className="text-muted-foreground">
                      ۹:۰۰ صبح - ۵:۰۰ عصر
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">شنبه</span>
                    <span className="text-muted-foreground">
                      ۱۰:۰۰ صبح - ۲:۰۰ بعدازظهر
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">یکشنبه</span>
                    <span className="text-muted-foreground">تعطیل</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Section */}
        <Card>
          <CardContent className="p-0">
            <div className="aspect-[16/9] md:aspect-[21/9] w-full bg-muted relative overflow-hidden rounded-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d201.04472812321882!2d50.005625048012064!3d36.270681812989984!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2snl!4v1740935437475!5m2!1sen!2snl"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
                className="absolute inset-0"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
