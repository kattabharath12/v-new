
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FilingLayout from '@/components/filing-layout'
import { FILING_STATUS_OPTIONS, US_STATES } from '@/lib/types'
import { User, Users, MapPin, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

interface PersonalInfoClientProps {
  taxReturn: any
}

export default function PersonalInfoClient({ taxReturn }: PersonalInfoClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    filingStatus: taxReturn.filingStatus || 'single',
    firstName: taxReturn.personalInfo?.firstName || '',
    middleInitial: taxReturn.personalInfo?.middleInitial || '',
    lastName: taxReturn.personalInfo?.lastName || '',
    ssn: taxReturn.personalInfo?.ssn || '',
    dateOfBirth: taxReturn.personalInfo?.dateOfBirth?.split('T')[0] || '',
    occupation: taxReturn.personalInfo?.occupation || '',
    streetAddress: taxReturn.personalInfo?.streetAddress || '',
    aptNumber: taxReturn.personalInfo?.aptNumber || '',
    city: taxReturn.personalInfo?.city || '',
    state: taxReturn.personalInfo?.state || '',
    zipCode: taxReturn.personalInfo?.zipCode || '',
    // Spouse info (if married)
    spouseFirstName: taxReturn.personalInfo?.spouseFirstName || '',
    spouseMiddleInitial: taxReturn.personalInfo?.spouseMiddleInitial || '',
    spouseLastName: taxReturn.personalInfo?.spouseLastName || '',
    spouseSSN: taxReturn.personalInfo?.spouseSSN || '',
    spouseDateOfBirth: taxReturn.personalInfo?.spouseDateOfBirth?.split('T')[0] || '',
    spouseOccupation: taxReturn.personalInfo?.spouseOccupation || '',
    numDependents: taxReturn.personalInfo?.numDependents || 0
  })

  const isMarried = formData.filingStatus === 'marriedFilingJointly' || formData.filingStatus === 'marriedFilingSeparately'

  const handleChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Update filing status first
      await fetch(`/api/tax-returns/${taxReturn.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filingStatus: formData.filingStatus,
          currentStep: 2
        }),
      })

      // Save personal info
      const response = await fetch(`/api/tax-returns/${taxReturn.id}/personal-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Personal information saved!')
        router.push(`/filing/${taxReturn.id}/w2-forms`)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to save information')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FilingLayout
      currentStep={1}
      taxReturnId={taxReturn.id}
      title="Personal Information"
      description="Provide your basic taxpayer information and filing details"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Filing Status */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Filing Status</span>
            </CardTitle>
            <CardDescription>
              Select your filing status for the tax year
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="filingStatus">Filing Status</Label>
              <Select
                value={formData.filingStatus}
                onValueChange={(value) => handleChange('filingStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select filing status" />
                </SelectTrigger>
                <SelectContent>
                  {FILING_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Taxpayer Information */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Taxpayer Information</span>
            </CardTitle>
            <CardDescription>
              Enter your personal details as they appear on your Social Security card
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="middleInitial">Middle Initial</Label>
                <Input
                  id="middleInitial"
                  value={formData.middleInitial}
                  onChange={(e) => handleChange('middleInitial', e.target.value)}
                  maxLength={1}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ssn">Social Security Number *</Label>
                <Input
                  id="ssn"
                  value={formData.ssn}
                  onChange={(e) => handleChange('ssn', e.target.value)}
                  placeholder="XXX-XX-XXXX"
                  required
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spouse Information (if married) */}
        {isMarried && (
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Spouse Information</span>
              </CardTitle>
              <CardDescription>
                Enter your spouse's details as they appear on their Social Security card
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="spouseFirstName">Spouse First Name *</Label>
                  <Input
                    id="spouseFirstName"
                    value={formData.spouseFirstName}
                    onChange={(e) => handleChange('spouseFirstName', e.target.value)}
                    required={isMarried}
                  />
                </div>
                <div>
                  <Label htmlFor="spouseMiddleInitial">Spouse Middle Initial</Label>
                  <Input
                    id="spouseMiddleInitial"
                    value={formData.spouseMiddleInitial}
                    onChange={(e) => handleChange('spouseMiddleInitial', e.target.value)}
                    maxLength={1}
                  />
                </div>
                <div>
                  <Label htmlFor="spouseLastName">Spouse Last Name *</Label>
                  <Input
                    id="spouseLastName"
                    value={formData.spouseLastName}
                    onChange={(e) => handleChange('spouseLastName', e.target.value)}
                    required={isMarried}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="spouseSSN">Spouse SSN *</Label>
                  <Input
                    id="spouseSSN"
                    value={formData.spouseSSN}
                    onChange={(e) => handleChange('spouseSSN', e.target.value)}
                    placeholder="XXX-XX-XXXX"
                    required={isMarried}
                  />
                </div>
                <div>
                  <Label htmlFor="spouseDateOfBirth">Spouse Date of Birth *</Label>
                  <Input
                    id="spouseDateOfBirth"
                    type="date"
                    value={formData.spouseDateOfBirth}
                    onChange={(e) => handleChange('spouseDateOfBirth', e.target.value)}
                    required={isMarried}
                  />
                </div>
                <div>
                  <Label htmlFor="spouseOccupation">Spouse Occupation</Label>
                  <Input
                    id="spouseOccupation"
                    value={formData.spouseOccupation}
                    onChange={(e) => handleChange('spouseOccupation', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Address Information */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Address Information</span>
            </CardTitle>
            <CardDescription>
              Provide your current mailing address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="streetAddress">Street Address *</Label>
                <Input
                  id="streetAddress"
                  value={formData.streetAddress}
                  onChange={(e) => handleChange('streetAddress', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="aptNumber">Apt/Unit Number</Label>
                <Input
                  id="aptNumber"
                  value={formData.aptNumber}
                  onChange={(e) => handleChange('aptNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => handleChange('state', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dependents */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Dependents</span>
            </CardTitle>
            <CardDescription>
              Number of dependents you can claim
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="numDependents">Number of Dependents</Label>
              <Input
                id="numDependents"
                type="number"
                min="0"
                value={formData.numDependents}
                onChange={(e) => handleChange('numDependents', parseInt(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </form>
    </FilingLayout>
  )
}
