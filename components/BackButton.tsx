"use client"

import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface BackButtonProps {
  className?: string
}

export function BackButton({ className }: BackButtonProps) {
  const router = useRouter()

  return (
    <Button variant="ghost" onClick={() => router.back()} className={className} size="icon">
      <ArrowRight className="h-5 w-5" />
      <span className="sr-only">بازگشت</span>
    </Button>
  )
}

