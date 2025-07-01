import { useCallback, useState, useRef } from 'react'
import GIF from 'gif.js'

interface GIFExportOptions {
  duration?: number // Duration in seconds
  framerate?: number // Frames per second
  quality?: number // 1-30, lower is better
}

export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false)
  const [isRecordingGIF, setIsRecordingGIF] = useState(false)
  const [gifProgress, setGifProgress] = useState(0)
  const gifRef = useRef<GIF | null>(null)
  const recordingIntervalRef = useRef<number | null>(null)
  const frameCountRef = useRef(0)
  const maxFramesRef = useRef(0)

  const surfaceRef = useCallback((node: any) => {
    if (node !== null) {
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

  const getCanvas = (): HTMLCanvasElement | null => {
    const canvases = document.querySelectorAll('canvas')
    if (canvases.length === 0) {
      console.error('No canvas elements found in document')
      return null
    }
    return canvases[canvases.length - 1] as HTMLCanvasElement
  }

  const exportToPNG = async () => {
    try {
      setIsExporting(true)
      
      // Small delay to ensure the frame is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const canvas = getCanvas()
      if (!canvas) return
      
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

  const startGIFRecording = async (options: GIFExportOptions = {}) => {
    const canvas = getCanvas()
    if (!canvas) return

    const { duration = 3, framerate = 15, quality = 10 } = options
    
    setIsRecordingGIF(true)
    setGifProgress(0)
    frameCountRef.current = 0
    maxFramesRef.current = Math.floor(duration * framerate)

    // Initialize GIF encoder
    gifRef.current = new GIF({
      workers: 2,
      quality,
      width: canvas.width,
      height: canvas.height,
      repeat: 0, // 0 = loop forever
      workerScript: '/gif.worker.js'
    })

    // Set up progress tracking
    gifRef.current.on('progress', (progress) => {
      setGifProgress(progress)
    })

    // Set up finished callback
    gifRef.current.on('finished', (blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `gradient-animated-${Date.now()}.gif`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setIsRecordingGIF(false)
      setGifProgress(0)
      frameCountRef.current = 0
      gifRef.current = null
    })

    // Start capturing frames
    const frameInterval = 1000 / framerate // ms between frames
    recordingIntervalRef.current = setInterval(() => {
      if (!gifRef.current || frameCountRef.current >= maxFramesRef.current) {
        stopGIFRecording()
        return
      }

      const currentCanvas = getCanvas()
      if (currentCanvas) {
        gifRef.current.addFrame(currentCanvas, { delay: frameInterval })
        frameCountRef.current++
      }
    }, frameInterval)

    // Auto-stop after duration
    setTimeout(() => {
      stopGIFRecording()
    }, duration * 1000 + 500) // Add small buffer
  }

  const stopGIFRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }

    if (gifRef.current) {
      console.log(`Rendering GIF with ${frameCountRef.current} frames`)
      gifRef.current.render()
    }
  }

  const cancelGIFRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }

    if (gifRef.current) {
      gifRef.current.abort()
      gifRef.current = null
    }

    setIsRecordingGIF(false)
    setGifProgress(0)
    frameCountRef.current = 0
  }

  return {
    surfaceRef,
    isExporting,
    exportToPNG,
    isRecordingGIF,
    gifProgress,
    startGIFRecording,
    stopGIFRecording,
    cancelGIFRecording
  }
} 