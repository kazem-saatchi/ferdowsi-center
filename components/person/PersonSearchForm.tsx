'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface PersonSearchFormProps {
  onSearch: (filters: any) => void;
}

export function PersonSearchForm({ onSearch }: PersonSearchFormProps) {
  const [filters, setFilters] = useState({
    firstName: '',
    lastName: '',
    phoneOne: '',
    phoneTwo: '',
    IdNumber: '',
    isActive: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(filters)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>جستجوی اشخاص</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">نام</Label>
              <Input 
                id="firstName" 
                name="firstName" 
                value={filters.firstName} 
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">فامیلی</Label>
              <Input 
                id="lastName" 
                name="lastName" 
                value={filters.lastName} 
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phoneOne">شماره موبایل</Label>
              <Input 
                id="phoneOne" 
                name="phoneOne" 
                value={filters.phoneOne} 
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneTwo">شماره دوم</Label>
              <Input 
                id="phoneTwo" 
                name="phoneTwo" 
                value={filters.phoneTwo} 
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="IdNumber">کد ملی</Label>
            <Input 
              id="IdNumber" 
              name="IdNumber" 
              value={filters.IdNumber} 
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="isActive" 
              name="isActive" 
              checked={filters.isActive} 
              onCheckedChange={(checked) => setFilters(prev => ({ ...prev, isActive: checked as boolean }))}
            />
            <Label htmlFor="isActive">جستجوی فقط بین اشخاص فعال</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">جستجو</Button>
        </CardFooter>
      </form>
    </Card>
  )
}

