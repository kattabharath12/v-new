

"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FileUpload from '@/components/ui/file-upload'
import FormDataExtractor from '@/components/form-data-extractor'
import { Form1099K } from '@/lib/types'
import { Trash2, FileText, Upload } from 'lucide-react'

interface Form1099KProps {
  form: Form1099K
  onUpdate: (form: Form1099K) => void
  onRemove: () => void
  onFileUpload?: (file: File) => void
  onFileRemove?: () => void
  onDataExtracted?: (data: any, formType: string) => void
  onUseManualEntry?: () => void
  isUploading?: boolean
}

export default function Form1099KComponent({ 
  form, 
  onUpdate, 
  onRemove, 
  onFileUpload, 
  onFileRemove, 
  onDataExtracted, 
  onUseManualEntry,
  isUploading = false
}: Form1099KProps) {
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
            <FileText className="w-5 h-5 text-teal-600" />
            <CardTitle>1099-K - Payment Card and Third Party Network Transactions</CardTitle>
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
          From {form.payerName || 'Payer'} - Payment card and third party network transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload 1099-K</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Manual Entry</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="text-center py-4">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Upload your 1099-K form</h4>
              <p className="text-sm text-gray-600 mb-4">
                Upload a PDF or image of your 1099-K form. We'll help you extract the information automatically.
              </p>
            </div>
            
            <FileUpload
              onFileSelect={handleFileUpload}
              onFileRemove={handleFileRemove}
              formType="1099-K"
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
                    placeholder="Payment processor or payer"
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
              <h4 className="text-sm font-medium text-gray-900">1099-K Box Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="box1a">Box 1a - Gross amount of payment card transactions *</Label>
                  <Input
                    id="box1a"
                    type="number"
                    step="0.01"
                    value={form.boxData.box1a_grossAmount}
                    onChange={(e) => updateField('box1a_grossAmount', parseFloat(e.target.value) || 0)}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box1b">Box 1b - Card not present transactions</Label>
                  <Input
                    id="box1b"
                    type="number"
                    step="0.01"
                    value={form.boxData.box1b_cardNotPresent}
                    onChange={(e) => updateField('box1b_cardNotPresent', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="box2">Box 2 - Merchant category code</Label>
                  <Input
                    id="box2"
                    value={form.boxData.box2_merchantCategory}
                    onChange={(e) => updateField('box2_merchantCategory', e.target.value)}
                    placeholder="Merchant category code"
                  />
                </div>
                <div>
                  <Label htmlFor="box3">Box 3 - Number of payment transactions</Label>
                  <Input
                    id="box3"
                    type="number"
                    value={form.boxData.box3_numberOfTransactions}
                    onChange={(e) => updateField('box3_numberOfTransactions', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
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

            {/* Monthly Breakdown */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Box 5 - Monthly Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="box5a">Box 5a - January</Label>
                  <Input
                    id="box5a"
                    type="number"
                    step="0.01"
                    value={form.boxData.box5a_januaryAmount}
                    onChange={(e) => updateField('box5a_januaryAmount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box5b">Box 5b - February</Label>
                  <Input
                    id="box5b"
                    type="number"
                    step="0.01"
                    value={form.boxData.box5b_februaryAmount}
                    onChange={(e) => updateField('box5b_februaryAmount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box5c">Box 5c - March</Label>
                  <Input
                    id="box5c"
                    type="number"
                    step="0.01"
                    value={form.boxData.box5c_marchAmount}
                    onChange={(e) => updateField('box5c_marchAmount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box5d">Box 5d - April</Label>
                  <Input
                    id="box5d"
                    type="number"
                    step="0.01"
                    value={form.boxData.box5d_aprilAmount}
                    onChange={(e) => updateField('box5d_aprilAmount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box5e">Box 5e - May</Label>
                  <Input
                    id="box5e"
                    type="number"
                    step="0.01"
                    value={form.boxData.box5e_mayAmount}
                    onChange={(e) => updateField('box5e_mayAmount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box5f">Box 5f - June</Label>
                  <Input
                    id="box5f"
                    type="number"
                    step="0.01"
                    value={form.boxData.box5f_juneAmount}
                    onChange={(e) => updateField('box5f_juneAmount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box5g">Box 5g - July</Label>
                  <Input
                    id="box5g"
                    type="number"
                    step="0.01"
                    value={form.boxData.box5g_julyAmount}
                    onChange={(e) => updateField('box5g_julyAmount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box5h">Box 5h - August</Label>
                  <Input
                    id="box5h"
                    type="number"
                    step="0.01"
                    value={form.boxData.box5h_augustAmount}
                    onChange={(e) => updateField('box5h_augustAmount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box5i">Box 5i - September</Label>
                  <Input
                    id="box5i"
                    type="number"
                    step="0.01"
                    value={form.boxData.box5i_septemberAmount}
                    onChange={(e) => updateField('box5i_septemberAmount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box5j">Box 5j - October</Label>
                  <Input
                    id="box5j"
                    type="number"
                    step="0.01"
                    value={form.boxData.box5j_octoberAmount}
                    onChange={(e) => updateField('box5j_octoberAmount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box5k">Box 5k - November</Label>
                  <Input
                    id="box5k"
                    type="number"
                    step="0.01"
                    value={form.boxData.box5k_novemberAmount}
                    onChange={(e) => updateField('box5k_novemberAmount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box5l">Box 5l - December</Label>
                  <Input
                    id="box5l"
                    type="number"
                    step="0.01"
                    value={form.boxData.box5l_decemberAmount}
                    onChange={(e) => updateField('box5l_decemberAmount', parseFloat(e.target.value) || 0)}
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
                  <Label htmlFor="box6">Box 6 - State number</Label>
                  <Input
                    id="box6"
                    value={form.boxData.box6_stateNumber}
                    onChange={(e) => updateField('box6_stateNumber', e.target.value)}
                    placeholder="State code"
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label htmlFor="box7">Box 7 - State income</Label>
                  <Input
                    id="box7"
                    type="number"
                    step="0.01"
                    value={form.boxData.box7_stateIncome}
                    onChange={(e) => updateField('box7_stateIncome', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box8">Box 8 - State tax withheld</Label>
                  <Input
                    id="box8"
                    type="number"
                    step="0.01"
                    value={form.boxData.box8_stateTax}
                    onChange={(e) => updateField('box8_stateTax', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-teal-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-teal-900 mb-2">Form Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-teal-700">Gross Amount:</span>
                  <span className="font-medium ml-2">${form.boxData.box1a_grossAmount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-teal-700">Transactions:</span>
                  <span className="font-medium ml-2">{form.boxData.box3_numberOfTransactions}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

