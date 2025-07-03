import { useState, useRef } from 'react'
import type { DragEvent } from 'react'
import { useColorExtraction } from '../hooks/useColorExtraction'

interface ColorPaletteUploaderProps {
  onPaletteExtracted: (hues: number[]) => void
}

export const ColorPaletteUploader = ({ onPaletteExtracted }: ColorPaletteUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { extractColorsFromImage, isExtracting, lastExtractedPalette } = useColorExtraction()

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      await processImage(imageFile)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      await processImage(file)
    }
  }

  const processImage = async (file: File) => {
    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Extract colors
    const palette = await extractColorsFromImage(file)
    if (palette) {
      console.log('Extracted palette:', palette)
    }
  }

  const applyPalette = () => {
    if (lastExtractedPalette) {
      onPaletteExtracted(lastExtractedPalette.hues)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50/10' 
            : 'border-gray-600 hover:border-gray-500'
          }
          ${isExtracting ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {isExtracting ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Extracting colors...</p>
          </div>
        ) : uploadedImage ? (
          <div className="flex flex-col items-center gap-3">
            <img 
              src={uploadedImage} 
              alt="Uploaded" 
              className="w-16 h-16 object-cover rounded-lg"
            />
            <p className="text-sm text-gray-400">Click to upload different image</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <p className="text-sm text-gray-300">Drop an image here</p>
              <p className="text-xs text-gray-500">or click to browse</p>
            </div>
          </div>
        )}
      </div>

      {/* Extracted Colors Preview */}
      {lastExtractedPalette && (
        <div className="mt-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-300">Extracted Colors</h3>
          
          {/* Color Swatches */}
          <div className="flex gap-2">
            {lastExtractedPalette.colors.map((color, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-lg border border-gray-600"
                  style={{
                    backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`
                  }}
                />
                <span className="text-xs text-gray-500">
                  {lastExtractedPalette.hues[index]}°
                </span>
              </div>
            ))}
          </div>
          
          {/* Apply Button */}
          <button
            onClick={applyPalette}
            className="
              w-full py-2 px-4
              bg-blue-600 hover:bg-blue-700
              text-white text-sm font-medium
              rounded-lg
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
            "
          >
            Apply Palette to Gradient
          </button>
        </div>
      )}
    </div>
  )
} 