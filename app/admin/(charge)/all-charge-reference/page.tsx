'use client'

import { useEffect, useState } from 'react'
import { useFindAllChargesReference } from '@/tanstack/queries'
import { useStore } from '@/store/store'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from 'lucide-react'
import { ShopChargeReference } from '@prisma/client'

type SortKey = keyof ShopChargeReference;

export default function ChargeReferenceListPage() {
  const { data, isLoading, isError } = useFindAllChargesReference()
  const { allChargesReference, setAllChargesReference } = useStore()
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null)

  useEffect(() => {
    if (data?.data?.chargeList) {
      setAllChargesReference(data.data.chargeList)
    }
  }, [data, setAllChargesReference])

  const sortedChargeReferences = [...(allChargesReference || [])].sort((a, b) => {
    if (!sortConfig) return 0
    const { key, direction } = sortConfig
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (key: SortKey) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  if (isLoading) return <div>Loading charge references...</div>
  if (isError) return <div>Error loading charge references</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Charge Reference List</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('plaque')}>
                  Plaque <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('area')}>
                  Area <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('constantAmount')}>
                  Constant Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('metericAmount')}>
                  Metric Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('totalAmount')}>
                  Total Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('year')}>
                  Year <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedChargeReferences.map((reference) => (
              <TableRow key={reference.id}>
                <TableCell>{reference.plaque}</TableCell>
                <TableCell>{reference.area.toFixed(2)}</TableCell>
                <TableCell>{reference.constantAmount.toLocaleString()}</TableCell>
                <TableCell>{reference.metericAmount.toLocaleString()}</TableCell>
                <TableCell>{reference.totalAmount.toLocaleString()}</TableCell>
                <TableCell>{reference.year}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

