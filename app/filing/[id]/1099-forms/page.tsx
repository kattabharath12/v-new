

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import Form1099Client from '@/components/1099-forms-client'

interface PageProps {
  params: {
    id: string
  }
}

export default async function Form1099Page({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const taxReturn = await db.taxReturn.findUnique({
    where: {
      id: params.id,
      userId: session.user.id
    },
    include: {
      form1099s: true,
    }
  })

  if (!taxReturn) {
    redirect('/dashboard')
  }

  return <Form1099Client taxReturn={taxReturn} />
}

