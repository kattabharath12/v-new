
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { calculateComprehensiveTaxReturn } from '@/lib/tax-calculator';

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    // Temporarily bypass authentication for development to match W2 forms endpoint
    // TODO: Implement proper client-side authentication  
    const userId = "temp-user-id";

    // Get tax return with all related data including 1099 forms
    const taxReturn = await db.taxReturn.findFirst({
      where: {
        id: params.id,
        userId: userId
      },
      include: {
        w2Forms: true,
        form1099s: true,
        deductions: true,
        taxCalculation: true
      }
    });

    if (!taxReturn) {
      return NextResponse.json(
        { error: 'Tax return not found' },
        { status: 404 }
      );
    }

    // Calculate total wages and withholding from W-2 forms
    const totalWages = taxReturn.w2Forms.reduce((sum: number, w2: any) => 
      sum + parseFloat(w2.box1_wages.toString()), 0);
    
    const totalW2Withheld = taxReturn.w2Forms.reduce((sum: number, w2: any) => 
      sum + parseFloat(w2.box2_federal.toString()), 0);

    // Determine deduction amount
    const useStandardDeduction = taxReturn.deductions?.useStandardDeduction ?? true;
    const itemizedAmount = parseFloat(taxReturn.deductions?.totalItemized?.toString() || '0');

    // Calculate comprehensive tax return with W-2 and 1099 income
    const calculation = await calculateComprehensiveTaxReturn(
      totalWages,
      totalW2Withheld,
      taxReturn.form1099s || [],
      taxReturn.filingStatus,
      useStandardDeduction,
      itemizedAmount
    );

    // Save comprehensive calculation to database
    const savedCalculation = await db.taxCalculation.upsert({
      where: {
        taxReturnId: params.id
      },
      update: {
        // Income breakdown
        totalWages: calculation.totalWages,
        total1099Income: calculation.total1099Income,
        interestIncome: calculation.interestIncome,
        dividendIncome: calculation.dividendIncome,
        capitalGains: calculation.capitalGains,
        retirementIncome: calculation.retirementIncome,
        unemploymentIncome: calculation.unemploymentIncome,
        otherIncome: calculation.otherIncome,
        
        // AGI and deductions
        adjustedGrossIncome: calculation.adjustedGrossIncome,
        deductionAmount: calculation.deductionAmount,
        taxableIncome: calculation.taxableIncome,
        
        // Tax calculation
        taxBeforeCredits: calculation.taxBeforeCredits,
        totalCredits: calculation.totalCredits,
        taxAfterCredits: calculation.taxAfterCredits,
        
        // Payments
        federalWithheld: totalW2Withheld,
        totalWithheld: calculation.totalWithheld,
        totalPayments: calculation.totalPayments,
        
        // Final result
        refundAmount: calculation.refundAmount > 0 ? calculation.refundAmount : null,
        oweAmount: calculation.oweAmount > 0 ? calculation.oweAmount : null,
        
        // Form 1040 mappings
        form1040Lines: calculation.form1040Lines
      },
      create: {
        taxReturnId: params.id,
        
        // Income breakdown
        totalWages: calculation.totalWages,
        total1099Income: calculation.total1099Income,
        interestIncome: calculation.interestIncome,
        dividendIncome: calculation.dividendIncome,
        capitalGains: calculation.capitalGains,
        retirementIncome: calculation.retirementIncome,
        unemploymentIncome: calculation.unemploymentIncome,
        otherIncome: calculation.otherIncome,
        
        // AGI and deductions
        adjustedGrossIncome: calculation.adjustedGrossIncome,
        deductionAmount: calculation.deductionAmount,
        taxableIncome: calculation.taxableIncome,
        
        // Tax calculation
        taxBeforeCredits: calculation.taxBeforeCredits,
        totalCredits: calculation.totalCredits,
        taxAfterCredits: calculation.taxAfterCredits,
        
        // Payments
        federalWithheld: totalW2Withheld,
        totalWithheld: calculation.totalWithheld,
        totalPayments: calculation.totalPayments,
        
        // Final result
        refundAmount: calculation.refundAmount > 0 ? calculation.refundAmount : null,
        oweAmount: calculation.oweAmount > 0 ? calculation.oweAmount : null,
        
        // Form 1040 mappings
        form1040Lines: calculation.form1040Lines
      }
    });

    return NextResponse.json({
      ...calculation,
      id: savedCalculation.id,
      taxReturnId: params.id
    });
  } catch (error) {
    console.error('Error calculating taxes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
