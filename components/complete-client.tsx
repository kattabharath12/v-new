
"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Download, Home, Printer, Share2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Form1040PDFGenerator from '@/components/form-1040-pdf-generator'

interface CompleteClientProps {
  taxReturn: any
}

export default function CompleteClient({ taxReturn }: CompleteClientProps) {
  const router = useRouter()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tax Filing Complete',
          text: `I've completed my ${taxReturn.taxYear} tax return with TaxFile Pro!`,
          url: window.location.origin
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.origin)
      toast.success('Link copied to clipboard!')
    }
  }

  const isRefund = taxReturn.taxCalculation?.refundAmount && parseFloat(taxReturn.taxCalculation.refundAmount) > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="mx-auto w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tax Filing Complete!
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">
            Congratulations! Your {taxReturn.taxYear} federal tax return has been successfully completed.
          </p>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {isRefund ? 'Your Tax Refund' : 'Amount Owed'}
            </h2>
            
            <div className={`text-4xl font-bold mb-2 ${
              isRefund ? 'text-green-600' : 'text-red-600'
            }`}>
              {isRefund 
                ? formatCurrency(parseFloat(taxReturn.taxCalculation.refundAmount || 0))
                : formatCurrency(parseFloat(taxReturn.taxCalculation.oweAmount || 0))
              }
            </div>

            <p className="text-sm text-gray-600">
              {isRefund 
                ? 'Expected refund amount' 
                : 'Payment due by April 15th'
              }
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="shadow-lg border-0 mb-8">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
              <CardDescription>
                Here's what you should know about your completed tax return
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isRefund ? (
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Refund Processing</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Your refund should arrive within 21 days if filing electronically</li>
                    <li>• Direct deposit is the fastest way to receive your refund</li>
                    <li>• You can track your refund status on the IRS website</li>
                  </ul>
                </div>
              ) : (
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2">Payment Information</h3>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• Payment is due by April 15th to avoid penalties</li>
                    <li>• You can pay online at IRS.gov or by phone</li>
                    <li>• Consider setting up a payment plan if needed</li>
                  </ul>
                </div>
              )}

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Important Reminders</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Keep a copy of your tax return for your records</li>
                  <li>• Save all supporting documents for at least 3 years</li>
                  <li>• Consider updating your W-4 if your tax situation changed</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="shadow-lg border-0 mb-8">
            <CardHeader>
              <CardTitle>Return Summary</CardTitle>
              <CardDescription>
                Summary of your {taxReturn.taxYear} tax return
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Taxpayer Information</h4>
                  <div className="space-y-2 text-gray-600">
                    <div>Name: {taxReturn.personalInfo?.firstName} {taxReturn.personalInfo?.lastName}</div>
                    <div>Filing Status: {taxReturn.filingStatus.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div>Tax Year: {taxReturn.taxYear}</div>
                    <div>Filed On: {new Date(taxReturn.submittedAt).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Tax Calculation</h4>
                  <div className="space-y-2 text-gray-600">
                    <div>Total Income: {formatCurrency(parseFloat(taxReturn.taxCalculation?.totalWages || 0))}</div>
                    <div>Taxable Income: {formatCurrency(parseFloat(taxReturn.taxCalculation?.taxableIncome || 0))}</div>
                    <div>Federal Tax: {formatCurrency(parseFloat(taxReturn.taxCalculation?.taxAfterCredits || 0))}</div>
                    <div>Tax Withheld: {formatCurrency(parseFloat(taxReturn.taxCalculation?.federalWithheld || 0))}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Form1040PDFGenerator taxReturn={taxReturn} />
          
          <Button
            onClick={() => router.push('/dashboard')}
            size="lg"
            variant="default"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Button
            onClick={handlePrint}
            size="lg"
            variant="outline"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Return
          </Button>
          
          <Button
            onClick={handleShare}
            size="lg"
            variant="outline"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16 text-gray-500 text-sm"
        >
          <p>Thank you for using TaxFile Pro for your tax filing needs!</p>
        </motion.div>
      </div>
    </div>
  )
}
