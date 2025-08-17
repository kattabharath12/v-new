
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      message: 'Tax Filing App is running successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' }, 
      { status: 500 }
    )
  }
}
