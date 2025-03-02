import Link from "next/link";
import LoginButton from "@/components/LoginButton";
import { Button } from "../ui/button";

function LandingPageLinks() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Link href="/shops">
        <Button className="w-96" variant="outline">
          راهنمای مشاغل
        </Button>
      </Link>
      <Link href="/login">
        <LoginButton />
      </Link>
      <Link href="/divar">
        <Button className="w-96" variant="outline">
          فروش و اجاره واحدها
        </Button>
      </Link>
      <Link href="/contact-us">
        <Button className="w-96" variant="outline">
          ارتباط با مدیریت
        </Button>
      </Link>
    </div>
  );
}

export default LandingPageLinks;
