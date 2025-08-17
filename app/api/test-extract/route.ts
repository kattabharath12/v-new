
import { NextRequest, NextResponse } from 'next/server'
import { extractFormData } from '@/lib/ocr-utils'
import { existsSync } from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), '..', 'uploads')

export async function GET() {
  try {
    console.log('Test extract API called')
    console.log('Upload directory:', UPLOAD_DIR)
    
    // Check if upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      return NextResponse.json({
        error: 'Upload directory does not exist',
        uploadDir: UPLOAD_DIR
      })
    }
    
    // List files in upload directory
    const { readdirSync } = require('fs')
    const files = readdirSync(UPLOAD_DIR)
    console.log('Available files:', files)
    
    // Test with the w2.png file
    const testFile = 'w2.png'
    const filePath = path.join(UPLOAD_DIR, testFile)
    
    if (!existsSync(filePath)) {
      return NextResponse.json({
        error: 'Test file not found',
        availableFiles: files,
        expectedPath: filePath
      })
    }
    
    // Try to extract data
    const extractedData = await extractFormData(filePath, 'image/png')
    
    return NextResponse.json({
      success: true,
      uploadDir: UPLOAD_DIR,
      files: files,
      testFile: testFile,
      extractedData: extractedData
    })
    
  } catch (error) {
    console.error('Test extract error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    })
  }
}
