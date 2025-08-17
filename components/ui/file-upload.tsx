
"use client"

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, File, X, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  acceptedTypes?: string[]
  maxSize?: number
  className?: string
  formType?: string
  uploadedFile?: {
    name: string
    url: string
    size: number
  } | null
}

export default function FileUpload({
  onFileSelect,
  onFileRemove,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'],
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  formType = 'form',
  uploadedFile
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = useCallback((file: File) => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Please upload ${acceptedTypes.join(', ')} files only.`
    }

    return null
  }, [acceptedTypes, maxSize])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const errorMessage = validateFile(file)
    
    if (errorMessage) {
      setError(errorMessage)
      return
    }

    setError(null)
    onFileSelect(file)
  }, [validateFile, onFileSelect])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }, [handleFiles])

  const handleRemove = () => {
    setError(null)
    onFileRemove()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (uploadedFile) {
    return (
      <Card className={cn("border-2", className)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {uploadedFile.name}
              </p>
              <p className="text-sm text-gray-500">
                {formatFileSize(uploadedFile.size)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(uploadedFile.url, '_blank')}
              >
                View
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <Card 
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          error ? "border-red-400 bg-red-50" : ""
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
            <div className="mt-4">
              <label htmlFor={`file-upload-${formType}`} className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Drop your {formType} here, or{' '}
                  <span className="text-blue-600 hover:text-blue-500">browse</span>
                </span>
                <input
                  id={`file-upload-${formType}`}
                  name={`file-upload-${formType}`}
                  type="file"
                  className="sr-only"
                  accept={acceptedTypes.join(',')}
                  onChange={handleChange}
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">
                PDF, JPG, PNG up to {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {error && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  )
}
