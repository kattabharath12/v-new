

import { Decimal } from '@prisma/client/runtime/library';

export interface TaxBracket {
  rate: number;
  min: number;
  max?: number;
}

export interface TaxData {
  taxYear: number;
  brackets: {
    single: TaxBracket[];
    marriedFilingJointly: TaxBracket[];
    marriedFilingSeparately: TaxBracket[];
    headOfHousehold: TaxBracket[];
  };
  standardDeductions: {
    single: number;
    marriedFilingJointly: number;
    marriedFilingSeparately: number;
    headOfHousehold: number;
  };
}

export async function loadTaxData(): Promise<TaxData> {
  try {
    const response = await fetch('/federal_tax_data_2025.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading tax data:', error);
    // Fallback tax data for 2025
    return {
      taxYear: 2025,
      brackets: {
        single: [
          { rate: 0.10, min: 0, max: 11600 },
          { rate: 0.12, min: 11600, max: 47150 },
          { rate: 0.22, min: 47150, max: 100525 },
          { rate: 0.24, min: 100525, max: 191650 },
          { rate: 0.32, min: 191650, max: 243725 },
          { rate: 0.35, min: 243725, max: 609350 },
          { rate: 0.37, min: 609350 }
        ],
        marriedFilingJointly: [
          { rate: 0.10, min: 0, max: 23200 },
          { rate: 0.12, min: 23200, max: 94300 },
          { rate: 0.22, min: 94300, max: 201050 },
          { rate: 0.24, min: 201050, max: 383900 },
          { rate: 0.32, min: 383900, max: 487450 },
          { rate: 0.35, min: 487450, max: 731200 },
          { rate: 0.37, min: 731200 }
        ],
        marriedFilingSeparately: [
          { rate: 0.10, min: 0, max: 11600 },
          { rate: 0.12, min: 11600, max: 47150 },
          { rate: 0.22, min: 47150, max: 100525 },
          { rate: 0.24, min: 100525, max: 191950 },
          { rate: 0.32, min: 191950, max: 243725 },
          { rate: 0.35, min: 243725, max: 365600 },
          { rate: 0.37, min: 365600 }
        ],
        headOfHousehold: [
          { rate: 0.10, min: 0, max: 16550 },
          { rate: 0.12, min: 16550, max: 63100 },
          { rate: 0.22, min: 63100, max: 100500 },
          { rate: 0.24, min: 100500, max: 191650 },
          { rate: 0.32, min: 191650, max: 243700 },
          { rate: 0.35, min: 243700, max: 609350 },
          { rate: 0.37, min: 609350 }
        ]
      },
      standardDeductions: {
        single: 15000,
        marriedFilingJointly: 30000,
        marriedFilingSeparately: 15000,
        headOfHousehold: 22500
      }
    };
  }
}

export function calculateFederalTax(
  taxableIncome: number,
  filingStatus: string,
  taxData: TaxData
): number {
  const brackets = taxData.brackets[filingStatus as keyof typeof taxData.brackets];
  if (!brackets) return 0;

  let totalTax = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    const bracketMin = bracket.min;
    const bracketMax = bracket.max || Number.MAX_SAFE_INTEGER;
    const bracketWidth = bracketMax - bracketMin;
    const taxableInThisBracket = Math.min(remainingIncome, bracketWidth);

    if (taxableInThisBracket > 0) {
      totalTax += taxableInThisBracket * bracket.rate;
      remainingIncome -= taxableInThisBracket;
    }
  }

  return Math.round(totalTax * 100) / 100;
}

export function getStandardDeduction(filingStatus: string, taxData: TaxData): number {
  return taxData.standardDeductions[filingStatus as keyof typeof taxData.standardDeductions] || 0;
}

// Enhanced tax calculation result with 1099 breakdown
export interface TaxCalculationResult {
  // Income breakdown
  totalWages: number;
  total1099Income: number;
  interestIncome: number;
  dividendIncome: number;
  capitalGains: number;
  retirementIncome: number;
  unemploymentIncome: number;
  otherIncome: number;
  
  // AGI and deductions
  adjustedGrossIncome: number;
  deductionAmount: number;
  taxableIncome: number;
  
  // Tax calculation
  taxBeforeCredits: number;
  totalCredits: number;
  taxAfterCredits: number;
  
  // Payments and final result
  totalPayments: number;
  totalWithheld: number;
  refundAmount: number;
  oweAmount: number;
  
  // Form 1040 line mappings
  form1040Lines: Record<string, number>;
}

// Process 1099 forms and extract income amounts
export function process1099Forms(form1099s: any[]): {
  total1099Income: number;
  interestIncome: number;
  dividendIncome: number;
  capitalGains: number;
  retirementIncome: number;
  unemploymentIncome: number;
  otherIncome: number;
  totalWithheld: number;
} {
  let total1099Income = 0;
  let interestIncome = 0;
  let dividendIncome = 0;
  let capitalGains = 0;
  let retirementIncome = 0;
  let unemploymentIncome = 0;
  let otherIncome = 0;
  let totalWithheld = 0;

  for (const form of form1099s) {
    const boxData = form.boxData || {};
    
    switch (form.formType) {
      case 'NEC':
        const necIncome = parseFloat(boxData.box1_nonemployeeComp || 0);
        otherIncome += necIncome;
        total1099Income += necIncome;
        totalWithheld += parseFloat(boxData.box4_federalTax || 0);
        break;
        
      case 'MISC':
        const miscIncome = 
          parseFloat(boxData.box1_rents || 0) + 
          parseFloat(boxData.box2_royalties || 0) + 
          parseFloat(boxData.box3_otherIncome || 0);
        otherIncome += miscIncome;
        total1099Income += miscIncome;
        totalWithheld += parseFloat(boxData.box4_federalTax || 0);
        break;
        
      case 'INT':
        const intIncome = parseFloat(boxData.box1_interest || 0);
        interestIncome += intIncome;
        total1099Income += intIncome;
        totalWithheld += parseFloat(boxData.box4_federalTax || 0);
        break;
        
      case 'DIV':
        const divIncome = parseFloat(boxData.box1a_ordinaryDividends || 0);
        dividendIncome += divIncome;
        total1099Income += divIncome;
        
        const capGains = parseFloat(boxData.box2a_capitalGainDist || 0);
        capitalGains += capGains;
        total1099Income += capGains;
        
        totalWithheld += parseFloat(boxData.box4_federalTax || 0);
        break;
        
      case 'B':
        const proceeds = parseFloat(boxData.box2_proceeds || 0);
        const costBasis = parseFloat(boxData.box3_costBasis || 0);
        const gain = proceeds - costBasis;
        if (gain !== 0) {
          capitalGains += gain;
          total1099Income += gain;
        }
        totalWithheld += parseFloat(boxData.box4_federalTax || 0);
        break;
        
      case 'R':
        const retIncome = parseFloat(boxData.box2a_taxableAmount || 0) || parseFloat(boxData.box1_grossDistribution || 0);
        retirementIncome += retIncome;
        total1099Income += retIncome;
        totalWithheld += parseFloat(boxData.box4_federalTax || 0);
        break;
        
      case 'G':
        const govIncome = 
          parseFloat(boxData.box1_unemploymentComp || 0) +
          parseFloat(boxData.box2_stateLocalTax || 0) +
          parseFloat(boxData.box3_sicknessPayment || 0);
        unemploymentIncome += parseFloat(boxData.box1_unemploymentComp || 0);
        otherIncome += parseFloat(boxData.box2_stateLocalTax || 0) + parseFloat(boxData.box3_sicknessPayment || 0);
        total1099Income += govIncome;
        totalWithheld += parseFloat(boxData.box4_federalTax || 0);
        break;
        
      case 'K':
        // Note: 1099-K is informational and doesn't directly add to income
        // The actual business income would be reported separately
        totalWithheld += parseFloat(boxData.box4_federalTax || 0);
        break;
    }
  }

  return {
    total1099Income,
    interestIncome,
    dividendIncome,
    capitalGains,
    retirementIncome,
    unemploymentIncome,
    otherIncome,
    totalWithheld
  };
}

export async function calculateComprehensiveTaxReturn(
  wages: number,
  federalWithheld: number,
  form1099s: any[],
  filingStatus: string,
  useStandardDeduction: boolean = true,
  itemizedDeductions: number = 0,
  credits: number = 0
): Promise<TaxCalculationResult> {
  const taxData = await loadTaxData();
  
  // Process 1099 forms
  const income1099 = process1099Forms(form1099s);
  
  // Calculate total income components
  const totalWages = wages;
  const total1099Income = income1099.total1099Income;
  const interestIncome = income1099.interestIncome;
  const dividendIncome = income1099.dividendIncome;
  const capitalGains = income1099.capitalGains;
  const retirementIncome = income1099.retirementIncome;
  const unemploymentIncome = income1099.unemploymentIncome;
  const otherIncome = income1099.otherIncome;
  
  // Calculate AGI
  const adjustedGrossIncome = totalWages + total1099Income;
  
  // Calculate deduction
  const standardDeduction = getStandardDeduction(filingStatus, taxData);
  const deductionAmount = useStandardDeduction ? standardDeduction : Math.max(itemizedDeductions, standardDeduction);
  
  // Calculate taxable income
  const taxableIncome = Math.max(0, adjustedGrossIncome - deductionAmount);
  
  // Calculate federal tax
  const taxBeforeCredits = calculateFederalTax(taxableIncome, filingStatus, taxData);
  const taxAfterCredits = Math.max(0, taxBeforeCredits - credits);
  
  // Calculate total payments
  const totalWithheld = federalWithheld + income1099.totalWithheld;
  const totalPayments = totalWithheld;
  
  // Calculate refund or amount owed
  const difference = totalPayments - taxAfterCredits;
  const refundAmount = difference > 0 ? difference : 0;
  const oweAmount = difference < 0 ? Math.abs(difference) : 0;

  // Form 1040 line mappings
  const form1040Lines: Record<string, number> = {
    '1a': totalWages, // W-2 wages
    '2a': interestIncome, // Interest income
    '3a': dividendIncome, // Ordinary dividends
    '4a': retirementIncome, // IRA/pension distributions
    '5a': unemploymentIncome, // Unemployment compensation
    '7': capitalGains, // Capital gains/losses
    '8a': otherIncome, // Other income
    '9': adjustedGrossIncome, // AGI
    '12': deductionAmount, // Standard/itemized deduction
    '15': taxableIncome, // Taxable income
    '16': taxBeforeCredits, // Tax before credits
    '24': taxAfterCredits, // Tax after credits
    '25a': federalWithheld, // Federal tax withheld from W-2
    '25b': income1099.totalWithheld, // Federal tax withheld from 1099s
    '33': totalPayments, // Total payments
    '34': refundAmount, // Refund
    '37': oweAmount, // Amount owed
  };

  return {
    totalWages,
    total1099Income,
    interestIncome,
    dividendIncome,
    capitalGains,
    retirementIncome,
    unemploymentIncome,
    otherIncome,
    adjustedGrossIncome,
    deductionAmount,
    taxableIncome,
    taxBeforeCredits,
    totalCredits: credits,
    taxAfterCredits,
    totalPayments,
    totalWithheld,
    refundAmount,
    oweAmount,
    form1040Lines
  };
}

// Legacy function for backward compatibility
export async function calculateTaxReturn(
  wages: number,
  federalWithheld: number,
  filingStatus: string,
  useStandardDeduction: boolean = true,
  itemizedDeductions: number = 0,
  credits: number = 0
): Promise<TaxCalculationResult> {
  return calculateComprehensiveTaxReturn(
    wages,
    federalWithheld,
    [], // No 1099 forms for legacy calculation
    filingStatus,
    useStandardDeduction,
    itemizedDeductions,
    credits
  );
}

