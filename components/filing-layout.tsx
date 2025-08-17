

"use client"

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { FileText, User, Building2, Receipt, Calculator, CheckCircle, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const FILING_STEPS = [
  { id: 1, title: 'Personal Info', icon: User, path: 'personal-info' },
  { id: 2, title: 'W-2 Forms', icon: Building2, path: 'w2-forms' },
  { id: 3, title: '1099 Forms', icon: DollarSign, path: '1099-forms' },
  { id: 4, title: 'Deductions', icon: Receipt, path: 'deductions' },
  { id: 5, title: 'Review', icon: Calculator, path: 'review' },
  { id: 6, title: 'Complete', icon: CheckCircle, path: 'complete' }
]

interface FilingLayoutProps {
  children: React.ReactNode
  currentStep: number
  taxReturnId: string
  title: string
  description?: string
}

export default function FilingLayout({ 
  children, 
  currentStep, 
  taxReturnId, 
  title, 
  description 
}: FilingLayoutProps) {
  const router = useRouter()
  const progress = (currentStep / FILING_STEPS.length) * 100

  const handleStepNavigation = (stepId: number) => {
    if (stepId <= currentStep) {
      const step = FILING_STEPS.find(s => s.id === stepId)
      if (step) {
        router.push(`/filing/${taxReturnId}/${step.path}`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TaxFile Pro</span>
          </div>
          
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Progress Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-lg p-6 shadow-sm border-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
              {description && (
                <p className="text-gray-600">{description}</p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Step {currentStep} of {FILING_STEPS.length}
                </span>
                <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {FILING_STEPS.map((step, index) => {
                const isActive = step.id === currentStep
                const isCompleted = step.id < currentStep
                const isAccessible = step.id <= currentStep

                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => handleStepNavigation(step.id)}
                      disabled={!isAccessible}
                      className={`
                        flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActive 
                          ? 'bg-blue-100 text-blue-600 border border-blue-200' 
                          : isCompleted 
                            ? 'text-green-600 hover:bg-green-50' 
                            : isAccessible
                              ? 'text-gray-600 hover:bg-gray-50'
                              : 'text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs
                        ${isActive 
                          ? 'bg-blue-600 text-white' 
                          : isCompleted 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }
                      `}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <step.icon className="w-4 h-4" />
                        )}
                      </div>
                      <span className="hidden md:block">{step.title}</span>
                    </button>
                    {index < FILING_STEPS.length - 1 && (
                      <div className="w-8 h-px bg-gray-200 mx-2" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}

