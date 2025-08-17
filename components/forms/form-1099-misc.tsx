

"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FileUpload from '@/components/ui/file-upload'
import FormDataExtractor from '@/components/form-data-extractor'
import { Form1099MISC } from '@/lib/types'
import { Trash2, FileText, Upload } from 'lucide-react'

interface Form1099MISCProps {
  form: Form1099MISC
  onUpdate: (form: Form1099MISC) => void
  onRemove: () => void
  onFileUpload?: (file: File) => void
  onFileRemove?: () => void
  onDataExtracted?: (data: any, formType: string) => void
  onUseManualEntry?: () => void
  isUploading?: boolean
}

export default function Form1099MISCComponent({ 
  form, 
  onUpdate, 
  onRemove, 
  onFileUpload, 
  onFileRemove, 
  onDataExtracted, 
  onUseManualEntry,
  isUploading = false
}: Form1099MISCProps) {
  const updateField = (field: string, value: string | number | boolean) => {
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
            <FileText className="w-5 h-5 text-green-600" />
            <CardTitle>1099-MISC - Miscellaneous Income</CardTitle>
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
          From {form.payerName || 'Payer'} - Various types of miscellaneous income
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload 1099-MISC</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Manual Entry</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="text-center py-4">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Upload your 1099-MISC form</h4>
              <p className="text-sm text-gray-600 mb-4">
                Upload a PDF or image of your 1099-MISC form. We'll help you extract the information automatically.
              </p>
            </div>
            
            <FileUpload
              onFileSelect={handleFileUpload}
              onFileRemove={handleFileRemove}
              formType="1099-MISC"
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
                    placeholder="Company or payer name"
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
                <Label htmlFor="payerAddress">Payer Address</Label>
                <Input
                  id="payerAddress"
                  value={form.payerAddress}
                  onChange={(e) => updateField('payerAddress', e.target.value)}
                  placeholder="Payer address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={form.accountNumber || ''}
                    onChange={(e) => updateField('accountNumber', e.target.value)}
                    placeholder="Optional account number"
                  />
                </div>
              </div>
            </div>

        {/* Form Data */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">1099-MISC Box Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="box1">Box 1 - Rents</Label>
              <Input
                id="box1"
                type="number"
                step="0.01"
                value={form.boxData.box1_rents}
                onChange={(e) => updateField('box1_rents', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="box2">Box 2 - Royalties</Label>
              <Input
                id="box2"
                type="number"
                step="0.01"
                value={form.boxData.box2_royalties}
                onChange={(e) => updateField('box2_royalties', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="box3">Box 3 - Other income</Label>
              <Input
                id="box3"
                type="number"
                step="0.01"
                value={form.boxData.box3_otherIncome}
                onChange={(e) => updateField('box3_otherIncome', parseFloat(e.target.value) || 0)}
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
              <Label htmlFor="box5">Box 5 - Fishing boat proceeds</Label>
              <Input
                id="box5"
                type="number"
                step="0.01"
                value={form.boxData.box5_fishingBoat}
                onChange={(e) => updateField('box5_fishingBoat', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="box6">Box 6 - Medical and health care payments</Label>
              <Input
                id="box6"
                type="number"
                step="0.01"
                value={form.boxData.box6_medical}
                onChange={(e) => updateField('box6_medical', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="box8">Box 8 - Substitute payments</Label>
              <Input
                id="box8"
                type="number"
                step="0.01"
                value={form.boxData.box8_substitute}
                onChange={(e) => updateField('box8_substitute', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="box10">Box 10 - Crop insurance proceeds</Label>
              <Input
                id="box10"
                type="number"
                step="0.01"
                value={form.boxData.box10_cropInsurance}
                onChange={(e) => updateField('box10_cropInsurance', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="box14">Box 14 - Gross proceeds paid to an attorney</Label>
              <Input
                id="box14"
                type="number"
                step="0.01"
                value={form.boxData.box14_grossAttorney}
                onChange={(e) => updateField('box14_grossAttorney', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="box15">Box 15 - Nonqualified deferred compensation</Label>
              <Input
                id="box15"
                type="number"
                step="0.01"
                value={form.boxData.box15_nonqualified}
                onChange={(e) => updateField('box15_nonqualified', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="box7"
              checked={form.boxData.box7_payer}
              onCheckedChange={(checked) => updateField('box7_payer', checked)}
            />
            <Label htmlFor="box7">Box 7 - Payer made direct sales</Label>
          </div>
        </div>

        {/* State Tax Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">State Tax Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="box11">Box 11 - State number</Label>
              <Input
                id="box11"
                value={form.boxData.box11_stateNumber}
                onChange={(e) => updateField('box11_stateNumber', e.target.value)}
                placeholder="State code"
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="box12">Box 12 - State income</Label>
              <Input
                id="box12"
                type="number"
                step="0.01"
                value={form.boxData.box12_stateIncome}
                onChange={(e) => updateField('box12_stateIncome', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="box13">Box 13 - State tax withheld</Label>
              <Input
                id="box13"
                type="number"
                step="0.01"
                value={form.boxData.box13_stateTax}
                onChange={(e) => updateField('box13_stateTax', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

            {/* Summary */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-2">Form Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-700">Total Misc Income:</span>
                  <span className="font-medium ml-2">
                    ${(form.boxData.box1_rents + form.boxData.box2_royalties + form.boxData.box3_otherIncome).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-green-700">Federal Withheld:</span>
                  <span className="font-medium ml-2">${form.boxData.box4_federalTax.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

