
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Temporarily bypass authentication for development to match other endpoints
    // TODO: Implement proper client-side authentication  
    const userId = "temp-user-id";

    const taxReturn = await db.taxReturn.findFirst({
      where: {
        id: params.id,
        userId: userId
      },
      include: {
        personalInfo: true,
        w2Forms: true,
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

    return NextResponse.json(taxReturn);
  } catch (error) {
    console.error('Error fetching tax return:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    // Temporarily bypass authentication for development to match other endpoints
    // TODO: Implement proper client-side authentication  
    const userId = "temp-user-id";

    const body = await request.json();
    
    const taxReturn = await db.taxReturn.findFirst({
      where: {
        id: params.id,
        userId: userId
      }
    });

    if (!taxReturn) {
      return NextResponse.json(
        { error: 'Tax return not found' },
        { status: 404 }
      );
    }

    const updatedTaxReturn = await db.taxReturn.update({
      where: {
        id: params.id
      },
      data: body
    });

    return NextResponse.json(updatedTaxReturn);
  } catch (error) {
    console.error('Error updating tax return:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
