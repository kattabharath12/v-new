
"use client"

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText, 
  Plus, 
  LogOut, 
  User, 
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

interface DashboardClientProps {
  user: any
  taxReturns: any[]
}

export default function DashboardClient({ user, taxReturns }: DashboardClientProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateReturn = async () => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/tax-returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taxYear: new Date().getFullYear() - 1,
          filingStatus: 'single'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('New tax return created!')
        router.push(`/filing/${data.id}/personal-info`)
      } else {
        toast.error(data.error || 'Failed to create tax return')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const getStatusIcon = (isComplete: boolean, currentStep: number) => {
    if (isComplete) {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    }
    return <Clock className="w-5 h-5 text-yellow-600" />
  }

  const getStatusText = (isComplete: boolean, currentStep: number) => {
    if (isComplete) return 'Complete'
    return `Step ${currentStep} of 5`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TaxFile Pro</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{user.name || user.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-gray-600">
              Manage your tax returns and continue where you left off.
            </p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-8 shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Start New Tax Return</span>
              </CardTitle>
              <CardDescription>
                Begin filing your {new Date().getFullYear() - 1} federal tax return
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCreateReturn} disabled={isCreating} size="lg">
                {isCreating ? 'Creating...' : 'Create New Return'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tax Returns List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Your Tax Returns</h2>
          
          {taxReturns.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="text-center py-12 shadow-sm border-0">
                <CardContent>
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <CardTitle className="text-gray-600 mb-2">No Tax Returns Yet</CardTitle>
                  <CardDescription>
                    Create your first tax return to get started with filing.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              className="grid gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {taxReturns.map((taxReturn, index) => (
                <motion.div
                  key={taxReturn.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card className="shadow-sm border-0 hover:shadow-md transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle>{taxReturn.taxYear} Tax Return</CardTitle>
                            <CardDescription className="flex items-center space-x-2">
                              {getStatusIcon(taxReturn.isComplete, taxReturn.currentStep)}
                              <span>{getStatusText(taxReturn.isComplete, taxReturn.currentStep)}</span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {taxReturn.taxCalculation?.refundAmount && (
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Estimated Refund</div>
                              <div className="text-lg font-semibold text-green-600 flex items-center">
                                <DollarSign className="w-4 h-4" />
                                {Number(taxReturn.taxCalculation.refundAmount).toLocaleString()}
                              </div>
                            </div>
                          )}
                          {taxReturn.taxCalculation?.oweAmount && Number(taxReturn.taxCalculation.oweAmount) > 0 && (
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Amount Owed</div>
                              <div className="text-lg font-semibold text-red-600 flex items-center">
                                <DollarSign className="w-4 h-4" />
                                {Number(taxReturn.taxCalculation.oweAmount).toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <span>Filing Status: {taxReturn.filingStatus.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span>Updated: {new Date(taxReturn.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/filing/${taxReturn.id}/review`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          {!taxReturn.isComplete && (
                            <Button 
                              size="sm"
                              onClick={() => {
                                const stepRoutes = [
                                  'personal-info',
                                  'w2-forms', 
                                  'deductions',
                                  'review',
                                  'complete'
                                ]
                                router.push(`/filing/${taxReturn.id}/${stepRoutes[taxReturn.currentStep - 1] || 'personal-info'}`)
                              }}
                            >
                              Continue
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
