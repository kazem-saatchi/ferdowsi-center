'use client'

import { useState } from 'react'
import { useAddChargeAllShop } from '@/tanstack/mutations'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from 'sonner'
import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import { AddChargeAllShopsData } from '@/schema/chargeSchema'
import DateObject from "react-date-object"

const CustomInput = ({ value, openCalendar, handleValueChange }: any) => {
  return (
    <Input
      onFocus={openCalendar}
      value={value}
      onChange={handleValueChange}
      readOnly
    />
  )
}

export default function AddChargesToAllShopsPage() {
  const [formData, setFormData] = useState<AddChargeAllShopsData>({
    month: '',
    title: '',
  })

  const addChargeAllShopMutation = useAddChargeAllShop()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDateChange = (date: any) => {
    if (date) {
      const persianDate = new DateObject(date).convert(persian, persian_fa)
      const formattedDate = `${persianDate.year}-${String(persianDate.month.number).padStart(2, '0')}`
      const displayDate = `${persianDate.month.name} ${persianDate.year}`
      setFormData(prev => ({
        ...prev,
        month: formattedDate
      }))
    //   return displayDate
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await addChargeAllShopMutation.mutateAsync(formData)
      
      if (result.success) {
        toast.success("Charges added successfully to all shops")
        // Reset form after successful submission
        setFormData({
          month: '',
          title: '',
        })
      } else {
        toast.error(result.message || "Failed to add charges")
      }
    } catch (error) {
      console.error('Error adding charges:', error)
      toast.error("An error occurred while adding charges")
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Add Charges to All Shops</h1>
      <Card>
        <CardHeader>
          <CardTitle>Charge Details</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                onlyMonthPicker
                onChange={handleDateChange}
                render={<CustomInput />}
                format="MMMM YYYY"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                required 
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full"
              disabled={addChargeAllShopMutation.isPending}
            >
              {addChargeAllShopMutation.isPending ? 'Adding Charges...' : 'Add Charges to All Shops'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

