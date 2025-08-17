
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import CompleteClient from '@/components/complete-client'

interface PageProps {
  params: {
    id: string
  }
}

export default async function CompletePage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const taxReturn = await db.taxReturn.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
      isComplete: true
    },
    include: {
      personalInfo: true,
      taxCalculation: true
    }
  })

  if (!taxReturn) {
    redirect('/dashboard')
  }

  return (
    <CompleteClient 
      taxReturn={JSON.parse(JSON.stringify(taxReturn, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))}
    />
  )
}
