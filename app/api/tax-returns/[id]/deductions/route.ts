
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

export async function POST(request: Request, { params }: RouteParams) {
  try {
    // Temporarily bypass authentication for development to match other endpoints
    // TODO: Implement proper client-side authentication  
    const userId = "temp-user-id";

    const body = await request.json();
    
    // Verify tax return ownership
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

    // Save or update deductions
    const deductions = await db.deductions.upsert({
      where: {
        taxReturnId: params.id
      },
      update: body,
      create: {
        ...body,
        taxReturnId: params.id
      }
    });

    return NextResponse.json(deductions);
  } catch (error) {
    console.error('Error saving deductions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
