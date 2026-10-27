"use client"

import { useEffect } from "react"
import { useGetAllCosts } from "@/tanstack/query/incomeCostQuery"
import { useStore } from "@/store/store"
import { Page, PageHeader, PageTitle, PageBody } from "@/components/layout/Page"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import LoadingComponent from "@/components/LoadingComponent"
import ErrorComponent from "@/components/ErrorComponent"
import { labels } from "@/utils/label"
import { CostsTable } from "@/components/cost-income/CostTable"

export default function AllCostsPage() {
  const router = useRouter()
  const { data, isLoading, isError, error, refetch } = useGetAllCosts()
  const { allCosts, setAllCosts } = useStore((state) => ({
    allCosts: state.allCosts,
    setAllCosts: state.setAllCosts,
  }))

  useEffect(() => {
    if (data?.data?.costsList) {
      setAllCosts(data.data.costsList)
    }
  }, [data, setAllCosts])

  if (isLoading) return <LoadingComponent text={labels.loadingData} />
  if (isError) return <ErrorComponent error={error as Error} message={labels.errorOccurred} retry={refetch} />

  return (
    <Page>
      <PageHeader className="flex flex-row items-center justify-between space-y-0">
        <PageTitle>{labels.allCostsTitle}</PageTitle>
        <Button onClick={() => router.push("/admin/add-cost")}>{labels.addNewCost}</Button>
      </PageHeader>
      <PageBody>
        {allCosts && allCosts.length > 0 ? (
          <CostsTable costs={allCosts} />
        ) : (
          <p className="text-center py-4">{labels.costsNotFound}</p>
        )}
      </PageBody>
    </Page>
  )
}

