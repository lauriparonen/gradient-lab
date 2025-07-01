import { useCallback, useState, useRef } from 'react'
import gifshot from 'gifshot'

interface GIFExportOptions {
  duration?: number // Duration in seconds
  framerate?: number // Frames per second
  quality?: number // 1-30, lower is better
}

export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false)
  const [isRecordingGIF, setIsRecordingGIF] = useState(false)
  const [gifProgress, setGifProgress] = useState(0)
  const recordingIntervalRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const frameCountRef = useRef(0)
  const maxFramesRef = useRef(0)
  const capturedFramesRef = useRef<HTMLCanvasElement[]>([])
  const gifQualityRef = useRef(15)

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

  const convertCanvasTo2D = (sourceCanvas: HTMLCanvasElement): HTMLCanvasElement => {
    const canvas2D = document.createElement('canvas')
    
    // Limit canvas size for GIF performance (max 600px on largest dimension)
    const maxSize = 600
    const scale = Math.min(1, maxSize / Math.max(sourceCanvas.width, sourceCanvas.height))
    
    canvas2D.width = Math.floor(sourceCanvas.width * scale)
    canvas2D.height = Math.floor(sourceCanvas.height * scale)
    
    const ctx = canvas2D.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get 2D context')
    }
    
    // Draw the WebGL canvas onto a 2D canvas with scaling
    ctx.drawImage(sourceCanvas, 0, 0, canvas2D.width, canvas2D.height)
    
    return canvas2D
  }

  const startGIFRecording = async (options: GIFExportOptions = {}) => {
    const canvas = getCanvas()
    if (!canvas) return

    const { duration = 2, framerate = 10, quality = 15 } = options
    
    // Store quality for use in stopGIFRecording
    gifQualityRef.current = quality
    
    setIsRecordingGIF(true)
    setGifProgress(0)
    frameCountRef.current = 0
    maxFramesRef.current = Math.floor(duration * framerate)
    capturedFramesRef.current = []

    console.log(`Starting GIF capture: ${maxFramesRef.current} frames at ${framerate}fps, quality: ${quality}`)
    
    // Small delay to ensure canvas is ready
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Start capturing frames
    const frameInterval = 1000 / framerate
    recordingIntervalRef.current = window.setInterval(() => {
      if (frameCountRef.current >= maxFramesRef.current) {
        console.log(`Stopping capture: frames=${frameCountRef.current}, maxFrames=${maxFramesRef.current}`)
        stopGIFRecording()
        return
      }

      const currentCanvas = getCanvas()
      if (currentCanvas) {
        try {
          console.log(`Capturing frame ${frameCountRef.current + 1}/${maxFramesRef.current}`)
          // Convert WebGL canvas to 2D canvas and store it
          const canvas2D = convertCanvasTo2D(currentCanvas)
          capturedFramesRef.current.push(canvas2D)
          frameCountRef.current++
        } catch (error) {
          console.error('Error capturing frame:', error)
        }
      } else {
        console.error('No canvas found for frame capture')
      }
    }, frameInterval)

    // Auto-stop after duration
    timeoutRef.current = window.setTimeout(() => {
      stopGIFRecording()
    }, duration * 1000 + 500) // Add small buffer
  }

  const stopGIFRecording = () => {
    // Clear interval and timeout
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    console.log(`Creating GIF with ${capturedFramesRef.current.length} frames`)
    
    if (capturedFramesRef.current.length === 0) {
      console.error('No frames captured for GIF!')
      setIsRecordingGIF(false)
      setGifProgress(0)
      return
    }

    try {
      // Use gifshot to create the GIF
      gifshot.createGIF({
        images: capturedFramesRef.current,
        interval: 0.1, // 100ms between frames (10 fps)
        sampleInterval: gifQualityRef.current,
        progressCallback: (progress) => {
          console.log('GIF progress:', progress)
          setGifProgress(progress)
        }
      }, (obj) => {
        if (obj.error) {
          console.error('GIF creation error:', obj.errorMsg)
          setIsRecordingGIF(false)
          setGifProgress(0)
          return
        }

        console.log('GIF created successfully!')
        
        // Download the GIF
        const link = document.createElement('a')
        link.href = obj.image
        link.download = `gradient-animated-${Date.now()}.gif`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Clean up
        setIsRecordingGIF(false)
        setGifProgress(0)
        frameCountRef.current = 0
        capturedFramesRef.current = []
      })
      
    } catch (error) {
      console.error('Error creating GIF:', error)
      setIsRecordingGIF(false)
      setGifProgress(0)
      frameCountRef.current = 0
      capturedFramesRef.current = []
    }
  }

  const cancelGIFRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    setIsRecordingGIF(false)
    setGifProgress(0)
    frameCountRef.current = 0
    capturedFramesRef.current = []
    console.log('GIF recording cancelled')
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