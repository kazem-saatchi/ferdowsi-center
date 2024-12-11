import { notFound } from 'next/navigation'
import { db } from "@/lib/db"
import { UpdatePersonForm } from '@/components/person/UpdatePersonForm'

interface UpdatePersonPageProps {
  params: { idNumber: string }
}

export default async function UpdatePersonPage({ params }: UpdatePersonPageProps) {
  const person = await db.person.findUnique({
    where: { IdNumber: params.idNumber },
  })

  if (!person) {
    notFound()
  }

  const initialData = {
    IdNumber: person.IdNumber,
    firstName: person.firstName,
    lastName: person.LastName,
    phoneOne: person.phoneOne,
    phoneTwo: person.phoneTwo || null,
    isActive: person.isActive,
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Update Person</h1>
      <UpdatePersonForm initialData={initialData} />
    </div>
  )
}

