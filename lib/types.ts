

export type FilingStatus = 'single' | 'marriedFilingJointly' | 'marriedFilingSeparately' | 'headOfHousehold';

export interface PersonalInfo {
  firstName: string;
  middleInitial?: string;
  lastName: string;
  ssn: string;
  dateOfBirth: string;
  occupation?: string;
  streetAddress: string;
  aptNumber?: string;
  city: string;
  state: string;
  zipCode: string;
  spouseFirstName?: string;
  spouseMiddleInitial?: string;
  spouseLastName?: string;
  spouseSSN?: string;
  spouseDateOfBirth?: string;
  spouseOccupation?: string;
  numDependents: number;
  dependentsData?: any;
}

export interface W2FormData {
  employerName: string;
  employerEIN: string;
  employerAddress: string;
  box1_wages: number;
  box2_federal: number;
  box3_social: number;
  box4_socialTax: number;
  box5_medicare: number;
  box6_medicareTax: number;
  box7_tips?: number;
  box8_allocTips?: number;
  box10_dependent?: number;
  box11_nonqual?: number;
  box12_codes?: any;
  box13_statutory: boolean;
  box13_retirement: boolean;
  box13_thirdparty: boolean;
  box14_other?: any;
  box15_state?: string;
  box16_stateWages?: number;
  box17_stateTax?: number;
  box18_localWages?: number;
  box19_localTax?: number;
  box20_locality?: string;
}

// 1099 Form Types
export type Form1099Type = 'NEC' | 'MISC' | 'INT' | 'DIV' | 'B' | 'R' | 'G' | 'K' | 'Q' | 'C' | 'OID' | 'PATR' | 'S' | 'SA' | 'SB' | 'LTC';

export interface Form1099Base {
  id?: string;
  formType: Form1099Type;
  payerName: string;
  payerTIN: string;
  payerAddress: string;
  recipientTIN: string;
  accountNumber?: string;
  boxData: Record<string, number | string | boolean>;
  uploadedFile?: {
    name: string;
    url: string;
    size: number;
    type?: string;
  } | null;
}

export interface Form1099NEC extends Form1099Base {
  formType: 'NEC';
  boxData: {
    box1_nonemployeeComp: number;
    box2_payer: boolean;
    box4_federalTax: number;
    box5_fiscalYear: boolean;
    box6_directSales: number;
    box7_stateNumber: string;
    box8_stateIncome: number;
    box9_stateTax: number;
  };
}

export interface Form1099MISC extends Form1099Base {
  formType: 'MISC';
  boxData: {
    box1_rents: number;
    box2_royalties: number;
    box3_otherIncome: number;
    box4_federalTax: number;
    box5_fishingBoat: number;
    box6_medical: number;
    box7_payer: boolean;
    box8_substitute: number;
    box9_directSales: number;
    box10_cropInsurance: number;
    box11_stateNumber: string;
    box12_stateIncome: number;
    box13_stateTax: number;
    box14_grossAttorney: number;
    box15_nonqualified: number;
  };
}

export interface Form1099INT extends Form1099Base {
  formType: 'INT';
  boxData: {
    box1_interest: number;
    box2_earlyWithdrawal: number;
    box3_interestOnBonds: number;
    box4_federalTax: number;
    box5_investmentExpenses: number;
    box6_foreignTax: number;
    box7_foreignCountry: string;
    box8_taxExemptInterest: number;
    box9_specifiedBond: number;
    box10_stateNumber: string;
    box11_stateIncome: number;
    box12_stateTax: number;
  };
}

export interface Form1099DIV extends Form1099Base {
  formType: 'DIV';
  boxData: {
    box1a_ordinaryDividends: number;
    box1b_qualifiedDividends: number;
    box2a_capitalGainDist: number;
    box2b_unrecaptured: number;
    box2c_section1202: number;
    box2d_collectibles: number;
    box3_nondividendDist: number;
    box4_federalTax: number;
    box5_investmentExpenses: number;
    box6_foreignTax: number;
    box7_foreignCountry: string;
    box8_cashLiquidation: number;
    box9_noncashLiquidation: number;
    box10_stateNumber: string;
    box11_stateIncome: number;
    box12_stateTax: number;
  };
}

export interface Form1099B extends Form1099Base {
  formType: 'B';
  boxData: {
    box1a_description: string;
    box1b_dateAcquired: string;
    box1c_dateSold: string;
    box2_proceeds: number;
    box3_costBasis: number;
    box4_federalTax: number;
    box5_description: string;
    box6_reportToIRS: boolean;
    box7_lossNotAllowed: boolean;
  };
}

export interface Form1099R extends Form1099Base {
  formType: 'R';
  boxData: {
    box1_grossDistribution: number;
    box2a_taxableAmount: number;
    box2b_notDetermined: boolean;
    box3_capitalGain: number;
    box4_federalTax: number;
    box5_employeeContrib: number;
    box6_netUnrealized: number;
    box7_distributionCodes: string;
    box8_otherPercent: number;
    box9a_yourPercent: number;
    box9b_totalEmployee: number;
    box10_stateDistribution: number;
    box11_stateNumber: string;
    box12_stateTax: number;
    box13_localDistribution: number;
    box14_localTax: number;
    box15_locality: string;
  };
}

export interface Form1099G extends Form1099Base {
  formType: 'G';
  boxData: {
    box1_unemploymentComp: number;
    box2_stateLocalTax: number;
    box3_sicknessPayment: number;
    box4_federalTax: number;
    box5_rtaaPayments: number;
    box6_taxableGrants: number;
    box7_agriculture: number;
    box8_marketGain: number;
    box9_stateNumber: string;
    box10_stateIncome: number;
    box11_stateTax: number;
  };
}

export interface Form1099K extends Form1099Base {
  formType: 'K';
  boxData: {
    box1a_grossAmount: number;
    box1b_cardNotPresent: number;
    box2_merchantCategory: string;
    box3_numberOfTransactions: number;
    box4_federalTax: number;
    box5a_januaryAmount: number;
    box5b_februaryAmount: number;
    box5c_marchAmount: number;
    box5d_aprilAmount: number;
    box5e_mayAmount: number;
    box5f_juneAmount: number;
    box5g_julyAmount: number;
    box5h_augustAmount: number;
    box5i_septemberAmount: number;
    box5j_octoberAmount: number;
    box5k_novemberAmount: number;
    box5l_decemberAmount: number;
    box6_stateNumber: string;
    box7_stateIncome: number;
    box8_stateTax: number;
  };
}

export type Form1099Union = Form1099NEC | Form1099MISC | Form1099INT | Form1099DIV | Form1099B | Form1099R | Form1099G | Form1099K;

export interface DeductionsData {
  useStandardDeduction: boolean;
  standardDeductionAmount: number;
  medicalExpenses?: number;
  stateLocalTaxes?: number;
  mortgageInterest?: number;
  charitableGifts?: number;
  otherDeductions?: number;
  totalItemized?: number;
  iraContributions?: number;
  studentLoanInterest?: number;
  hsa_contributions?: number;
}

export interface TaxReturnData {
  id: string;
  userId: string;
  taxYear: number;
  filingStatus: FilingStatus;
  currentStep: number;
  isComplete: boolean;
  submittedAt?: string;
  personalInfo?: PersonalInfo;
  w2Forms: W2FormData[];
  form1099s: Form1099Union[];
  deductions?: DeductionsData;
  taxCalculation?: any;
}

export const FILING_STEPS = [
  { id: 1, title: 'Personal Information', description: 'Basic taxpayer information' },
  { id: 2, title: 'W-2 Forms', description: 'Employment income and withholding' },
  { id: 3, title: '1099 Forms', description: 'Other income and tax documents' },
  { id: 4, title: 'Deductions', description: 'Standard or itemized deductions' },
  { id: 5, title: 'Review & Calculate', description: 'Tax calculation and summary' },
  { id: 6, title: 'Complete Filing', description: 'Final review and submission' }
];

export const FILING_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'marriedFilingJointly', label: 'Married Filing Jointly' },
  { value: 'marriedFilingSeparately', label: 'Married Filing Separately' },
  { value: 'headOfHousehold', label: 'Head of Household' }
];

export const FORM_1099_TYPES = [
  { value: 'NEC', label: '1099-NEC - Nonemployee Compensation' },
  { value: 'MISC', label: '1099-MISC - Miscellaneous Income' },
  { value: 'INT', label: '1099-INT - Interest Income' },
  { value: 'DIV', label: '1099-DIV - Dividend Income' },
  { value: 'B', label: '1099-B - Broker Transactions' },
  { value: 'R', label: '1099-R - Retirement Distributions' },
  { value: 'G', label: '1099-G - Government Payments' },
  { value: 'K', label: '1099-K - Merchant Card Payments' },
];

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// Form 1040 Line Mappings
export const FORM_1040_MAPPINGS = {
  // Income Lines
  W2_WAGES: '1a', // Line 1a - Total amount from Form W-2
  INTEREST_INCOME: '2a', // Line 2a - Tax-exempt interest 
  ORDINARY_DIVIDENDS: '3a', // Line 3a - Ordinary dividends
  QUALIFIED_DIVIDENDS: '3b', // Line 3b - Qualified dividends
  IRA_DISTRIBUTIONS: '4a', // Line 4a - IRA distributions
  IRA_TAXABLE: '4b', // Line 4b - Taxable amount
  PENSIONS_ANNUITIES: '5a', // Line 5a - Pensions and annuities
  PENSIONS_TAXABLE: '5b', // Line 5b - Taxable amount
  SOCIAL_SECURITY: '6a', // Line 6a - Social security benefits
  SOCIAL_SECURITY_TAXABLE: '6b', // Line 6b - Taxable amount
  CAPITAL_GAIN_LOSS: '7', // Line 7 - Capital gain or loss
  OTHER_INCOME: '8a', // Line 8a - Other income from Schedule 1
  // Deduction Lines
  STANDARD_DEDUCTION: '12', // Line 12 - Standard deduction
  ITEMIZED_DEDUCTION: '12', // Line 12 - Itemized deduction
  // Tax Lines
  TAX_BEFORE_CREDITS: '16', // Line 16 - Tax before credits
  TAX_AFTER_CREDITS: '24', // Line 24 - Tax after credits
  FEDERAL_WITHHELD: '25a', // Line 25a - Federal income tax withheld
  ESTIMATED_TAX: '25b', // Line 25b - Estimated tax payments
  // Final Lines
  TOTAL_PAYMENTS: '33', // Line 33 - Total payments
  REFUND: '34', // Line 34 - If line 33 > line 24, subtract
  AMOUNT_OWED: '37', // Line 37 - Amount you owe
};

