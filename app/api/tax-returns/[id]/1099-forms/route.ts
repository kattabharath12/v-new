

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// Validation schema for 1099 forms
const form1099Schema = z.object({
  formType: z.enum(['NEC', 'MISC', 'INT', 'DIV', 'B', 'R', 'G', 'K']),
  payerName: z.string().min(1, 'Payer name is required'),
  payerTIN: z.string().min(1, 'Payer TIN is required'),
  payerAddress: z.string().optional(),
  recipientTIN: z.string().min(1, 'Recipient TIN is required'),
  accountNumber: z.string().optional(),
  boxData: z.record(z.union([z.string(), z.number(), z.boolean()]))
})

const requestSchema = z.object({
  form1099s: z.array(form1099Schema)
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Temporarily bypass authentication for development to match other endpoints
    // TODO: Implement proper client-side authentication  
    const userId = "temp-user-id";

    const form1099s = await db.form1099.findMany({
      where: {
        taxReturnId: params.id,
        taxReturn: {
          userId: userId
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json({ form1099s })
  } catch (error) {
    console.error('Error fetching 1099 forms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch 1099 forms' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Temporarily bypass authentication for development to match other endpoints
    // TODO: Implement proper client-side authentication  
    const userId = "temp-user-id";

    const body = await request.json()
    const validatedData = requestSchema.parse(body)

    // Verify tax return belongs to user
    const taxReturn = await db.taxReturn.findUnique({
      where: {
        id: params.id,
        userId: userId
      }
    })

    if (!taxReturn) {
      return NextResponse.json({ error: 'Tax return not found' }, { status: 404 })
    }

    // Delete existing 1099 forms
    await db.form1099.deleteMany({
      where: {
        taxReturnId: params.id
      }
    })

    // Create new 1099 forms
    const form1099s = await Promise.all(
      validatedData.form1099s.map((form1099Data) =>
        db.form1099.create({
          data: {
            taxReturnId: params.id,
            formType: form1099Data.formType,
            payerName: form1099Data.payerName,
            payerTIN: form1099Data.payerTIN,
            payerAddress: form1099Data.payerAddress || '',
            recipientTIN: form1099Data.recipientTIN,
            accountNumber: form1099Data.accountNumber || '',
            boxData: form1099Data.boxData
          }
        })
      )
    )

    return NextResponse.json({ form1099s })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error saving 1099 forms:', error)
    return NextResponse.json(
      { error: 'Failed to save 1099 forms' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return POST(request, { params })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Temporarily bypass authentication for development to match other endpoints
    // TODO: Implement proper client-side authentication  
    const userId = "temp-user-id";

    // Verify tax return belongs to user
    const taxReturn = await db.taxReturn.findUnique({
      where: {
        id: params.id,
        userId: userId
      }
    })

    if (!taxReturn) {
      return NextResponse.json({ error: 'Tax return not found' }, { status: 404 })
    }

    // Delete all 1099 forms for this tax return
    await db.form1099.deleteMany({
      where: {
        taxReturnId: params.id
      }
    })

    return NextResponse.json({ message: '1099 forms deleted successfully' })
  } catch (error) {
    console.error('Error deleting 1099 forms:', error)
    return NextResponse.json(
      { error: 'Failed to delete 1099 forms' },
      { status: 500 }
    )
  }
}

