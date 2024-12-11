import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Ferdowsi Department Store</h1>
      <Link href="/login">
        <Button size="lg">Login</Button>
      </Link>
    </div>
  )
}

