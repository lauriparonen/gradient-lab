import { useState, useRef } from 'react'
import type { DragEvent } from 'react'
import { useColorExtraction } from '../hooks/useColorExtraction'
import { useSavedPalettes } from '../hooks/useSavedPalettes'

interface ColorPaletteUploaderProps {
  onPaletteExtracted: (hues: number[]) => void
}

export const ColorPaletteUploader = ({ onPaletteExtracted }: ColorPaletteUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [paletteName, setPaletteName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { extractColorsFromImage, isExtracting, lastExtractedPalette } = useColorExtraction()
  const { savePalette } = useSavedPalettes()

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

  const handleSavePalette = () => {
    setShowSaveDialog(true)
    setPaletteName(`Palette ${new Date().toLocaleDateString()}`)
  }

  const confirmSavePalette = () => {
    if (lastExtractedPalette && paletteName.trim()) {
      savePalette(
        lastExtractedPalette.colors,
        lastExtractedPalette.hues,
        paletteName.trim(),
        uploadedImage || undefined
      )
      setShowSaveDialog(false)
      setPaletteName('')
    }
  }

  const cancelSavePalette = () => {
    setShowSaveDialog(false)
    setPaletteName('')
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
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={applyPalette}
              className="
                flex-1 py-2 px-4
                bg-blue-700 hover:bg-blue-800
                text-white text-sm font-medium
                rounded-lg
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
              "
            >
              apply to gradient
            </button>
            <button
              onClick={handleSavePalette}
              className="
                px-4 py-2
                bg-gray-700 hover:bg-gray-600
                text-white text-sm font-medium
                rounded-lg
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900
              "
              title="Save palette"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </button>
          </div>

          {/* Save Dialog */}
          {showSaveDialog && (
            <div className="border border-gray-600 rounded-lg p-3 bg-gray-800/50">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Save Palette</h4>
              <input
                type="text"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                placeholder="Enter palette name..."
                className="w-full px-3 py-2 mb-3 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={confirmSavePalette}
                  disabled={!paletteName.trim()}
                  className="
                    flex-1 py-1.5 px-3
                    bg-green-700 hover:bg-green-800 disabled:bg-gray-700 disabled:opacity-50
                    text-white text-xs font-medium
                    rounded
                    transition-colors duration-200
                  "
                >
                  save
                </button>
                <button
                  onClick={cancelSavePalette}
                  className="
                    flex-1 py-1.5 px-3
                    bg-gray-700 hover:bg-gray-600
                    text-white text-xs font-medium
                    rounded
                    transition-colors duration-200
                  "
                >
                  cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 