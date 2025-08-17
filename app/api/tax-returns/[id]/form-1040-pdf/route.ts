
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Temporarily bypass authentication for development to match other endpoints
    // TODO: Implement proper client-side authentication  
    const userId = "temp-user-id";

    // Get the tax return data
    const taxReturn = await db.taxReturn.findFirst({
      where: {
        id: params.id,
        userId: userId,
        isComplete: true
      },
      include: {
        personalInfo: true,
        w2Forms: true,
        form1099s: true,
        deductions: true,
        taxCalculation: true
      }
    })

    if (!taxReturn) {
      return NextResponse.json({ error: 'Tax return not found' }, { status: 404 })
    }

    // Generate the HTML for Form 1040
    const html = generateForm1040HTML(taxReturn)

    // Return the HTML that can be used for display or converted to PDF on the client side
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="Form_1040_${taxReturn.taxYear}.html"`
      }
    })

  } catch (error) {
    console.error('Error generating Form 1040 PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

function generateForm1040HTML(taxReturn: any): string {
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
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Form 1040 - ${taxReturn.taxYear}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            font-size: 11px; 
            line-height: 1.2; 
            margin: 0; 
            padding: 20px;
            color: #000;
        }
        .form-container { 
            max-width: 8.5in; 
            margin: 0 auto; 
            background: white;
        }
        .form-header { 
            text-align: center; 
            border-bottom: 2px solid #000; 
            padding: 10px 0; 
            margin-bottom: 20px;
        }
        .form-title { 
            font-size: 18px; 
            font-weight: bold; 
            margin: 0;
        }
        .form-subtitle { 
            font-size: 12px; 
            margin: 5px 0 0 0;
        }
        .section { 
            margin: 15px 0; 
            border: 1px solid #000;
            padding: 10px;
        }
        .section-title { 
            font-weight: bold; 
            font-size: 12px; 
            margin-bottom: 10px;
            background: #f0f0f0;
            padding: 5px;
            margin: -10px -10px 10px -10px;
        }
        .line-item { 
            display: flex; 
            justify-content: space-between; 
            margin: 3px 0;
            padding: 2px 0;
        }
        .line-number { 
            font-weight: bold; 
            width: 30px;
        }
        .line-description { 
            flex: 1; 
            margin: 0 10px;
        }
        .line-amount { 
            width: 120px; 
            text-align: right; 
            border-bottom: 1px solid #000;
            padding: 2px 5px;
        }
        .total-line { 
            font-weight: bold; 
            background: #f9f9f9;
            margin: 5px 0;
        }
        .signature-section { 
            margin-top: 30px; 
            border-top: 2px solid #000; 
            padding-top: 15px;
        }
        .signature-line { 
            border-bottom: 1px solid #000; 
            margin: 10px 0; 
            height: 25px;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .form-container { max-width: none; }
        }
    </style>
</head>
<body>
    <div class="form-container">
        <div class="form-header">
            <h1 class="form-title">U.S. Individual Income Tax Return</h1>
            <h2 class="form-subtitle">Form 1040 - Tax Year ${taxReturn.taxYear}</h2>
        </div>

        <!-- Personal Information Section -->
        <div class="section">
            <div class="section-title">Filing Information</div>
            <div class="line-item">
                <span class="line-description"><strong>Name:</strong> ${personalInfo?.firstName || ''} ${personalInfo?.lastName || ''}</span>
            </div>
            <div class="line-item">
                <span class="line-description"><strong>Filing Status:</strong> ${taxReturn.filingStatus?.replace(/([A-Z])/g, ' $1').trim() || ''}</span>
            </div>
            <div class="line-item">
                <span class="line-description"><strong>Number of Dependents:</strong> ${personalInfo?.numDependents || 0}</span>
            </div>
        </div>

        <!-- Income Section -->
        <div class="section">
            <div class="section-title">Income</div>
            <div class="line-item">
                <span class="line-number">1</span>
                <span class="line-description">Wages, salaries, tips (from W-2 forms)</span>
                <span class="line-amount">$${totalWages.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            ${total1099Income > 0 ? `
            <div class="line-item">
                <span class="line-number">2</span>
                <span class="line-description">Other income (from 1099 forms)</span>
                <span class="line-amount">$${total1099Income.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            ` : ''}
            <div class="line-item total-line">
                <span class="line-number">3</span>
                <span class="line-description">Total Income</span>
                <span class="line-amount">$${parseFloat(taxCalc?.totalWages || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="line-item total-line">
                <span class="line-number">11</span>
                <span class="line-description">Adjusted Gross Income (AGI)</span>
                <span class="line-amount">$${parseFloat(taxCalc?.adjustedGrossIncome || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
        </div>

        <!-- Deductions Section -->
        <div class="section">
            <div class="section-title">Standard Deduction and Taxable Income</div>
            <div class="line-item">
                <span class="line-number">12</span>
                <span class="line-description">${deductions?.useStandardDeduction ? 'Standard' : 'Itemized'} Deduction</span>
                <span class="line-amount">$${parseFloat(taxCalc?.deductionAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="line-item total-line">
                <span class="line-number">15</span>
                <span class="line-description">Taxable Income</span>
                <span class="line-amount">$${parseFloat(taxCalc?.taxableIncome || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
        </div>

        <!-- Tax and Credits Section -->
        <div class="section">
            <div class="section-title">Tax and Credits</div>
            <div class="line-item">
                <span class="line-number">16</span>
                <span class="line-description">Tax (from tax table or Tax Computation Worksheet)</span>
                <span class="line-amount">$${parseFloat(taxCalc?.taxBeforeCredits || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            ${parseFloat(taxCalc?.totalCredits || 0) > 0 ? `
            <div class="line-item">
                <span class="line-number">19</span>
                <span class="line-description">Child tax credit and credit for other dependents</span>
                <span class="line-amount">$${parseFloat(taxCalc?.totalCredits || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            ` : ''}
            <div class="line-item total-line">
                <span class="line-number">24</span>
                <span class="line-description">Total Tax</span>
                <span class="line-amount">$${parseFloat(taxCalc?.taxAfterCredits || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
        </div>

        <!-- Payments Section -->
        <div class="section">
            <div class="section-title">Payments</div>
            <div class="line-item">
                <span class="line-number">25</span>
                <span class="line-description">Federal income tax withheld from W-2s and 1099s</span>
                <span class="line-amount">$${totalWithheld.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="line-item total-line">
                <span class="line-number">33</span>
                <span class="line-description">Total Payments</span>
                <span class="line-amount">$${parseFloat(taxCalc?.totalPayments || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
        </div>

        <!-- Refund or Amount Owed Section -->
        <div class="section">
            <div class="section-title">Refund or Amount You Owe</div>
            ${parseFloat(taxCalc?.refundAmount || 0) > 0 ? `
            <div class="line-item total-line" style="background: #e8f5e8;">
                <span class="line-number">34</span>
                <span class="line-description">Amount Overpaid (Refund)</span>
                <span class="line-amount">$${parseFloat(taxCalc?.refundAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            ` : `
            <div class="line-item total-line" style="background: #f5e8e8;">
                <span class="line-number">37</span>
                <span class="line-description">Amount You Owe</span>
                <span class="line-amount">$${parseFloat(taxCalc?.oweAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            `}
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="section-title">Sign Here</div>
            <div style="margin: 20px 0;">
                <p><strong>Under penalties of perjury, I declare that I have examined this return and accompanying schedules and statements, and to the best of my knowledge and belief, they are true, correct, and complete.</strong></p>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                <div style="width: 45%;">
                    <div class="signature-line"></div>
                    <small>Your signature</small>
                </div>
                <div style="width: 20%;">
                    <div class="signature-line"></div>
                    <small>Date</small>
                </div>
                <div style="width: 25%;">
                    <div class="signature-line"></div>
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
</body>
</html>`
}
