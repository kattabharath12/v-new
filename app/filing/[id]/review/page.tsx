
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import ReviewClient from '@/components/review-client'

interface PageProps {
  params: {
    id: string
  }
}

export default async function ReviewPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const taxReturn = await db.taxReturn.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    },
    include: {
      personalInfo: true,
      w2Forms: true,
      deductions: true,
      taxCalculation: true
    }
  })

  if (!taxReturn) {
    redirect('/dashboard')
  }

  return (
    <ReviewClient 
      taxReturn={JSON.parse(JSON.stringify(taxReturn, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))}
    />
  )
}
