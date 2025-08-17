
import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import mime from 'mime-types'

const UPLOAD_DIR = path.join(process.cwd(), '..', 'uploads')

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string[] } }
) {
  try {
    const filename = params.filename.join('/')
    const filePath = path.join(UPLOAD_DIR, filename)
    
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 })
    }
    
    const file = await readFile(filePath)
    const mimeType = mime.lookup(filename) || 'application/octet-stream'
    
    return new NextResponse(file, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${path.basename(filename)}"`,
      },
    })
  } catch (error) {
    console.error('File serve error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
