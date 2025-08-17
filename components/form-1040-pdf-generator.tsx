
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileText, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface Form1040PDFGeneratorProps {
  taxReturn: any
}

export default function Form1040PDFGenerator({ taxReturn }: Form1040PDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)
    
    try {
      // Create the Form 1040 HTML content
      const htmlContent = createForm1040HTML(taxReturn)
      
      // Create a temporary div to hold the HTML content
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlContent
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '0'
      tempDiv.style.width = '8.5in'
      tempDiv.style.background = 'white'
      tempDiv.style.padding = '0.5in'
      document.body.appendChild(tempDiv)

      // Wait for fonts and styles to load
      await new Promise(resolve => setTimeout(resolve, 100))

      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: tempDiv.scrollWidth,
        height: tempDiv.scrollHeight
      })

      // Remove the temporary div
      document.body.removeChild(tempDiv)

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Save the PDF
      const fileName = `Form_1040_${taxReturn.taxYear}_${taxReturn.personalInfo?.lastName || 'Tax_Return'}.pdf`
      pdf.save(fileName)
      
      toast.success('Form 1040 PDF downloaded successfully!')

    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const createForm1040HTML = (taxReturn: any) => {
    const personalInfo = taxReturn.personalInfo
    const taxCalc = taxReturn.taxCalculation
    const w2Forms = taxReturn.w2Forms || []
    const form1099s = taxReturn.form1099s || []
    const deductions = taxReturn.deductions

    // Calculate totals
    const totalWages = w2Forms.reduce((sum: number, w2: any) => 
      sum + parseFloat(w2.box1_wages || 0), 0)
    const totalWithheld = w2Forms.reduce((sum: number, w2: any) => 
      sum + parseFloat(w2.box2_federal || 0), 0)
    const total1099Income = form1099s.reduce((sum: number, f1099: any) => 
      sum + parseFloat(f1099.boxData?.income || 0), 0)

    return `
      <div style="font-family: Arial, sans-serif; font-size: 11px; line-height: 1.3; color: #000; max-width: 100%;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 2px solid #000; padding: 10px 0; margin-bottom: 20px;">
          <h1 style="font-size: 18px; font-weight: bold; margin: 0;">U.S. Individual Income Tax Return</h1>
          <h2 style="font-size: 14px; margin: 5px 0 0 0;">Form 1040 - Tax Year ${taxReturn.taxYear}</h2>
        </div>

        <!-- Personal Information -->
        <div style="border: 1px solid #000; padding: 10px; margin: 15px 0;">
          <div style="font-weight: bold; background: #f0f0f0; padding: 5px; margin: -10px -10px 10px -10px;">Filing Information</div>
          <div style="margin: 5px 0;"><strong>Name:</strong> ${personalInfo?.firstName || ''} ${personalInfo?.lastName || ''}</div>
          <div style="margin: 5px 0;"><strong>Filing Status:</strong> ${taxReturn.filingStatus?.replace(/([A-Z])/g, ' $1').trim() || ''}</div>
          <div style="margin: 5px 0;"><strong>Number of Dependents:</strong> ${personalInfo?.numDependents || 0}</div>
        </div>

        <!-- Income Section -->
        <div style="border: 1px solid #000; padding: 10px; margin: 15px 0;">
          <div style="font-weight: bold; background: #f0f0f0; padding: 5px; margin: -10px -10px 10px -10px;">Income</div>
          
          <div style="display: flex; justify-content: space-between; margin: 3px 0; padding: 2px 0;">
            <span style="font-weight: bold; width: 20px;">1</span>
            <span style="flex: 1; margin: 0 10px;">Wages, salaries, tips (from W-2 forms)</span>
            <span style="width: 120px; text-align: right; border-bottom: 1px solid #000; padding: 2px 5px;">
              $${totalWages.toLocaleString('en-US', {minimumFractionDigits: 2})}
            </span>
          </div>
          
          ${total1099Income > 0 ? `
          <div style="display: flex; justify-content: space-between; margin: 3px 0; padding: 2px 0;">
            <span style="font-weight: bold; width: 20px;">2</span>
            <span style="flex: 1; margin: 0 10px;">Other income (from 1099 forms)</span>
            <span style="width: 120px; text-align: right; border-bottom: 1px solid #000; padding: 2px 5px;">
              $${total1099Income.toLocaleString('en-US', {minimumFractionDigits: 2})}
            </span>
          </div>
          ` : ''}
          
          <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 4px 0; font-weight: bold; background: #f9f9f9;">
            <span style="font-weight: bold; width: 20px;">11</span>
            <span style="flex: 1; margin: 0 10px;">Adjusted Gross Income (AGI)</span>
            <span style="width: 120px; text-align: right; border-bottom: 1px solid #000; padding: 2px 5px;">
              $${parseFloat(taxCalc?.adjustedGrossIncome || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
            </span>
          </div>
        </div>

        <!-- Deductions -->
        <div style="border: 1px solid #000; padding: 10px; margin: 15px 0;">
          <div style="font-weight: bold; background: #f0f0f0; padding: 5px; margin: -10px -10px 10px -10px;">Standard Deduction and Taxable Income</div>
          
          <div style="display: flex; justify-content: space-between; margin: 3px 0; padding: 2px 0;">
            <span style="font-weight: bold; width: 20px;">12</span>
            <span style="flex: 1; margin: 0 10px;">${deductions?.useStandardDeduction ? 'Standard' : 'Itemized'} Deduction</span>
            <span style="width: 120px; text-align: right; border-bottom: 1px solid #000; padding: 2px 5px;">
              $${parseFloat(taxCalc?.deductionAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
            </span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 4px 0; font-weight: bold; background: #f9f9f9;">
            <span style="font-weight: bold; width: 20px;">15</span>
            <span style="flex: 1; margin: 0 10px;">Taxable Income</span>
            <span style="width: 120px; text-align: right; border-bottom: 1px solid #000; padding: 2px 5px;">
              $${parseFloat(taxCalc?.taxableIncome || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
            </span>
          </div>
        </div>

        <!-- Tax and Credits -->
        <div style="border: 1px solid #000; padding: 10px; margin: 15px 0;">
          <div style="font-weight: bold; background: #f0f0f0; padding: 5px; margin: -10px -10px 10px -10px;">Tax and Credits</div>
          
          <div style="display: flex; justify-content: space-between; margin: 3px 0; padding: 2px 0;">
            <span style="font-weight: bold; width: 20px;">16</span>
            <span style="flex: 1; margin: 0 10px;">Tax (from tax table or computation worksheet)</span>
            <span style="width: 120px; text-align: right; border-bottom: 1px solid #000; padding: 2px 5px;">
              $${parseFloat(taxCalc?.taxBeforeCredits || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
            </span>
          </div>
          
          ${parseFloat(taxCalc?.totalCredits || 0) > 0 ? `
          <div style="display: flex; justify-content: space-between; margin: 3px 0; padding: 2px 0;">
            <span style="font-weight: bold; width: 20px;">19</span>
            <span style="flex: 1; margin: 0 10px;">Child tax credit and credit for other dependents</span>
            <span style="width: 120px; text-align: right; border-bottom: 1px solid #000; padding: 2px 5px;">
              $${parseFloat(taxCalc?.totalCredits || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
            </span>
          </div>
          ` : ''}
          
          <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 4px 0; font-weight: bold; background: #f9f9f9;">
            <span style="font-weight: bold; width: 20px;">24</span>
            <span style="flex: 1; margin: 0 10px;">Total Tax</span>
            <span style="width: 120px; text-align: right; border-bottom: 1px solid #000; padding: 2px 5px;">
              $${parseFloat(taxCalc?.taxAfterCredits || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
            </span>
          </div>
        </div>

        <!-- Payments -->
        <div style="border: 1px solid #000; padding: 10px; margin: 15px 0;">
          <div style="font-weight: bold; background: #f0f0f0; padding: 5px; margin: -10px -10px 10px -10px;">Payments</div>
          
          <div style="display: flex; justify-content: space-between; margin: 3px 0; padding: 2px 0;">
            <span style="font-weight: bold; width: 20px;">25</span>
            <span style="flex: 1; margin: 0 10px;">Federal income tax withheld from W-2s and 1099s</span>
            <span style="width: 120px; text-align: right; border-bottom: 1px solid #000; padding: 2px 5px;">
              $${totalWithheld.toLocaleString('en-US', {minimumFractionDigits: 2})}
            </span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 4px 0; font-weight: bold; background: #f9f9f9;">
            <span style="font-weight: bold; width: 20px;">33</span>
            <span style="flex: 1; margin: 0 10px;">Total Payments</span>
            <span style="width: 120px; text-align: right; border-bottom: 1px solid #000; padding: 2px 5px;">
              $${parseFloat(taxCalc?.totalPayments || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
            </span>
          </div>
        </div>

        <!-- Refund or Amount Owed -->
        <div style="border: 1px solid #000; padding: 10px; margin: 15px 0;">
          <div style="font-weight: bold; background: #f0f0f0; padding: 5px; margin: -10px -10px 10px -10px;">Refund or Amount You Owe</div>
          
          ${parseFloat(taxCalc?.refundAmount || 0) > 0 ? `
          <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 4px 0; font-weight: bold; background: #e8f5e8;">
            <span style="font-weight: bold; width: 20px;">34</span>
            <span style="flex: 1; margin: 0 10px;">Amount Overpaid (Refund)</span>
            <span style="width: 120px; text-align: right; border-bottom: 1px solid #000; padding: 2px 5px;">
              $${parseFloat(taxCalc?.refundAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
            </span>
          </div>
          ` : `
          <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 4px 0; font-weight: bold; background: #f5e8e8;">
            <span style="font-weight: bold; width: 20px;">37</span>
            <span style="flex: 1; margin: 0 10px;">Amount You Owe</span>
            <span style="width: 120px; text-align: right; border-bottom: 1px solid #000; padding: 2px 5px;">
              $${parseFloat(taxCalc?.oweAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
            </span>
          </div>
          `}
        </div>

        <!-- Signature Section -->
        <div style="border-top: 2px solid #000; padding-top: 15px; margin-top: 30px;">
          <div style="font-weight: bold; margin-bottom: 10px;">Sign Here</div>
          <p style="margin: 10px 0;"><strong>Under penalties of perjury, I declare that I have examined this return and accompanying schedules and statements, and to the best of my knowledge and belief, they are true, correct, and complete.</strong></p>
          
          <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <div style="width: 45%;">
              <div style="border-bottom: 1px solid #000; height: 25px; margin: 10px 0;"></div>
              <small>Your signature</small>
            </div>
            <div style="width: 20%;">
              <div style="border-bottom: 1px solid #000; height: 25px; margin: 10px 0;"></div>
              <small>Date</small>
            </div>
            <div style="width: 25%;">
              <div style="border-bottom: 1px solid #000; height: 25px; margin: 10px 0;"></div>
              <small>Your occupation</small>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 10px;">
          <p>Form 1040 (${taxReturn.taxYear}) - Generated on ${new Date().toLocaleDateString()}</p>
          <p>This is a computer-generated form. Please review all information for accuracy.</p>
        </div>
      </div>
    `
  }

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      size="lg"
      className="bg-blue-600 hover:bg-blue-700"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Download Form 1040 PDF
        </>
      )}
    </Button>
  )
}
