
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
    // Temporarily bypass authentication for development
    // TODO: Implement proper client-side authentication  
    const userId = "temp-user-id";

    const body = await request.json();
    const { w2Forms } = body;
    
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

    // Delete existing W-2 forms for this tax return
    await db.w2Form.deleteMany({
      where: {
        taxReturnId: params.id
      }
    });

    // Create new W-2 forms
    const createdForms = await Promise.all(
      w2Forms.map((form: any) =>
        db.w2Form.create({
          data: {
            taxReturnId: params.id,
            employerName: form.employerName,
            employerEIN: form.employerEIN,
            employerAddress: form.employerAddress,
            box1_wages: form.box1_wages,
            box2_federal: form.box2_federal,
            box3_social: form.box3_social,
            box4_socialTax: form.box4_socialTax,
            box5_medicare: form.box5_medicare,
            box6_medicareTax: form.box6_medicareTax,
            box15_state: form.box15_state,
            box16_stateWages: form.box16_stateWages,
            box17_stateTax: form.box17_stateTax
          }
        })
      )
    );

    return NextResponse.json(createdForms);
  } catch (error) {
    console.error('Error saving W-2 forms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
