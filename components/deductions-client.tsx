
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import FilingLayout from '@/components/filing-layout'
import { Receipt, Calculator, TrendingUp, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import { loadTaxData, getStandardDeduction } from '@/lib/tax-calculator'

interface DeductionsClientProps {
  taxReturn: any
}

export default function DeductionsClient({ taxReturn }: DeductionsClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [standardDeductionAmount, setStandardDeductionAmount] = useState(0)
  
  const [formData, setFormData] = useState({
    useStandardDeduction: taxReturn.deductions?.useStandardDeduction ?? true,
    medicalExpenses: taxReturn.deductions?.medicalExpenses?.toString() || '',
    stateLocalTaxes: taxReturn.deductions?.stateLocalTaxes?.toString() || '',
    mortgageInterest: taxReturn.deductions?.mortgageInterest?.toString() || '',
    charitableGifts: taxReturn.deductions?.charitableGifts?.toString() || '',
    otherDeductions: taxReturn.deductions?.otherDeductions?.toString() || '',
    iraContributions: taxReturn.deductions?.iraContributions?.toString() || '',
    studentLoanInterest: taxReturn.deductions?.studentLoanInterest?.toString() || '',
    hsa_contributions: taxReturn.deductions?.hsa_contributions?.toString() || ''
  })

  useEffect(() => {
    // Load tax data and calculate standard deduction
    const loadStandardDeduction = async () => {
      try {
        const taxData = await loadTaxData()
        const standardAmount = getStandardDeduction(taxReturn.filingStatus, taxData)
        setStandardDeductionAmount(standardAmount)
      } catch (error) {
        console.error('Error loading tax data:', error)
      }
    }
    
    loadStandardDeduction()
  }, [taxReturn.filingStatus])

  const handleChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const calculateItemizedTotal = () => {
    const values = [
      parseFloat(formData.medicalExpenses) || 0,
      parseFloat(formData.stateLocalTaxes) || 0,
      parseFloat(formData.mortgageInterest) || 0,
      parseFloat(formData.charitableGifts) || 0,
      parseFloat(formData.otherDeductions) || 0
    ]
    return values.reduce((sum, val) => sum + val, 0)
  }

  const itemizedTotal = calculateItemizedTotal()
  const recommendStandard = standardDeductionAmount > itemizedTotal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Save deductions
      const response = await fetch(`/api/tax-returns/${taxReturn.id}/deductions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          standardDeductionAmount,
          totalItemized: itemizedTotal,
          medicalExpenses: parseFloat(formData.medicalExpenses) || 0,
          stateLocalTaxes: parseFloat(formData.stateLocalTaxes) || 0,
          mortgageInterest: parseFloat(formData.mortgageInterest) || 0,
          charitableGifts: parseFloat(formData.charitableGifts) || 0,
          otherDeductions: parseFloat(formData.otherDeductions) || 0,
          iraContributions: parseFloat(formData.iraContributions) || 0,
          studentLoanInterest: parseFloat(formData.studentLoanInterest) || 0,
          hsa_contributions: parseFloat(formData.hsa_contributions) || 0
        }),
      })

      if (response.ok) {
        // Update tax return step
        await fetch(`/api/tax-returns/${taxReturn.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ currentStep: 4 }),
        })

        toast.success('Deductions saved!')
        router.push(`/filing/${taxReturn.id}/review`)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to save deductions')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FilingLayout
      currentStep={3}
      taxReturnId={taxReturn.id}
      title="Deductions"
      description="Choose between standard and itemized deductions to maximize your tax savings"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Deduction Choice */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <span>Deduction Options</span>
            </CardTitle>
            <CardDescription>
              We'll help you choose the option that gives you the largest deduction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Standard vs Itemized Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Standard Deduction */}
              <div className={`
                p-6 border rounded-lg cursor-pointer transition-all
                ${formData.useStandardDeduction 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => handleChange('useStandardDeduction', true)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`
                    w-4 h-4 rounded-full border-2 mt-1 flex-shrink-0
                    ${formData.useStandardDeduction 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                    }
                  `}>
                    {formData.useStandardDeduction && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Standard Deduction</h3>
                    <p className="text-2xl font-bold text-green-600 mb-2">
                      ${standardDeductionAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      No need to itemize. This is the standard amount for your filing status.
                    </p>
                    {recommendStandard && (
                      <div className="mt-3 flex items-center text-sm text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span className="font-medium">Recommended</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Itemized Deduction */}
              <div className={`
                p-6 border rounded-lg cursor-pointer transition-all
                ${!formData.useStandardDeduction 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => handleChange('useStandardDeduction', false)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`
                    w-4 h-4 rounded-full border-2 mt-1 flex-shrink-0
                    ${!formData.useStandardDeduction 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                    }
                  `}>
                    {!formData.useStandardDeduction && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Itemized Deductions</h3>
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      ${itemizedTotal.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      List specific deductions. Choose this if your itemized total exceeds the standard deduction.
                    </p>
                    {!recommendStandard && itemizedTotal > 0 && (
                      <div className="mt-3 flex items-center text-sm text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span className="font-medium">Better Option</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Itemized Deductions Form */}
        {!formData.useStandardDeduction && (
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <span>Itemized Deductions</span>
              </CardTitle>
              <CardDescription>
                Enter your deductible expenses for the tax year
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="medicalExpenses">Medical & Dental Expenses</Label>
                  <Input
                    id="medicalExpenses"
                    type="number"
                    step="0.01"
                    value={formData.medicalExpenses}
                    onChange={(e) => handleChange('medicalExpenses', e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Expenses exceeding 7.5% of your AGI
                  </p>
                </div>

                <div>
                  <Label htmlFor="stateLocalTaxes">State & Local Taxes (SALT)</Label>
                  <Input
                    id="stateLocalTaxes"
                    type="number"
                    step="0.01"
                    value={formData.stateLocalTaxes}
                    onChange={(e) => handleChange('stateLocalTaxes', e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Limited to $10,000 total
                  </p>
                </div>

                <div>
                  <Label htmlFor="mortgageInterest">Mortgage Interest</Label>
                  <Input
                    id="mortgageInterest"
                    type="number"
                    step="0.01"
                    value={formData.mortgageInterest}
                    onChange={(e) => handleChange('mortgageInterest', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="charitableGifts">Charitable Contributions</Label>
                  <Input
                    id="charitableGifts"
                    type="number"
                    step="0.01"
                    value={formData.charitableGifts}
                    onChange={(e) => handleChange('charitableGifts', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="otherDeductions">Other Itemized Deductions</Label>
                  <Input
                    id="otherDeductions"
                    type="number"
                    step="0.01"
                    value={formData.otherDeductions}
                    onChange={(e) => handleChange('otherDeductions', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Itemized Total Display */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-900">Total Itemized Deductions:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${itemizedTotal.toLocaleString()}
                  </span>
                </div>
                {recommendStandard && (
                  <p className="text-sm text-blue-700 mt-2">
                    💡 The standard deduction (${standardDeductionAmount.toLocaleString()}) is still larger. 
                    Consider using the standard deduction instead.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Above-the-Line Deductions */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span>Above-the-Line Deductions</span>
            </CardTitle>
            <CardDescription>
              These deductions reduce your Adjusted Gross Income (available with both standard and itemized deductions)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="iraContributions">IRA Contributions</Label>
                <Input
                  id="iraContributions"
                  type="number"
                  step="0.01"
                  value={formData.iraContributions}
                  onChange={(e) => handleChange('iraContributions', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="studentLoanInterest">Student Loan Interest</Label>
                <Input
                  id="studentLoanInterest"
                  type="number"
                  step="0.01"
                  value={formData.studentLoanInterest}
                  onChange={(e) => handleChange('studentLoanInterest', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="hsa_contributions">HSA Contributions</Label>
                <Input
                  id="hsa_contributions"
                  type="number"
                  step="0.01"
                  value={formData.hsa_contributions}
                  onChange={(e) => handleChange('hsa_contributions', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deduction Summary */}
        <Card className="shadow-sm border-0 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Your Total Deduction Amount
              </h3>
              <div className="text-3xl font-bold text-green-600">
                ${(formData.useStandardDeduction ? standardDeductionAmount : itemizedTotal).toLocaleString()}
              </div>
              <p className="text-sm text-green-700 mt-2">
                {formData.useStandardDeduction ? 'Standard Deduction' : 'Itemized Deductions'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push(`/filing/${taxReturn.id}/w2-forms`)}
          >
            Previous: W-2 Forms
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </form>
    </FilingLayout>
  )
}
