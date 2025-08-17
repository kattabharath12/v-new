
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import W2FormsClient from '@/components/w2-forms-client'

interface PageProps {
  params: {
    id: string
  }
}

export default async function W2FormsPage({ params }: PageProps) {
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
      w2Forms: true
    }
  })

  if (!taxReturn) {
    redirect('/dashboard')
  }

  return (
    <W2FormsClient 
      taxReturn={JSON.parse(JSON.stringify(taxReturn, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))}
    />
  )
}
