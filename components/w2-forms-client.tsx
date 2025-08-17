
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FilingLayout from '@/components/filing-layout'
import FileUpload from '@/components/ui/file-upload'
import FormDataExtractor from '@/components/form-data-extractor'
import { Building2, Plus, Trash2, DollarSign, Upload, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface W2FormsClientProps {
  taxReturn: any
}

interface W2FormData {
  id?: string
  employerName: string
  employerEIN: string
  employerAddress: string
  box1_wages: string
  box2_federal: string
  box3_social: string
  box4_socialTax: string
  box5_medicare: string
  box6_medicareTax: string
  box16_stateWages: string
  box17_stateTax: string
  box15_state: string
  uploadedFile?: {
    name: string
    url: string
    size: number
    type?: string
  } | null
}

const emptyW2Form: W2FormData = {
  employerName: '',
  employerEIN: '',
  employerAddress: '',
  box1_wages: '',
  box2_federal: '',
  box3_social: '',
  box4_socialTax: '',
  box5_medicare: '',
  box6_medicareTax: '',
  box16_stateWages: '',
  box17_stateTax: '',
  box15_state: '',
  uploadedFile: null
}

export default function W2FormsClient({ taxReturn }: W2FormsClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  const [w2Forms, setW2Forms] = useState<W2FormData[]>(
    taxReturn.w2Forms?.length > 0 
      ? taxReturn.w2Forms.map((form: any) => ({
          id: form.id,
          employerName: form.employerName || '',
          employerEIN: form.employerEIN || '',
          employerAddress: form.employerAddress || '',
          box1_wages: form.box1_wages?.toString() || '',
          box2_federal: form.box2_federal?.toString() || '',
          box3_social: form.box3_social?.toString() || '',
          box4_socialTax: form.box4_socialTax?.toString() || '',
          box5_medicare: form.box5_medicare?.toString() || '',
          box6_medicareTax: form.box6_medicareTax?.toString() || '',
          box16_stateWages: form.box16_stateWages?.toString() || '',
          box17_stateTax: form.box17_stateTax?.toString() || '',
          box15_state: form.box15_state || '',
          uploadedFile: form.uploadedFile || null
        }))
      : [emptyW2Form]
  )

  const addW2Form = () => {
    setW2Forms([...w2Forms, { ...emptyW2Form }])
  }

  const removeW2Form = (index: number) => {
    if (w2Forms.length > 1) {
      setW2Forms(w2Forms.filter((_, i) => i !== index))
    }
  }

  const updateW2Form = (index: number, field: keyof W2FormData, value: string) => {
    const updatedForms = [...w2Forms]
    updatedForms[index] = {
      ...updatedForms[index],
      [field]: value
    }
    setW2Forms(updatedForms)
  }

  const handleFileUpload = async (index: number, file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('formType', 'w2')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload file')
      }
      
      const result = await response.json()
      
      const updatedForms = [...w2Forms]
      updatedForms[index] = {
        ...updatedForms[index],
        uploadedFile: {
          name: result.originalName,
          url: result.url,
          size: result.size,
          type: result.type
        }
      }
      setW2Forms(updatedForms)
      
      toast.success('File uploaded successfully!')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleFileRemove = (index: number) => {
    const updatedForms = [...w2Forms]
    updatedForms[index] = {
      ...updatedForms[index],
      uploadedFile: null
    }
    setW2Forms(updatedForms)
    toast.success('File removed')
  }

  const handleDataExtracted = (index: number, extractedData: any, formType: string) => {
    if (formType !== 'w2') {
      toast.error('The uploaded file does not appear to be a W-2 form')
      return
    }

    const updatedForms = [...w2Forms]
    updatedForms[index] = {
      ...updatedForms[index],
      employerName: extractedData.employerName || updatedForms[index].employerName,
      employerEIN: extractedData.employerEIN || updatedForms[index].employerEIN,
      employerAddress: extractedData.employerAddress || updatedForms[index].employerAddress,
      box1_wages: extractedData.box1_wages || updatedForms[index].box1_wages,
      box2_federal: extractedData.box2_federal || updatedForms[index].box2_federal,
      box3_social: extractedData.box3_social || updatedForms[index].box3_social,
      box4_socialTax: extractedData.box4_socialTax || updatedForms[index].box4_socialTax,
      box5_medicare: extractedData.box5_medicare || updatedForms[index].box5_medicare,
      box6_medicareTax: extractedData.box6_medicareTax || updatedForms[index].box6_medicareTax,
      box15_state: extractedData.box15_state || updatedForms[index].box15_state,
      box16_stateWages: extractedData.box16_stateWages || updatedForms[index].box16_stateWages,
      box17_stateTax: extractedData.box17_stateTax || updatedForms[index].box17_stateTax,
    }
    setW2Forms(updatedForms)
  }

  const handleUseManualEntry = (index: number) => {
    // Switch to manual tab
    const tabTrigger = document.querySelector(`[data-state="active"][value="upload"]`)
    const manualTabTrigger = document.querySelector(`[value="manual"]`) as HTMLElement
    manualTabTrigger?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate that at least one W-2 form has wage information
      const hasValidW2 = w2Forms.some(form => 
        form.employerName.trim() && 
        form.box1_wages && 
        parseFloat(form.box1_wages) > 0
      )

      if (!hasValidW2) {
        toast.error('Please add at least one W-2 form with wage information')
        setIsLoading(false)
        return
      }

      // Save W-2 forms
      const response = await fetch(`/api/tax-returns/${taxReturn.id}/w2-forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          w2Forms: w2Forms.map(form => ({
            ...form,
            box1_wages: parseFloat(form.box1_wages) || 0,
            box2_federal: parseFloat(form.box2_federal) || 0,
            box3_social: parseFloat(form.box3_social) || 0,
            box4_socialTax: parseFloat(form.box4_socialTax) || 0,
            box5_medicare: parseFloat(form.box5_medicare) || 0,
            box6_medicareTax: parseFloat(form.box6_medicareTax) || 0,
            box16_stateWages: parseFloat(form.box16_stateWages) || 0,
            box17_stateTax: parseFloat(form.box17_stateTax) || 0
          }))
        }),
      })

      if (response.ok) {
        // Update tax return step
        await fetch(`/api/tax-returns/${taxReturn.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ currentStep: 3 }),
        })

        toast.success('W-2 forms saved!')
        router.push(`/filing/${taxReturn.id}/deductions`)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to save W-2 forms')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.-]+/g, ''))
    return isNaN(num) ? '0.00' : num.toFixed(2)
  }

  return (
    <FilingLayout
      currentStep={2}
      taxReturnId={taxReturn.id}
      title="W-2 Forms"
      description="Enter your employment income and tax withholding information"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <AnimatePresence>
          {w2Forms.map((w2Form, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-sm border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <CardTitle>W-2 Form {index + 1}</CardTitle>
                    </div>
                    {w2Forms.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeW2Form(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    Enter the information from your W-2 form from {w2Form.employerName || `Employer ${index + 1}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="manual" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload" className="flex items-center space-x-2">
                        <Upload className="w-4 h-4" />
                        <span>Upload W-2</span>
                      </TabsTrigger>
                      <TabsTrigger value="manual" className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Manual Entry</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upload" className="space-y-4">
                      <div className="text-center py-4">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Upload your W-2 form</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Upload a PDF or image of your W-2 form. We'll help you extract the information automatically.
                        </p>
                      </div>
                      
                      <FileUpload
                        onFileSelect={(file) => handleFileUpload(index, file)}
                        onFileRemove={() => handleFileRemove(index)}
                        formType="W-2"
                        uploadedFile={w2Form.uploadedFile}
                        className="mb-4"
                      />
                      
                      {w2Form.uploadedFile && (
                        <FormDataExtractor
                          uploadedFile={{
                            name: w2Form.uploadedFile.name,
                            url: w2Form.uploadedFile.url,
                            size: w2Form.uploadedFile.size,
                            type: w2Form.uploadedFile.type || 'application/pdf'
                          }}
                          onDataExtracted={(data, formType) => handleDataExtracted(index, data, formType)}
                          onUseManualEntry={() => handleUseManualEntry(index)}
                          className="mb-4"
                        />
                      )}
                    </TabsContent>
                    
                    <TabsContent value="manual" className="space-y-6">
                      {/* Employer Information */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-900">Employer Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`employerName-${index}`}>Employer Name *</Label>
                            <Input
                              id={`employerName-${index}`}
                              value={w2Form.employerName}
                              onChange={(e) => updateW2Form(index, 'employerName', e.target.value)}
                              required
                              placeholder="Enter employer name"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`employerEIN-${index}`}>Employer EIN</Label>
                            <Input
                              id={`employerEIN-${index}`}
                              value={w2Form.employerEIN}
                              onChange={(e) => updateW2Form(index, 'employerEIN', e.target.value)}
                              placeholder="XX-XXXXXXX"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`employerAddress-${index}`}>Employer Address</Label>
                          <Input
                            id={`employerAddress-${index}`}
                            value={w2Form.employerAddress}
                            onChange={(e) => updateW2Form(index, 'employerAddress', e.target.value)}
                            placeholder="Enter employer address"
                          />
                        </div>
                      </div>

                      {/* Income Information */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                          <DollarSign className="w-4 h-4" />
                          <span>Income & Withholding</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`box1-${index}`}>Box 1 - Wages, tips, other compensation *</Label>
                        <Input
                          id={`box1-${index}`}
                          type="number"
                          step="0.01"
                          value={w2Form.box1_wages}
                          onChange={(e) => updateW2Form(index, 'box1_wages', e.target.value)}
                          required
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`box2-${index}`}>Box 2 - Federal income tax withheld *</Label>
                        <Input
                          id={`box2-${index}`}
                          type="number"
                          step="0.01"
                          value={w2Form.box2_federal}
                          onChange={(e) => updateW2Form(index, 'box2_federal', e.target.value)}
                          required
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`box3-${index}`}>Box 3 - Social security wages</Label>
                        <Input
                          id={`box3-${index}`}
                          type="number"
                          step="0.01"
                          value={w2Form.box3_social}
                          onChange={(e) => updateW2Form(index, 'box3_social', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`box4-${index}`}>Box 4 - Social security tax withheld</Label>
                        <Input
                          id={`box4-${index}`}
                          type="number"
                          step="0.01"
                          value={w2Form.box4_socialTax}
                          onChange={(e) => updateW2Form(index, 'box4_socialTax', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`box5-${index}`}>Box 5 - Medicare wages and tips</Label>
                        <Input
                          id={`box5-${index}`}
                          type="number"
                          step="0.01"
                          value={w2Form.box5_medicare}
                          onChange={(e) => updateW2Form(index, 'box5_medicare', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`box6-${index}`}>Box 6 - Medicare tax withheld</Label>
                        <Input
                          id={`box6-${index}`}
                          type="number"
                          step="0.01"
                          value={w2Form.box6_medicareTax}
                          onChange={(e) => updateW2Form(index, 'box6_medicareTax', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* State Information */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">State Tax Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`box15-${index}`}>Box 15 - State</Label>
                        <Input
                          id={`box15-${index}`}
                          value={w2Form.box15_state}
                          onChange={(e) => updateW2Form(index, 'box15_state', e.target.value)}
                          placeholder="CA"
                          maxLength={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`box16-${index}`}>Box 16 - State wages</Label>
                        <Input
                          id={`box16-${index}`}
                          type="number"
                          step="0.01"
                          value={w2Form.box16_stateWages}
                          onChange={(e) => updateW2Form(index, 'box16_stateWages', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`box17-${index}`}>Box 17 - State income tax</Label>
                        <Input
                          id={`box17-${index}`}
                          type="number"
                          step="0.01"
                          value={w2Form.box17_stateTax}
                          onChange={(e) => updateW2Form(index, 'box17_stateTax', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                      {/* Summary for this W-2 */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Form Summary</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-blue-700">Total Wages:</span>
                            <span className="font-medium ml-2">${formatCurrency(w2Form.box1_wages)}</span>
                          </div>
                          <div>
                            <span className="text-blue-700">Federal Withheld:</span>
                            <span className="font-medium ml-2">${formatCurrency(w2Form.box2_federal)}</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Another W-2 Button */}
        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            onClick={addW2Form}
            className="border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another W-2
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push(`/filing/${taxReturn.id}/personal-info`)}
          >
            Previous: Personal Info
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </form>
    </FilingLayout>
  )
}
