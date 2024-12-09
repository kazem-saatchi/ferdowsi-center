'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import addPerson from '@/app/api/actions/person/addPerson'

export default function AddPersonPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    IdNumber: '',
    firstName: '',
    lastName: '',
    phoneOne: '',
    phoneTwo: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await addPerson(formData)
      if (result.message) {
        toast.success(result.message)
        router.push('/') // Redirect to home page or a success page
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Add New Person</h2>
        <div className="mb-4">
          <Label htmlFor="IdNumber">ID Number</Label>
          <Input type="text" id="IdNumber" name="IdNumber" value={formData.IdNumber} onChange={handleChange} required />
        </div>
        <div className="mb-4">
          <Label htmlFor="firstName">First Name</Label>
          <Input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
        </div>
        <div className="mb-4">
          <Label htmlFor="lastName">Last Name</Label>
          <Input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
        </div>
        <div className="mb-4">
          <Label htmlFor="phoneOne">Primary Phone</Label>
          <Input type="tel" id="phoneOne" name="phoneOne" value={formData.phoneOne} onChange={handleChange} required />
        </div>
        <div className="mb-4">
          <Label htmlFor="phoneTwo">Secondary Phone (Optional)</Label>
          <Input type="tel" id="phoneTwo" name="phoneTwo" value={formData.phoneTwo} onChange={handleChange} />
        </div>
        <div className="mb-6">
          <Label htmlFor="password">Password</Label>
          <Input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <Button type="submit" className="w-full">Add Person</Button>
      </form>
    </div>
  )
}

