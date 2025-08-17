
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import PersonalInfoClient from '@/components/personal-info-client'

interface PageProps {
  params: {
    id: string
  }
}

export default async function PersonalInfoPage({ params }: PageProps) {
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
      personalInfo: true
    }
  })

  if (!taxReturn) {
    redirect('/dashboard')
  }

  return (
    <PersonalInfoClient 
      taxReturn={JSON.parse(JSON.stringify(taxReturn, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))}
    />
  )
}
