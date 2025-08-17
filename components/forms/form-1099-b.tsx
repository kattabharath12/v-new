

"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FileUpload from '@/components/ui/file-upload'
import FormDataExtractor from '@/components/form-data-extractor'
import { Form1099B } from '@/lib/types'
import { Trash2, FileText, Upload } from 'lucide-react'

interface Form1099BProps {
  form: Form1099B
  onUpdate: (form: Form1099B) => void
  onRemove: () => void
  onFileUpload?: (file: File) => void
  onFileRemove?: () => void
  onDataExtracted?: (data: any, formType: string) => void
  onUseManualEntry?: () => void
  isUploading?: boolean
}

export default function Form1099BComponent({ 
  form, 
  onUpdate, 
  onRemove, 
  onFileUpload, 
  onFileRemove, 
  onDataExtracted, 
  onUseManualEntry,
  isUploading = false
}: Form1099BProps) {
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
            <FileText className="w-5 h-5 text-red-600" />
            <CardTitle>1099-B - Broker and Barter Exchange Transactions</CardTitle>
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
          From {form.payerName || 'Payer'} - Proceeds from broker and barter exchange transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload 1099-B</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Manual Entry</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="text-center py-4">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Upload your 1099-B form</h4>
              <p className="text-sm text-gray-600 mb-4">
                Upload a PDF or image of your 1099-B form. We'll help you extract the information automatically.
              </p>
            </div>
            
            <FileUpload
              onFileSelect={handleFileUpload}
              onFileRemove={handleFileRemove}
              formType="1099-B"
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
                    placeholder="Broker or barter exchange"
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
              <h4 className="text-sm font-medium text-gray-900">1099-B Box Information</h4>
              
              <div>
                <Label htmlFor="box1a">Box 1a - Description of property</Label>
                <Input
                  id="box1a"
                  value={form.boxData.box1a_description}
                  onChange={(e) => updateField('box1a_description', e.target.value)}
                  placeholder="Security name, CUSIP, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="box1b">Box 1b - Date acquired</Label>
                  <Input
                    id="box1b"
                    type="date"
                    value={form.boxData.box1b_dateAcquired}
                    onChange={(e) => updateField('box1b_dateAcquired', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="box1c">Box 1c - Date sold or disposed *</Label>
                  <Input
                    id="box1c"
                    type="date"
                    value={form.boxData.box1c_dateSold}
                    onChange={(e) => updateField('box1c_dateSold', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="box2">Box 2 - Proceeds *</Label>
                  <Input
                    id="box2"
                    type="number"
                    step="0.01"
                    value={form.boxData.box2_proceeds}
                    onChange={(e) => updateField('box2_proceeds', parseFloat(e.target.value) || 0)}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box3">Box 3 - Cost or other basis</Label>
                  <Input
                    id="box3"
                    type="number"
                    step="0.01"
                    value={form.boxData.box3_costBasis}
                    onChange={(e) => updateField('box3_costBasis', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="box5">Box 5 - Description</Label>
                  <Input
                    id="box5"
                    value={form.boxData.box5_description}
                    onChange={(e) => updateField('box5_description', e.target.value)}
                    placeholder="Additional description"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="box6"
                    checked={form.boxData.box6_reportToIRS}
                    onCheckedChange={(checked) => updateField('box6_reportToIRS', checked)}
                  />
                  <Label htmlFor="box6">Box 6 - Report to IRS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="box7"
                    checked={form.boxData.box7_lossNotAllowed}
                    onCheckedChange={(checked) => updateField('box7_lossNotAllowed', checked)}
                  />
                  <Label htmlFor="box7">Box 7 - Loss not allowed on wash sale</Label>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-red-900 mb-2">Form Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-red-700">Proceeds:</span>
                  <span className="font-medium ml-2">${form.boxData.box2_proceeds.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-red-700">Cost Basis:</span>
                  <span className="font-medium ml-2">${form.boxData.box3_costBasis.toFixed(2)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-red-700">Potential Gain/Loss:</span>
                  <span className="font-medium ml-2">
                    ${(form.boxData.box2_proceeds - form.boxData.box3_costBasis).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

