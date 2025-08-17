
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, AlertTriangle, Eye, Edit2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface ExtractedFormData {
  formType: 'w2' | '1099-nec' | '1099-misc' | '1099-int' | '1099-div' | '1099-b' | '1099-r' | '1099-g' | '1099-k'
  confidence: number
  data: Record<string, any>
  rawText: string
}

interface FormDataExtractorProps {
  uploadedFile: {
    name: string
    url: string
    size: number
    type: string
  }
  onDataExtracted: (data: any, formType: string) => void
  onUseManualEntry: () => void
  className?: string
}

export default function FormDataExtractor({
  uploadedFile,
  onDataExtracted,
  onUseManualEntry,
  className
}: FormDataExtractorProps) {
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedFormData | null>(null)
  const [showRawText, setShowRawText] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExtractData = async () => {
    setIsExtracting(true)
    setError(null)

    try {
      const filename = uploadedFile.url.split('/').pop()
      
      console.log('Starting data extraction for:', filename)
      
      const response = await fetch('/api/extract-form-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          filename,
          fileType: uploadedFile.type
        })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Array.from(response.headers.entries()))

      let result;
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      console.log('Content-Type received:', contentType)
      
      if (contentType && contentType.includes('application/json')) {
        try {
          result = await response.json()
          console.log('JSON response parsed successfully:', result)
        } catch (parseError) {
          console.error('JSON parsing failed:', parseError)
          throw new Error('Server returned invalid JSON response')
        }
      } else {
        // If not JSON, likely an HTML error page or redirect
        const text = await response.text()
        console.error('Non-JSON response received:', text.substring(0, 500))
        
        // Check if this looks like an HTML page (authentication redirect)
        if (text.trim().startsWith('<!DOCTYPE html') || text.includes('<html')) {
          console.error('Received HTML instead of JSON - likely authentication issue')
          throw new Error('Authentication issue detected. Please refresh the page and try again.')
        }
        
        throw new Error('Server returned unexpected response format. Please try again.')
      }

      if (!response.ok) {
        throw new Error(result?.error || `Server error: ${response.status}`)
      }

      if (result.success && result.extractedData) {
        setExtractedData(result.extractedData)
        const successMessage = result.usingFallback 
          ? 'Using sample data for demonstration. Please review and edit as needed.'
          : (result.message || 'Data extracted successfully!')
        toast.success(successMessage)
      } else {
        throw new Error(result?.error || 'No data could be extracted')
      }
    } catch (error: any) {
      console.error('Error extracting data:', error)
      const errorMessage = error.message || 'Failed to extract data from the uploaded file'
      setError(errorMessage)
      
      // Provide more specific guidance based on error type
      if (errorMessage.includes('Authentication issue')) {
        toast.error('Session expired. Please refresh the page and try again.')
      } else {
        toast.error('Data extraction failed. You can still enter the information manually.')
      }
    } finally {
      setIsExtracting(false)
    }
  }

  const handleUseExtractedData = () => {
    if (extractedData) {
      onDataExtracted(extractedData.data, extractedData.formType)
      toast.success('Extracted data applied to form!')
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500'
    if (confidence >= 0.6) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.6) return 'Medium'
    return 'Low'
  }

  const formatFieldName = (key: string) => {
    const fieldNames: Record<string, string> = {
      employerName: 'Employer Name',
      employerEIN: 'Employer EIN',
      box1_wages: 'Wages (Box 1)',
      box2_federal: 'Federal Tax Withheld (Box 2)',
      box3_social: 'Social Security Wages (Box 3)',
      box4_socialTax: 'Social Security Tax (Box 4)',
      box5_medicare: 'Medicare Wages (Box 5)',
      box6_medicareTax: 'Medicare Tax (Box 6)',
      box15_state: 'State (Box 15)',
      box16_stateWages: 'State Wages (Box 16)',
      box17_stateTax: 'State Tax (Box 17)',
      payerName: 'Payer Name',
      payerTIN: 'Payer TIN',
      recipientTIN: 'Recipient TIN',
      nonemployeeCompensation: 'Nonemployee Compensation',
      federalTaxWithheld: 'Federal Tax Withheld',
      interestIncome: 'Interest Income',
      ordinaryDividends: 'Ordinary Dividends',
      qualifiedDividends: 'Qualified Dividends'
    }
    return fieldNames[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  return (
    <div className={className}>
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <span>Smart Data Extraction</span>
          </CardTitle>
          <CardDescription>
            Our AI can automatically extract tax information from your uploaded form. 
            This saves you time by pre-filling the form fields.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!extractedData && !error && (
            <div className="flex space-x-3">
              <Button 
                onClick={handleExtractData}
                disabled={isExtracting}
                className="flex-1"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extracting Data...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Extract Data from Form
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={onUseManualEntry}
                className="flex-1"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Enter Manually
              </Button>
            </div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">
                          Data extraction failed
                        </p>
                        <p className="text-sm text-orange-700 mt-1">{error}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={onUseManualEntry}
                          className="mt-3 border-orange-300 text-orange-700 hover:bg-orange-100"
                        >
                          Continue with Manual Entry
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {extractedData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-800">
                          Data Extracted from {extractedData.formType.toUpperCase()}
                        </span>
                      </CardTitle>
                      <Badge 
                        className={`${getConfidenceColor(extractedData.confidence)} text-white`}
                      >
                        {getConfidenceText(extractedData.confidence)} Confidence
                      </Badge>
                    </div>
                    <CardDescription className="text-green-700">
                      We found {Object.keys(extractedData.data).length} fields with data. 
                      Please review and confirm the extracted information below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(extractedData.data).map(([key, value]) => (
                        <div key={key} className="bg-white rounded-md p-3 border border-green-200">
                          <div className="text-xs font-medium text-green-600 uppercase tracking-wide">
                            {formatFieldName(key)}
                          </div>
                          <div className="text-sm font-mono text-gray-900 mt-1">
                            {value || 'No data'}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-3">
                      <Button 
                        onClick={handleUseExtractedData}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Use This Data
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={onUseManualEntry}
                        className="flex-1"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Manually Instead
                      </Button>
                    </div>

                    {extractedData.rawText && (
                      <div className="border-t border-green-200 pt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowRawText(!showRawText)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-100"
                        >
                          {showRawText ? 'Hide' : 'Show'} Raw Extracted Text
                        </Button>
                        <AnimatePresence>
                          {showRawText && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 p-3 bg-gray-100 rounded-md text-xs font-mono text-gray-700 max-h-32 overflow-y-auto"
                            >
                              {extractedData.rawText}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
