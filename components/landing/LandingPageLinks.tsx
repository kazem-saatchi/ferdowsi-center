import Link from "next/link";
import LoginButton from "@/components/LoginButton";
import { Button } from "../ui/button";
import { labels } from "@/utils/label";

function LandingPageLinks() {
  return (
    <div className="flex w-full max-w-96 flex-col items-center justify-center gap-4 px-4">
      {/* The /shops and /divar pages are not built yet; linking them led to a 404. */}
      <Button className="w-full" variant="outline" disabled>
        راهنمای مشاغل ({labels.comingSoon})
      </Button>
      <LoginButton />

      <Button className="w-full" variant="outline" disabled>
        فروش و اجاره واحدها ({labels.comingSoon})
      </Button>
      <Button className="w-full" variant="outline" asChild>
        <Link href="/contact-us">ارتباط با مدیریت</Link>
      </Button>
    </div>
  );
}

export default LandingPageLinks;
