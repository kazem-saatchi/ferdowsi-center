import Link from 'next/link'
import LoginButton from '@/components/LoginButton'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">مجتمع تجاری فردوسی</h1>
      <Link href="/login">
      <LoginButton />
      </Link>
    </div>
  )
}

