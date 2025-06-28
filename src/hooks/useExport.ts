import { useCallback, useState, useRef } from 'react'

export const useExport = () => {
  const [surfaceElement, setSurfaceElement] = useState<any>(null)
  const [isExporting, setIsExporting] = useState(false)

  const surfaceRef = useCallback((node: any) => {
    if (node !== null) {
      setSurfaceElement(node)
      console.log('Surface ref set:', node)
      console.log('Surface ref type:', typeof node)
      console.log('Surface ref constructor:', node.constructor.name)
      
      // Log all available properties and methods
      console.log('Surface ref properties:', Object.getOwnPropertyNames(node))
      console.log('Surface ref prototype:', Object.getPrototypeOf(node))
      
      // Try to find canvas in the DOM hierarchy
      if (node.parentElement) {
        const canvasInParent = node.parentElement.querySelector('canvas')
        console.log('Canvas in parent:', canvasInParent)
      }
      
      // Look for canvas as next sibling or anywhere in the document
      const allCanvases = document.querySelectorAll('canvas')
      console.log('All canvases in document:', allCanvases)
    }
  }, [])

  const exportToPNG = async () => {
    try {
      setIsExporting(true)
      
      // Small delay to ensure the frame is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // First, try to find canvas in the document
      const canvases = document.querySelectorAll('canvas')
      console.log('Found canvases:', canvases)
      
      if (canvases.length === 0) {
        console.error('No canvas elements found in document')
        return
      }
      
      // Use the first canvas (or last if multiple)
      const canvas = canvases[canvases.length - 1] as HTMLCanvasElement
      console.log('Using canvas:', canvas)
      console.log('Canvas width:', canvas.width, 'height:', canvas.height)
      
      // Check if toBlob exists
      if (typeof canvas.toBlob === 'function') {
        canvas.toBlob((blob) => {
          if (!blob) {
            console.error('Failed to create blob from canvas')
            return
          }
          
          console.log('Blob created successfully:', blob)
          
          // Create download link
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `gradient-${Date.now()}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }, 'image/png', 1.0)
      } else if (typeof canvas.toDataURL === 'function') {
        // Fallback to toDataURL
        console.log('Using toDataURL fallback')
        const dataURL = canvas.toDataURL('image/png', 1.0)
        const link = document.createElement('a')
        link.href = dataURL
        link.download = `gradient-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        console.error('Canvas does not support toBlob or toDataURL')
      }
      
    } catch (error) {
      console.error('Failed to export PNG:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return {
    surfaceRef,
    isExporting,
    exportToPNG
  }
} 