

"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FilingLayout from '@/components/filing-layout'
import FileUpload from '@/components/ui/file-upload'
import FormDataExtractor from '@/components/form-data-extractor'
import { FORM_1099_TYPES, Form1099Union, Form1099Type } from '@/lib/types'
import type { Form1099NEC, Form1099MISC, Form1099INT, Form1099DIV, Form1099B, Form1099R, Form1099G, Form1099K } from '@/lib/types'
import { DollarSign, Plus, Trash2, Upload, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import Form1099NECComponent from './forms/form-1099-nec'
import Form1099MISCComponent from './forms/form-1099-misc'
import Form1099INTComponent from './forms/form-1099-int'
import Form1099DIVComponent from './forms/form-1099-div'
import Form1099BComponent from './forms/form-1099-b'
import Form1099RComponent from './forms/form-1099-r'
import Form1099GComponent from './forms/form-1099-g'
import Form1099KComponent from './forms/form-1099-k'

interface Form1099ClientProps {
  taxReturn: any
}

export default function Form1099Client({ taxReturn }: Form1099ClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFormType, setSelectedFormType] = useState<Form1099Type | ''>('')
  
  const [form1099s, setForm1099s] = useState<Form1099Union[]>(
    taxReturn.form1099s || []
  )

  const createEmptyForm = (formType: Form1099Type): Form1099Union => {
    const baseForm = {
      formType,
      payerName: '',
      payerTIN: '',
      payerAddress: '',
      recipientTIN: '',
      accountNumber: '',
    }

    switch (formType) {
      case 'NEC':
        return {
          ...baseForm,
          formType: 'NEC',
          boxData: {
            box1_nonemployeeComp: 0,
            box2_payer: false,
            box4_federalTax: 0,
            box5_fiscalYear: false,
            box6_directSales: 0,
            box7_stateNumber: '',
            box8_stateIncome: 0,
            box9_stateTax: 0,
          }
        }
      case 'MISC':
        return {
          ...baseForm,
          formType: 'MISC',
          boxData: {
            box1_rents: 0,
            box2_royalties: 0,
            box3_otherIncome: 0,
            box4_federalTax: 0,
            box5_fishingBoat: 0,
            box6_medical: 0,
            box7_payer: false,
            box8_substitute: 0,
            box9_directSales: 0,
            box10_cropInsurance: 0,
            box11_stateNumber: '',
            box12_stateIncome: 0,
            box13_stateTax: 0,
            box14_grossAttorney: 0,
            box15_nonqualified: 0,
          }
        }
      case 'INT':
        return {
          ...baseForm,
          formType: 'INT',
          boxData: {
            box1_interest: 0,
            box2_earlyWithdrawal: 0,
            box3_interestOnBonds: 0,
            box4_federalTax: 0,
            box5_investmentExpenses: 0,
            box6_foreignTax: 0,
            box7_foreignCountry: '',
            box8_taxExemptInterest: 0,
            box9_specifiedBond: 0,
            box10_stateNumber: '',
            box11_stateIncome: 0,
            box12_stateTax: 0,
          }
        }
      case 'DIV':
        return {
          ...baseForm,
          formType: 'DIV',
          boxData: {
            box1a_ordinaryDividends: 0,
            box1b_qualifiedDividends: 0,
            box2a_capitalGainDist: 0,
            box2b_unrecaptured: 0,
            box2c_section1202: 0,
            box2d_collectibles: 0,
            box3_nondividendDist: 0,
            box4_federalTax: 0,
            box5_investmentExpenses: 0,
            box6_foreignTax: 0,
            box7_foreignCountry: '',
            box8_cashLiquidation: 0,
            box9_noncashLiquidation: 0,
            box10_stateNumber: '',
            box11_stateIncome: 0,
            box12_stateTax: 0,
          }
        }
      case 'B':
        return {
          ...baseForm,
          formType: 'B',
          boxData: {
            box1a_description: '',
            box1b_dateAcquired: '',
            box1c_dateSold: '',
            box2_proceeds: 0,
            box3_costBasis: 0,
            box4_federalTax: 0,
            box5_description: '',
            box6_reportToIRS: false,
            box7_lossNotAllowed: false,
          }
        }
      case 'R':
        return {
          ...baseForm,
          formType: 'R',
          boxData: {
            box1_grossDistribution: 0,
            box2a_taxableAmount: 0,
            box2b_notDetermined: false,
            box3_capitalGain: 0,
            box4_federalTax: 0,
            box5_employeeContrib: 0,
            box6_netUnrealized: 0,
            box7_distributionCodes: '',
            box8_otherPercent: 0,
            box9a_yourPercent: 0,
            box9b_totalEmployee: 0,
            box10_stateDistribution: 0,
            box11_stateNumber: '',
            box12_stateTax: 0,
            box13_localDistribution: 0,
            box14_localTax: 0,
            box15_locality: '',
          }
        }
      case 'G':
        return {
          ...baseForm,
          formType: 'G',
          boxData: {
            box1_unemploymentComp: 0,
            box2_stateLocalTax: 0,
            box3_sicknessPayment: 0,
            box4_federalTax: 0,
            box5_rtaaPayments: 0,
            box6_taxableGrants: 0,
            box7_agriculture: 0,
            box8_marketGain: 0,
            box9_stateNumber: '',
            box10_stateIncome: 0,
            box11_stateTax: 0,
          }
        }
      case 'K':
        return {
          ...baseForm,
          formType: 'K',
          boxData: {
            box1a_grossAmount: 0,
            box1b_cardNotPresent: 0,
            box2_merchantCategory: '',
            box3_numberOfTransactions: 0,
            box4_federalTax: 0,
            box5a_januaryAmount: 0,
            box5b_februaryAmount: 0,
            box5c_marchAmount: 0,
            box5d_aprilAmount: 0,
            box5e_mayAmount: 0,
            box5f_juneAmount: 0,
            box5g_julyAmount: 0,
            box5h_augustAmount: 0,
            box5i_septemberAmount: 0,
            box5j_octoberAmount: 0,
            box5k_novemberAmount: 0,
            box5l_decemberAmount: 0,
            box6_stateNumber: '',
            box7_stateIncome: 0,
            box8_stateTax: 0,
          }
        }
      default:
        throw new Error(`Unsupported form type: ${formType}`)
    }
  }

  const addForm = () => {
    if (!selectedFormType) {
      toast.error('Please select a 1099 form type')
      return
    }
    
    const newForm = createEmptyForm(selectedFormType)
    setForm1099s([...form1099s, newForm])
    setSelectedFormType('')
  }

  const removeForm = (index: number) => {
    setForm1099s(form1099s.filter((_, i) => i !== index))
  }

  const updateForm = (index: number, updatedForm: Form1099Union) => {
    const updatedForms = [...form1099s]
    updatedForms[index] = updatedForm
    setForm1099s(updatedForms)
  }

  const handleFileUpload = async (index: number, file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('formType', `1099-${form1099s[index].formType.toLowerCase()}`)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload file')
      }
      
      const result = await response.json()
      
      const updatedForms = [...form1099s]
      updatedForms[index] = {
        ...updatedForms[index],
        uploadedFile: {
          name: result.originalName,
          url: result.url,
          size: result.size,
          type: result.type
        }
      }
      setForm1099s(updatedForms)
      
      toast.success('File uploaded successfully!')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleFileRemove = (index: number) => {
    const updatedForms = [...form1099s]
    updatedForms[index] = {
      ...updatedForms[index],
      uploadedFile: null
    }
    setForm1099s(updatedForms)
    toast.success('File removed')
  }

  const handleDataExtracted = (index: number, extractedData: any, formType: string) => {
    const expectedFormType = form1099s[index].formType.toLowerCase()
    const extractedFormType = formType.replace('1099-', '').toLowerCase()
    
    if (extractedFormType !== expectedFormType) {
      toast.error(`The uploaded file appears to be a ${formType.toUpperCase()} form, but you selected ${form1099s[index].formType}`)
      return
    }

    const updatedForms = [...form1099s]
    const currentForm = updatedForms[index]

    // Map extracted data to form fields based on form type
    switch (currentForm.formType) {
      case 'NEC':
        updatedForms[index] = {
          ...currentForm,
          payerName: extractedData.payerName || currentForm.payerName,
          payerTIN: extractedData.payerTIN || currentForm.payerTIN,
          payerAddress: extractedData.payerAddress || currentForm.payerAddress,
          recipientTIN: extractedData.recipientTIN || currentForm.recipientTIN,
          nonemployeeCompensation: extractedData.nonemployeeCompensation || (currentForm as any).nonemployeeCompensation,
          federalTaxWithheld: extractedData.federalTaxWithheld || (currentForm as any).federalTaxWithheld,
        } as any
        break
      case 'MISC':
        updatedForms[index] = {
          ...currentForm,
          payerName: extractedData.payerName || currentForm.payerName,
          payerTIN: extractedData.payerTIN || currentForm.payerTIN,
          rents: extractedData.rents || (currentForm as any).rents,
          royalties: extractedData.royalties || (currentForm as any).royalties,
          otherIncome: extractedData.otherIncome || (currentForm as any).otherIncome,
        } as any
        break
      case 'INT':
        updatedForms[index] = {
          ...currentForm,
          payerName: extractedData.payerName || currentForm.payerName,
          payerTIN: extractedData.payerTIN || currentForm.payerTIN,
          interestIncome: extractedData.interestIncome || (currentForm as any).interestIncome,
        } as any
        break
      case 'DIV':
        updatedForms[index] = {
          ...currentForm,
          payerName: extractedData.payerName || currentForm.payerName,
          payerTIN: extractedData.payerTIN || currentForm.payerTIN,
          ordinaryDividends: extractedData.ordinaryDividends || (currentForm as any).ordinaryDividends,
          qualifiedDividends: extractedData.qualifiedDividends || (currentForm as any).qualifiedDividends,
        } as any
        break
      default:
        // For other form types, just update payer info
        updatedForms[index] = {
          ...currentForm,
          payerName: extractedData.payerName || currentForm.payerName,
          payerTIN: extractedData.payerTIN || currentForm.payerTIN,
        }
    }

    setForm1099s(updatedForms)
  }

  const handleUseManualEntry = (index: number) => {
    // This function will be called when user chooses manual entry
    // The individual form components will handle this
  }

  const renderFormComponent = (form: Form1099Union, index: number) => {
    const onUpdate = (updatedForm: Form1099Union) => updateForm(index, updatedForm)
    const onRemove = () => removeForm(index)
    const onFileUpload = (file: File) => handleFileUpload(index, file)
    const onFileRemove = () => handleFileRemove(index)
    const onDataExtracted = (data: any, formType: string) => handleDataExtracted(index, data, formType)
    const onUseManualEntry = () => handleUseManualEntry(index)

    const commonProps = {
      onUpdate,
      onRemove,
      onFileUpload,
      onFileRemove,
      onDataExtracted,
      onUseManualEntry,
      isUploading
    }

    switch (form.formType) {
      case 'NEC':
        return (
          <Form1099NECComponent 
            key={`${form.formType}-${index}`}
            form={form as Form1099NEC}
            {...commonProps}
          />
        )
      case 'MISC':
        return (
          <Form1099MISCComponent 
            key={`${form.formType}-${index}`}
            form={form as Form1099MISC}
            {...commonProps}
          />
        )
      case 'INT':
        return (
          <Form1099INTComponent 
            key={`${form.formType}-${index}`}
            form={form as Form1099INT}
            {...commonProps}
          />
        )
      case 'DIV':
        return (
          <Form1099DIVComponent 
            key={`${form.formType}-${index}`}
            form={form as Form1099DIV}
            {...commonProps}
          />
        )
      case 'B':
        return (
          <Form1099BComponent 
            key={`${form.formType}-${index}`}
            form={form as Form1099B}
            {...commonProps}
          />
        )
      case 'R':
        return (
          <Form1099RComponent 
            key={`${form.formType}-${index}`}
            form={form as Form1099R}
            {...commonProps}
          />
        )
      case 'G':
        return (
          <Form1099GComponent 
            key={`${form.formType}-${index}`}
            form={form as Form1099G}
            {...commonProps}
          />
        )
      case 'K':
        return (
          <Form1099KComponent 
            key={`${form.formType}-${index}`}
            form={form as Form1099K}
            {...commonProps}
          />
        )
      default:
        return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Save 1099 forms
      const response = await fetch(`/api/tax-returns/${taxReturn.id}/1099-forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ form1099s }),
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

        toast.success('1099 forms saved!')
        router.push(`/filing/${taxReturn.id}/deductions`)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to save 1099 forms')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    setIsLoading(true)
    try {
      // Update tax return step to skip 1099 forms
      await fetch(`/api/tax-returns/${taxReturn.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentStep: 4 }),
      })

      toast.success('Skipped 1099 forms')
      router.push(`/filing/${taxReturn.id}/deductions`)
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
      title="1099 Forms"
      description="Add your 1099 forms for freelance, investment, and other income"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Add Form Section */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span>Add 1099 Form</span>
            </CardTitle>
            <CardDescription>
              Upload your 1099 form or manually enter the information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload 1099</span>
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Manual Entry</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4">
                <div className="text-center py-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Upload your 1099 form</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a PDF or image of any 1099 form. We'll help you extract the information.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Select
                        value={selectedFormType}
                        onValueChange={(value) => setSelectedFormType(value as Form1099Type)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select 1099 form type first" />
                        </SelectTrigger>
                        <SelectContent>
                          {FORM_1099_TYPES.map((formType) => (
                            <SelectItem key={formType.value} value={formType.value}>
                              {formType.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      onClick={addForm}
                      disabled={!selectedFormType}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Form
                    </Button>
                  </div>
                  
                  {selectedFormType && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700 mb-2">
                        <strong>Step 1:</strong> Click "Add Form" above to create a {FORM_1099_TYPES.find(t => t.value === selectedFormType)?.label} form.
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong>Step 2:</strong> Then use the upload tab in the form below to upload your document.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="manual" className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Select
                      value={selectedFormType}
                      onValueChange={(value) => setSelectedFormType(value as Form1099Type)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select 1099 form type" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORM_1099_TYPES.map((formType) => (
                          <SelectItem key={formType.value} value={formType.value}>
                            {formType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    onClick={addForm}
                    disabled={!selectedFormType}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Form
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 1099 Forms */}
        <AnimatePresence>
          {form1099s.map((form, index) => (
            <motion.div
              key={`${form.formType}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderFormComponent(form, index)}
            </motion.div>
          ))}
        </AnimatePresence>

        {form1099s.length === 0 && (
          <Card className="shadow-sm border-0">
            <CardContent className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No 1099 Forms Added</h3>
              <p className="text-gray-600 mb-4">
                Add your 1099 forms above, or skip this step if you don't have any 1099 income.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push(`/filing/${taxReturn.id}/w2-forms`)}
          >
            Previous: W-2 Forms
          </Button>
          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleSkip}
              disabled={isLoading}
            >
              Skip 1099 Forms
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save & Continue'}
            </Button>
          </div>
        </div>
      </form>
    </FilingLayout>
  )
}

