

"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FileUpload from '@/components/ui/file-upload'
import FormDataExtractor from '@/components/form-data-extractor'
import { Form1099R } from '@/lib/types'
import { Trash2, FileText, Upload } from 'lucide-react'

interface Form1099RProps {
  form: Form1099R
  onUpdate: (form: Form1099R) => void
  onRemove: () => void
  onFileUpload?: (file: File) => void
  onFileRemove?: () => void
  onDataExtracted?: (data: any, formType: string) => void
  onUseManualEntry?: () => void
  isUploading?: boolean
}

export default function Form1099RComponent({ 
  form, 
  onUpdate, 
  onRemove, 
  onFileUpload, 
  onFileRemove, 
  onDataExtracted, 
  onUseManualEntry,
  isUploading = false
}: Form1099RProps) {
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
            <FileText className="w-5 h-5 text-orange-600" />
            <CardTitle>1099-R - Distributions From Pensions, Annuities, etc.</CardTitle>
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
          From {form.payerName || 'Payer'} - Distributions from retirement plans, annuities, etc.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload 1099-R</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Manual Entry</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="text-center py-4">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Upload your 1099-R form</h4>
              <p className="text-sm text-gray-600 mb-4">
                Upload a PDF or image of your 1099-R form. We'll help you extract the information automatically.
              </p>
            </div>
            
            <FileUpload
              onFileSelect={handleFileUpload}
              onFileRemove={handleFileRemove}
              formType="1099-R"
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
                    placeholder="Plan administrator or payer"
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
              <h4 className="text-sm font-medium text-gray-900">1099-R Box Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="box1">Box 1 - Gross distribution *</Label>
                  <Input
                    id="box1"
                    type="number"
                    step="0.01"
                    value={form.boxData.box1_grossDistribution}
                    onChange={(e) => updateField('box1_grossDistribution', parseFloat(e.target.value) || 0)}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box2a">Box 2a - Taxable amount</Label>
                  <Input
                    id="box2a"
                    type="number"
                    step="0.01"
                    value={form.boxData.box2a_taxableAmount}
                    onChange={(e) => updateField('box2a_taxableAmount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="box3">Box 3 - Capital gain (included in box 2a)</Label>
                  <Input
                    id="box3"
                    type="number"
                    step="0.01"
                    value={form.boxData.box3_capitalGain}
                    onChange={(e) => updateField('box3_capitalGain', parseFloat(e.target.value) || 0)}
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
                  <Label htmlFor="box5">Box 5 - Employee contributions</Label>
                  <Input
                    id="box5"
                    type="number"
                    step="0.01"
                    value={form.boxData.box5_employeeContrib}
                    onChange={(e) => updateField('box5_employeeContrib', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box6">Box 6 - Net unrealized appreciation</Label>
                  <Input
                    id="box6"
                    type="number"
                    step="0.01"
                    value={form.boxData.box6_netUnrealized}
                    onChange={(e) => updateField('box6_netUnrealized', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="box7">Box 7 - Distribution code(s)</Label>
                  <Input
                    id="box7"
                    value={form.boxData.box7_distributionCodes}
                    onChange={(e) => updateField('box7_distributionCodes', e.target.value)}
                    placeholder="1, 2, 7, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="box8">Box 8 - Other</Label>
                  <Input
                    id="box8"
                    type="number"
                    step="0.01"
                    value={form.boxData.box8_otherPercent}
                    onChange={(e) => updateField('box8_otherPercent', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="box9a">Box 9a - Your percentage</Label>
                  <Input
                    id="box9a"
                    type="number"
                    step="0.01"
                    value={form.boxData.box9a_yourPercent}
                    onChange={(e) => updateField('box9a_yourPercent', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box9b">Box 9b - Total employee contributions</Label>
                  <Input
                    id="box9b"
                    type="number"
                    step="0.01"
                    value={form.boxData.box9b_totalEmployee}
                    onChange={(e) => updateField('box9b_totalEmployee', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="box2b"
                  checked={form.boxData.box2b_notDetermined}
                  onCheckedChange={(checked) => updateField('box2b_notDetermined', checked)}
                />
                <Label htmlFor="box2b">Box 2b - Taxable amount not determined</Label>
              </div>
            </div>

            {/* State and Local Tax Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">State and Local Tax Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="box10">Box 10 - State distribution</Label>
                  <Input
                    id="box10"
                    type="number"
                    step="0.01"
                    value={form.boxData.box10_stateDistribution}
                    onChange={(e) => updateField('box10_stateDistribution', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="box13">Box 13 - Local distribution</Label>
                  <Input
                    id="box13"
                    type="number"
                    step="0.01"
                    value={form.boxData.box13_localDistribution}
                    onChange={(e) => updateField('box13_localDistribution', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="box14">Box 14 - Local tax withheld</Label>
                  <Input
                    id="box14"
                    type="number"
                    step="0.01"
                    value={form.boxData.box14_localTax}
                    onChange={(e) => updateField('box14_localTax', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="box15">Box 15 - Name of locality</Label>
                  <Input
                    id="box15"
                    value={form.boxData.box15_locality}
                    onChange={(e) => updateField('box15_locality', e.target.value)}
                    placeholder="City/locality name"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-orange-900 mb-2">Form Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-orange-700">Gross Distribution:</span>
                  <span className="font-medium ml-2">${form.boxData.box1_grossDistribution.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-orange-700">Taxable Amount:</span>
                  <span className="font-medium ml-2">${form.boxData.box2a_taxableAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

