import Link from "next/link";
import LoginButton from "@/components/LoginButton";
import { Button } from "../ui/button";

function LandingPageLinks() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Button className="w-96" variant="outline" asChild>
        <Link href="/shops">راهنمای مشاغل</Link>
      </Button>
      <LoginButton />

      <Button className="w-96" variant="outline" asChild>
        <Link href="/divar">فروش و اجاره واحدها</Link>
      </Button>
      <Button className="w-96" variant="outline" asChild>
        <Link href="/contact-us">ارتباط با مدیریت</Link>
      </Button>
    </div>
  );
}

export default LandingPageLinks;
