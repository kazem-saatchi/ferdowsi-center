'use client'

import { useState, useEffect } from 'react'
import { useFindAllShops } from '@/tanstack/queries'
import { useUpdateShopStatus } from '@/tanstack/mutations'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { CustomSelect } from '@/components/CustomSelect'
import { toast } from 'sonner'
import { useStore } from '@/store/store'
import { useShallow } from 'zustand/react/shallow'
import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"

export default function UpdateShopStatusPage() {
  const [selectedShopId, setSelectedShopId] = useState('')
  const [statusChangeDate, setStatusChangeDate] = useState<Date | null>(null)

  const { data: shopsData } = useFindAllShops()
  const updateShopStatusMutation = useUpdateShopStatus()

  const { setShopsAll, shopsAll } = useStore(
    useShallow((state) => ({
      shopsAll: state.shopsAll,
      setShopsAll: state.setshopsAll,
    }))
  )

  useEffect(() => {
    if (shopsData?.data?.shops) {
      setShopsAll(shopsData.data.shops)
    }
  }, [shopsData, setShopsAll])

  const selectedShop = shopsAll?.find(shop => shop.id === selectedShopId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShopId || !statusChangeDate) {
      toast.error('Please select a shop and provide a status change date')
      return
    }
    try {
      await updateShopStatusMutation.mutateAsync({
        shopId: selectedShopId,
        newStatus: selectedShop?.isActive ? "INACTIVATE" : "ACTIVATE",
        date: statusChangeDate.toISOString(),
      })
      toast.success(`Shop status updated successfully`)
    } catch (error) {
      console.error('Error updating shop status:', error)
      toast.error('Failed to update shop status')
    }
  }

  const shopOptions = shopsAll?.map((shop) => ({
    id: shop.id,
    label: `Shop ${shop.plaque} (Floor ${shop.floor})`,
  })) || []

  const CustomInput = ({ openCalendar, value, handleValueChange }: any) => {
    return (
      <Input
        onFocus={openCalendar}
        value={value}
        onChange={handleValueChange}
        readOnly
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Update Shop Status</h1>
      <Card>
        <CardHeader>
          <CardTitle>Change Shop Active Status</CardTitle>
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
            {selectedShop && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    value={selectedShop.ownerName}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renterName">Renter Name</Label>
                  <Input
                    id="renterName"
                    value={selectedShop.renterName || 'N/A'}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentStatus">Current Status</Label>
                  <Input
                    id="currentStatus"
                    value={selectedShop.isActive ? 'Active' : 'Inactive'}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statusChangeDate">Status Change Date</Label>
                  <DatePicker
                    calendar={persian}
                    locale={persian_fa}
                    calendarPosition="bottom-right"
                    value={statusChangeDate}
                    onChange={(date) => {
                      if (date) {
                        setStatusChangeDate(date.toDate())
                      } else {
                        setStatusChangeDate(null)
                      }
                    }}
                    render={<CustomInput />}
                    format="YYYY/MM/DD"
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={updateShopStatusMutation.isPending || !selectedShopId || !statusChangeDate}
            >
              {updateShopStatusMutation.isPending
                ? 'Updating Status...'
                : selectedShop?.isActive
                ? 'Deactivate Shop'
                : 'Activate Shop'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

