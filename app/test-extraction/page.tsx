
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function TestExtraction() {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const testExtraction = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('Making API call to extract-form-data...')
      
      const response = await fetch('/api/extract-form-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          filename: 'w2.png',
          fileType: 'image/png'
        })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      // Check content type
      const contentType = response.headers.get('content-type')
      console.log('Content-Type:', contentType)
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        console.log('JSON response:', data)
        setResult(data)
      } else {
        const text = await response.text()
        console.log('Non-JSON response:', text.substring(0, 500))
        setError('Server returned HTML instead of JSON. Check console for details.')
      }
      
    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Data Extraction API</h1>
      
      <Button 
        onClick={testExtraction} 
        disabled={loading}
        className="mb-6"
      >
        {loading ? 'Testing...' : 'Test Extract Data API'}
      </Button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
          <p className="text-sm mt-2">Check browser developer console for more details.</p>
        </div>
      )}

      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <h3 className="font-bold">Success!</h3>
          <pre className="text-sm mt-2 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Debug Information</h2>
        <p>This page tests the <code>/api/extract-form-data</code> endpoint directly.</p>
        <p>Open browser DevTools Console for detailed logs.</p>
      </div>
    </div>
  )
}
