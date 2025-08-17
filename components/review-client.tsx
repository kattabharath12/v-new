
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import FilingLayout from '@/components/filing-layout'
import { 
  Calculator, 
  FileText, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  User,
  Building2,
  Receipt,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

interface ReviewClientProps {
  taxReturn: any
}

interface TaxSummary {
  totalWages: number
  adjustedGrossIncome: number
  deductionAmount: number
  taxableIncome: number
  taxBeforeCredits: number
  totalCredits: number
  taxAfterCredits: number
  totalPayments: number
  refundAmount: number
  oweAmount: number
}

export default function ReviewClient({ taxReturn }: ReviewClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCalculating, setIsCalculating] = useState(true)
  const [taxSummary, setTaxSummary] = useState<TaxSummary | null>(null)

  useEffect(() => {
    calculateTaxes()
  }, [])

  const calculateTaxes = async () => {
    setIsCalculating(true)
    try {
      const response = await fetch(`/api/tax-returns/${taxReturn.id}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const calculation = await response.json()
        setTaxSummary(calculation)
      } else {
        toast.error('Failed to calculate taxes')
      }
    } catch (error) {
      toast.error('Error calculating taxes')
    } finally {
      setIsCalculating(false)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/tax-returns/${taxReturn.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          currentStep: 5, 
          isComplete: true,
          submittedAt: new Date()
        }),
      })

      if (response.ok) {
        toast.success('Tax return completed successfully!')
        router.push(`/filing/${taxReturn.id}/complete`)
      } else {
        toast.error('Failed to complete tax return')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getTotalWages = () => {
    return taxReturn.w2Forms?.reduce((sum: number, w2: any) => 
      sum + parseFloat(w2.box1_wages || 0), 0) || 0
  }

  const getTotalWithheld = () => {
    return taxReturn.w2Forms?.reduce((sum: number, w2: any) => 
      sum + parseFloat(w2.box2_federal || 0), 0) || 0
  }

  if (isCalculating) {
    return (
      <FilingLayout
        currentStep={4}
        taxReturnId={taxReturn.id}
        title="Calculating Your Taxes"
        description="Please wait while we calculate your tax return..."
      >
        <Card className="shadow-sm border-0 text-center py-12">
          <CardContent>
            <Calculator className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">Computing Your Tax Return</h3>
            <p className="text-gray-600">This will just take a moment...</p>
          </CardContent>
        </Card>
      </FilingLayout>
    )
  }

  return (
    <FilingLayout
      currentStep={4}
      taxReturnId={taxReturn.id}
      title="Review & Complete"
      description="Review your tax calculation and complete your filing"
    >
      <div className="space-y-8">
        {/* Tax Result Summary */}
        {taxSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={`shadow-lg border-0 ${
              taxSummary.refundAmount > 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <CardContent className="pt-8">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-white shadow-md">
                    {taxSummary.refundAmount > 0 ? (
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    ) : (
                      <TrendingDown className="w-8 h-8 text-red-600" />
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-2 text-gray-900">
                    {taxSummary.refundAmount > 0 ? 'Tax Refund' : 'Amount Owed'}
                  </h2>
                  
                  <div className={`text-5xl font-bold mb-4 ${
                    taxSummary.refundAmount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(taxSummary.refundAmount > 0 ? taxSummary.refundAmount : taxSummary.oweAmount)}
                  </div>

                  <p className="text-gray-700 mb-6">
                    {taxSummary.refundAmount > 0 
                      ? 'Congratulations! You have a tax refund coming your way.' 
                      : 'You owe additional taxes for this tax year.'}
                  </p>

                  {taxSummary.refundAmount > 0 ? (
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full inline-block">
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      Refund Expected
                    </div>
                  ) : (
                    <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full inline-block">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      Payment Due by April 15th
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Detailed Tax Calculation */}
        {taxSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <span>Tax Calculation Breakdown</span>
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of your tax computation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
                    <span className="text-gray-700">Total Wages & Income</span>
                    <span className="font-semibold text-right">{formatCurrency(taxSummary.totalWages)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
                    <span className="text-gray-700">Adjusted Gross Income (AGI)</span>
                    <span className="font-semibold text-right">{formatCurrency(taxSummary.adjustedGrossIncome)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
                    <span className="text-gray-700">Total Deductions</span>
                    <span className="font-semibold text-right">-{formatCurrency(taxSummary.deductionAmount)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
                    <span className="text-gray-700">Taxable Income</span>
                    <span className="font-semibold text-right">{formatCurrency(taxSummary.taxableIncome)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
                    <span className="text-gray-700">Federal Tax</span>
                    <span className="font-semibold text-right">{formatCurrency(taxSummary.taxBeforeCredits)}</span>
                  </div>

                  {taxSummary.totalCredits > 0 && (
                    <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
                      <span className="text-gray-700">Tax Credits</span>
                      <span className="font-semibold text-right text-green-600">-{formatCurrency(taxSummary.totalCredits)}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 py-3 border-b-2 border-gray-300">
                    <span className="text-gray-700">Total Tax Owed</span>
                    <span className="font-semibold text-right">{formatCurrency(taxSummary.taxAfterCredits)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
                    <span className="text-gray-700">Federal Tax Withheld</span>
                    <span className="font-semibold text-right text-blue-600">{formatCurrency(taxSummary.totalPayments)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 bg-gray-50 px-4 -mx-4 rounded-lg">
                    <span className="text-lg font-semibold text-gray-900">
                      {taxSummary.refundAmount > 0 ? 'Refund Amount' : 'Amount Owed'}
                    </span>
                    <span className={`text-lg font-bold text-right ${
                      taxSummary.refundAmount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(taxSummary.refundAmount > 0 ? taxSummary.refundAmount : taxSummary.oweAmount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Return Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Return Summary</span>
              </CardTitle>
              <CardDescription>
                Overview of the information in your tax return
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Personal Info Summary */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium">Personal Information</h4>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>{taxReturn.personalInfo?.firstName} {taxReturn.personalInfo?.lastName}</div>
                    <div>Filing Status: {taxReturn.filingStatus.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div>Dependents: {taxReturn.personalInfo?.numDependents || 0}</div>
                  </div>
                </div>

                {/* W-2 Summary */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium">Employment</h4>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>{taxReturn.w2Forms?.length || 0} W-2 Form(s)</div>
                    <div>Total Wages: {formatCurrency(getTotalWages())}</div>
                    <div>Tax Withheld: {formatCurrency(getTotalWithheld())}</div>
                  </div>
                </div>

                {/* Deductions Summary */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Receipt className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium">Deductions</h4>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      {taxReturn.deductions?.useStandardDeduction ? 'Standard' : 'Itemized'} Deduction
                    </div>
                    <div>
                      Amount: {formatCurrency(
                        taxReturn.deductions?.useStandardDeduction 
                          ? parseFloat(taxReturn.deductions?.standardDeductionAmount || 0)
                          : parseFloat(taxReturn.deductions?.totalItemized || 0)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-between"
        >
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push(`/filing/${taxReturn.id}/deductions`)}
          >
            Previous: Deductions
          </Button>
          <Button onClick={handleComplete} disabled={isLoading} size="lg">
            {isLoading ? 'Completing...' : 'Complete Tax Filing'}
          </Button>
        </motion.div>
      </div>
    </FilingLayout>
  )
}
