
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Temporarily bypass authentication for development
    // TODO: Implement proper client-side authentication  
    const userId = "temp-user-id";

    const body = await request.json();
    const { taxYear, filingStatus } = body;

    // Check if user already has a return for this tax year
    const existingReturn = await db.taxReturn.findFirst({
      where: {
        userId: userId,
        taxYear: taxYear
      }
    });

    if (existingReturn) {
      return NextResponse.json(
        { error: 'Tax return for this year already exists' },
        { status: 400 }
      );
    }

    // Create new tax return
    const taxReturn = await db.taxReturn.create({
      data: {
        userId: userId,
        taxYear: taxYear,
        filingStatus: filingStatus,
        currentStep: 1
      }
    });

    return NextResponse.json(taxReturn);
  } catch (error) {
    console.error('Error creating tax return:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Temporarily bypass authentication for development
    // TODO: Implement proper client-side authentication  
    const userId = "temp-user-id";

    const taxReturns = await db.taxReturn.findMany({
      where: {
        userId: userId
      },
      include: {
        personalInfo: true,
        w2Forms: true,
        deductions: true,
        taxCalculation: true
      },
      orderBy: {
        taxYear: 'desc'
      }
    });

    return NextResponse.json(taxReturns, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching tax returns:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
