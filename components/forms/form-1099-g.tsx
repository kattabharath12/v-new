

"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FileUpload from '@/components/ui/file-upload'
import FormDataExtractor from '@/components/form-data-extractor'
import { Form1099G } from '@/lib/types'
import { Trash2, FileText, Upload } from 'lucide-react'

interface Form1099GProps {
  form: Form1099G
  onUpdate: (form: Form1099G) => void
  onRemove: () => void
  onFileUpload?: (file: File) => void
  onFileRemove?: () => void
  onDataExtracted?: (data: any, formType: string) => void
  onUseManualEntry?: () => void
  isUploading?: boolean
}

export default function Form1099GComponent({ 
  form, 
  onUpdate, 
  onRemove, 
  onFileUpload, 
  onFileRemove, 
  onDataExtracted, 
  onUseManualEntry,
  isUploading = false
}: Form1099GProps) {
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
            <FileText className="w-5 h-5 text-indigo-600" />
            <CardTitle>1099-G - Certain Government Payments</CardTitle>
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
          From {form.payerName || 'Payer'} - Government payments including unemployment compensation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload 1099-G</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Manual Entry</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="text-center py-4">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Upload your 1099-G form</h4>
              <p className="text-sm text-gray-600 mb-4">
                Upload a PDF or image of your 1099-G form. We'll help you extract the information automatically.
              </p>
            </div>
            
            <FileUpload
              onFileSelect={handleFileUpload}
              onFileRemove={handleFileRemove}
              formType="1099-G"
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
                    placeholder="Government agency or payer"
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
              <h4 className="text-sm font-medium text-gray-900">1099-G Box Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="box1">Box 1 - Unemployment compensation</Label>
                  <Input
                    id="box1"
                    type="number"
                    step="0.01"
                    value={form.boxData.box1_unemploymentComp}
                    onChange={(e) => updateField('box1_unemploymentComp', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box2">Box 2 - State or local income tax refunds</Label>
                  <Input
                    id="box2"
                    type="number"
                    step="0.01"
                    value={form.boxData.box2_stateLocalTax}
                    onChange={(e) => updateField('box2_stateLocalTax', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="box3">Box 3 - Sickness and injury payments</Label>
                  <Input
                    id="box3"
                    type="number"
                    step="0.01"
                    value={form.boxData.box3_sicknessPayment}
                    onChange={(e) => updateField('box3_sicknessPayment', parseFloat(e.target.value) || 0)}
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
                  <Label htmlFor="box5">Box 5 - RTAA payments</Label>
                  <Input
                    id="box5"
                    type="number"
                    step="0.01"
                    value={form.boxData.box5_rtaaPayments}
                    onChange={(e) => updateField('box5_rtaaPayments', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box6">Box 6 - Taxable grants</Label>
                  <Input
                    id="box6"
                    type="number"
                    step="0.01"
                    value={form.boxData.box6_taxableGrants}
                    onChange={(e) => updateField('box6_taxableGrants', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="box7">Box 7 - Agriculture payments</Label>
                  <Input
                    id="box7"
                    type="number"
                    step="0.01"
                    value={form.boxData.box7_agriculture}
                    onChange={(e) => updateField('box7_agriculture', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box8">Box 8 - Market gain</Label>
                  <Input
                    id="box8"
                    type="number"
                    step="0.01"
                    value={form.boxData.box8_marketGain}
                    onChange={(e) => updateField('box8_marketGain', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* State Tax Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">State Tax Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="box9">Box 9 - State number</Label>
                  <Input
                    id="box9"
                    value={form.boxData.box9_stateNumber}
                    onChange={(e) => updateField('box9_stateNumber', e.target.value)}
                    placeholder="State code"
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label htmlFor="box10">Box 10 - State income</Label>
                  <Input
                    id="box10"
                    type="number"
                    step="0.01"
                    value={form.boxData.box10_stateIncome}
                    onChange={(e) => updateField('box10_stateIncome', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box11">Box 11 - State tax withheld</Label>
                  <Input
                    id="box11"
                    type="number"
                    step="0.01"
                    value={form.boxData.box11_stateTax}
                    onChange={(e) => updateField('box11_stateTax', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-indigo-900 mb-2">Form Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-indigo-700">Unemployment Comp:</span>
                  <span className="font-medium ml-2">${form.boxData.box1_unemploymentComp.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-indigo-700">State/Local Refunds:</span>
                  <span className="font-medium ml-2">${form.boxData.box2_stateLocalTax.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

