-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "TaxReturn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "filingStatus" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalInfo" (
    "id" TEXT NOT NULL,
    "taxReturnId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleInitial" TEXT,
    "lastName" TEXT NOT NULL,
    "ssn" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "occupation" TEXT,
    "streetAddress" TEXT NOT NULL,
    "aptNumber" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "spouseFirstName" TEXT,
    "spouseMiddleInitial" TEXT,
    "spouseLastName" TEXT,
    "spouseSSN" TEXT,
    "spouseDateOfBirth" TIMESTAMP(3),
    "spouseOccupation" TEXT,
    "numDependents" INTEGER NOT NULL DEFAULT 0,
    "dependentsData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "W2Form" (
    "id" TEXT NOT NULL,
    "taxReturnId" TEXT NOT NULL,
    "employerName" TEXT NOT NULL,
    "employerEIN" TEXT NOT NULL,
    "employerAddress" TEXT NOT NULL,
    "box1_wages" DECIMAL(12,2) NOT NULL,
    "box2_federal" DECIMAL(12,2) NOT NULL,
    "box3_social" DECIMAL(12,2) NOT NULL,
    "box4_socialTax" DECIMAL(12,2) NOT NULL,
    "box5_medicare" DECIMAL(12,2) NOT NULL,
    "box6_medicareTax" DECIMAL(12,2) NOT NULL,
    "box7_tips" DECIMAL(12,2),
    "box8_allocTips" DECIMAL(12,2),
    "box10_dependent" DECIMAL(12,2),
    "box11_nonqual" DECIMAL(12,2),
    "box12_codes" JSONB,
    "box13_statutory" BOOLEAN NOT NULL DEFAULT false,
    "box13_retirement" BOOLEAN NOT NULL DEFAULT false,
    "box13_thirdparty" BOOLEAN NOT NULL DEFAULT false,
    "box14_other" JSONB,
    "box15_state" TEXT,
    "box16_stateWages" DECIMAL(12,2),
    "box17_stateTax" DECIMAL(12,2),
    "box18_localWages" DECIMAL(12,2),
    "box19_localTax" DECIMAL(12,2),
    "box20_locality" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "W2Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form1099" (
    "id" TEXT NOT NULL,
    "taxReturnId" TEXT NOT NULL,
    "formType" TEXT NOT NULL,
    "payerName" TEXT NOT NULL,
    "payerTIN" TEXT NOT NULL,
    "payerAddress" TEXT NOT NULL,
    "recipientTIN" TEXT NOT NULL,
    "accountNumber" TEXT,
    "boxData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Form1099_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deductions" (
    "id" TEXT NOT NULL,
    "taxReturnId" TEXT NOT NULL,
    "useStandardDeduction" BOOLEAN NOT NULL DEFAULT true,
    "standardDeductionAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "medicalExpenses" DECIMAL(12,2),
    "stateLocalTaxes" DECIMAL(12,2),
    "mortgageInterest" DECIMAL(12,2),
    "charitableGifts" DECIMAL(12,2),
    "otherDeductions" DECIMAL(12,2),
    "totalItemized" DECIMAL(12,2),
    "iraContributions" DECIMAL(12,2),
    "studentLoanInterest" DECIMAL(12,2),
    "hsa_contributions" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxCalculation" (
    "id" TEXT NOT NULL,
    "taxReturnId" TEXT NOT NULL,
    "totalWages" DECIMAL(12,2) NOT NULL,
    "total1099Income" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "interestIncome" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "dividendIncome" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "capitalGains" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "retirementIncome" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "unemploymentIncome" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "otherIncome" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "adjustedGrossIncome" DECIMAL(12,2) NOT NULL,
    "deductionAmount" DECIMAL(12,2) NOT NULL,
    "taxableIncome" DECIMAL(12,2) NOT NULL,
    "taxBeforeCredits" DECIMAL(12,2) NOT NULL,
    "childTaxCredit" DECIMAL(12,2),
    "earnedIncomeCredit" DECIMAL(12,2),
    "otherCredits" DECIMAL(12,2),
    "totalCredits" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxAfterCredits" DECIMAL(12,2) NOT NULL,
    "federalWithheld" DECIMAL(12,2) NOT NULL,
    "totalWithheld" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estimatedPayments" DECIMAL(12,2),
    "totalPayments" DECIMAL(12,2) NOT NULL,
    "refundAmount" DECIMAL(12,2),
    "oweAmount" DECIMAL(12,2),
    "form1040Lines" JSONB,
    "calculationDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxCalculation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "TaxReturn_userId_taxYear_key" ON "TaxReturn"("userId", "taxYear");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalInfo_taxReturnId_key" ON "PersonalInfo"("taxReturnId");

-- CreateIndex
CREATE INDEX "Form1099_taxReturnId_formType_idx" ON "Form1099"("taxReturnId", "formType");

-- CreateIndex
CREATE UNIQUE INDEX "Deductions_taxReturnId_key" ON "Deductions"("taxReturnId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxCalculation_taxReturnId_key" ON "TaxCalculation"("taxReturnId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxReturn" ADD CONSTRAINT "TaxReturn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalInfo" ADD CONSTRAINT "PersonalInfo_taxReturnId_fkey" FOREIGN KEY ("taxReturnId") REFERENCES "TaxReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "W2Form" ADD CONSTRAINT "W2Form_taxReturnId_fkey" FOREIGN KEY ("taxReturnId") REFERENCES "TaxReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form1099" ADD CONSTRAINT "Form1099_taxReturnId_fkey" FOREIGN KEY ("taxReturnId") REFERENCES "TaxReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deductions" ADD CONSTRAINT "Deductions_taxReturnId_fkey" FOREIGN KEY ("taxReturnId") REFERENCES "TaxReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxCalculation" ADD CONSTRAINT "TaxCalculation_taxReturnId_fkey" FOREIGN KEY ("taxReturnId") REFERENCES "TaxReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
