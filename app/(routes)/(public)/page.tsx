import LandingPageLinks from "@/components/landing/LandingPageLinks"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center ">
      <div className="flex flex-row w-full">
        <div className="flex flex-col items-center justify-center w-full h-screen">
          <h1 className="text-4xl font-bold mb-8">مجتمع تجاری فردوسی</h1>
          <LandingPageLinks />
        </div>
        <div className="hidden lg:block relative w-full h-screen">
          <Image src="/images/banner.jpg" alt="Logo" fill className="object-cover" priority />
        </div>
      </div>
    </div>
  )
}

