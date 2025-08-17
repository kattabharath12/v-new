
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import DashboardClient from '@/components/dashboard-client'

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Fetch user's tax returns
  const taxReturns = await db.taxReturn.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      personalInfo: true,
      w2Forms: true,
      deductions: true,
      taxCalculation: true
    },
    orderBy: {
      taxYear: 'desc'
    }
  })

  return (
    <DashboardClient 
      user={session.user} 
      taxReturns={JSON.parse(JSON.stringify(taxReturns, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))} 
    />
  )
}
