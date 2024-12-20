'use client'

import { useState } from 'react'
import { useFindAllShops, usePersonsByShop } from '@/tanstack/queries'
import { useAddShopHistory } from '@/tanstack/mutations'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'
import { CustomSelect } from '@/components/CustomSelect'

export default function AddShopHistoryPage() {
  const [selectedShopId, setSelectedShopId] = useState('')
  const [selectedPersonId, setSelectedPersonId] = useState('')
  const [formData, setFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
  })

  const { data: shopsData, isLoading: isLoadingShops } = useFindAllShops()
  const { data: personsData, isLoading: isLoadingPersons } = usePersonsByShop(selectedShopId)
  const addShopHistoryMutation = useAddShopHistory()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShopId || !selectedPersonId) {
      toast.error('Please select a shop and a person')
      return
    }
    try {
      await addShopHistoryMutation.mutateAsync({
        shopId: selectedShopId,
        personId: selectedPersonId,
        type: formData.type as 'ownership' | 'activePeriod' | 'deactivePeriod' | 'rental',
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      })
      // Reset form after successful submission
      setSelectedShopId('')
      setSelectedPersonId('')
      setFormData({
        type: '',
        startDate: '',
        endDate: '',
      })
    } catch (error) {
      console.error('Error adding shop history:', error)
    }
  }

  const shopOptions = shopsData?.data && shopsData?.data.shops.map(shop => ({
    id: shop.id,
    label: `Shop ${shop.plaque} (Floor ${shop.floor})`
  })) || []

  const personOptions = personsData?.data && personsData?.data.persons.map(person => ({
    id: person.id,
    label: `${person.firstName} ${person.lastName} (${person.IdNumber})`
  })) || []

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Add Shop History</h1>
      <Card>
        <CardHeader>
          <CardTitle>Shop History Details</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shop">Shop</Label>
              <CustomSelect
                options={shopOptions}
                value={selectedShopId}
                onChange={setSelectedShopId}
                label="Shop"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="person">Person</Label>
              <CustomSelect
                options={personOptions}
                value={selectedPersonId}
                onChange={setSelectedPersonId}
                label="Person"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" value={formData.type} onValueChange={(value) => handleChange({ target: { name: 'type', value } } as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ownership">Ownership</SelectItem>
                  <SelectItem value="activePeriod">Active Period</SelectItem>
                  <SelectItem value="deactivePeriod">Deactive Period</SelectItem>
                  <SelectItem value="rental">Rental</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input 
                id="startDate" 
                name="startDate" 
                type="date"
                value={formData.startDate} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input 
                id="endDate" 
                name="endDate" 
                type="date"
                value={formData.endDate} 
                onChange={handleChange} 
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full"
              disabled={addShopHistoryMutation.isPending || !selectedShopId || !selectedPersonId}
            >
              {addShopHistoryMutation.isPending ? 'Adding History...' : 'Add Shop History'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

