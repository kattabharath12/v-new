

"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FileUpload from '@/components/ui/file-upload'
import FormDataExtractor from '@/components/form-data-extractor'
import { Form1099INT } from '@/lib/types'
import { Trash2, FileText, Upload } from 'lucide-react'

interface Form1099INTProps {
  form: Form1099INT
  onUpdate: (form: Form1099INT) => void
  onRemove: () => void
  onFileUpload?: (file: File) => void
  onFileRemove?: () => void
  onDataExtracted?: (data: any, formType: string) => void
  onUseManualEntry?: () => void
  isUploading?: boolean
}

export default function Form1099INTComponent({ 
  form, 
  onUpdate, 
  onRemove, 
  onFileUpload, 
  onFileRemove, 
  onDataExtracted, 
  onUseManualEntry,
  isUploading = false
}: Form1099INTProps) {
  const updateField = (field: string, value: string | number) => {
    if (field.startsWith('box')) {
      onUpdate({
        ...form,
        boxData: {
          ...form.boxData,
          [field]: value
        }
      })
    } else {
      onUpdate({
        ...form,
        [field]: value
      })
    }
  }

  const handleFileUpload = (file: File) => {
    if (onFileUpload) {
      onFileUpload(file)
    }
  }
  
  const handleFileRemove = () => {
    if (onFileRemove) {
      onFileRemove()
    }
  }

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-yellow-600" />
            <CardTitle>1099-INT - Interest Income</CardTitle>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>
          From {form.payerName || 'Payer'} - Interest income from banks, investments, etc.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload 1099-INT</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Manual Entry</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="text-center py-4">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Upload your 1099-INT form</h4>
              <p className="text-sm text-gray-600 mb-4">
                Upload a PDF or image of your 1099-INT form. We'll help you extract the information automatically.
              </p>
            </div>
            
            <FileUpload
              onFileSelect={handleFileUpload}
              onFileRemove={handleFileRemove}
              formType="1099-INT"
              uploadedFile={form.uploadedFile}
              className="mb-4"
            />
            
            {form.uploadedFile && onDataExtracted && onUseManualEntry && (
              <FormDataExtractor
                uploadedFile={{
                  name: form.uploadedFile.name,
                  url: form.uploadedFile.url,
                  size: form.uploadedFile.size,
                  type: form.uploadedFile.type || 'application/pdf'
                }}
                onDataExtracted={onDataExtracted}
                onUseManualEntry={onUseManualEntry}
                className="mb-4"
              />
            )}
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-6">
            {/* Payer Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Payer Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payerName">Payer Name *</Label>
                  <Input
                    id="payerName"
                    value={form.payerName}
                    onChange={(e) => updateField('payerName', e.target.value)}
                    required
                    placeholder="Bank or financial institution"
                  />
                </div>
                <div>
                  <Label htmlFor="payerTIN">Payer TIN/EIN *</Label>
                  <Input
                    id="payerTIN"
                    value={form.payerTIN}
                    onChange={(e) => updateField('payerTIN', e.target.value)}
                    required
                    placeholder="XX-XXXXXXX"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="recipientTIN">Your TIN/SSN *</Label>
                <Input
                  id="recipientTIN"
                  value={form.recipientTIN}
                  onChange={(e) => updateField('recipientTIN', e.target.value)}
                  required
                  placeholder="XXX-XX-XXXX"
                />
              </div>
            </div>

        {/* Form Data */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">1099-INT Box Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="box1">Box 1 - Interest income *</Label>
              <Input
                id="box1"
                type="number"
                step="0.01"
                value={form.boxData.box1_interest}
                onChange={(e) => updateField('box1_interest', parseFloat(e.target.value) || 0)}
                required
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="box2">Box 2 - Early withdrawal penalty</Label>
              <Input
                id="box2"
                type="number"
                step="0.01"
                value={form.boxData.box2_earlyWithdrawal}
                onChange={(e) => updateField('box2_earlyWithdrawal', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="box3">Box 3 - Interest on U.S. Savings Bonds</Label>
              <Input
                id="box3"
                type="number"
                step="0.01"
                value={form.boxData.box3_interestOnBonds}
                onChange={(e) => updateField('box3_interestOnBonds', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="box4">Box 4 - Federal income tax withheld</Label>
              <Input
                id="box4"
                type="number"
                step="0.01"
                value={form.boxData.box4_federalTax}
                onChange={(e) => updateField('box4_federalTax', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="box5">Box 5 - Investment expenses</Label>
              <Input
                id="box5"
                type="number"
                step="0.01"
                value={form.boxData.box5_investmentExpenses}
                onChange={(e) => updateField('box5_investmentExpenses', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="box6">Box 6 - Foreign tax paid</Label>
              <Input
                id="box6"
                type="number"
                step="0.01"
                value={form.boxData.box6_foreignTax}
                onChange={(e) => updateField('box6_foreignTax', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="box7">Box 7 - Foreign country</Label>
              <Input
                id="box7"
                value={form.boxData.box7_foreignCountry}
                onChange={(e) => updateField('box7_foreignCountry', e.target.value)}
                placeholder="Country name"
              />
            </div>
            <div>
              <Label htmlFor="box8">Box 8 - Tax-exempt interest</Label>
              <Input
                id="box8"
                type="number"
                step="0.01"
                value={form.boxData.box8_taxExemptInterest}
                onChange={(e) => updateField('box8_taxExemptInterest', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="box9">Box 9 - Specified private activity bond interest</Label>
            <Input
              id="box9"
              type="number"
              step="0.01"
              value={form.boxData.box9_specifiedBond}
              onChange={(e) => updateField('box9_specifiedBond', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* State Tax Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">State Tax Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="box10">Box 10 - State number</Label>
              <Input
                id="box10"
                value={form.boxData.box10_stateNumber}
                onChange={(e) => updateField('box10_stateNumber', e.target.value)}
                placeholder="State code"
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="box11">Box 11 - State income</Label>
              <Input
                id="box11"
                type="number"
                step="0.01"
                value={form.boxData.box11_stateIncome}
                onChange={(e) => updateField('box11_stateIncome', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="box12">Box 12 - State tax withheld</Label>
              <Input
                id="box12"
                type="number"
                step="0.01"
                value={form.boxData.box12_stateTax}
                onChange={(e) => updateField('box12_stateTax', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

            {/* Summary */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">Form Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-yellow-700">Taxable Interest:</span>
                  <span className="font-medium ml-2">${form.boxData.box1_interest.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-yellow-700">Tax-Exempt Interest:</span>
                  <span className="font-medium ml-2">${form.boxData.box8_taxExemptInterest.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

