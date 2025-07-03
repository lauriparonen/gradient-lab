import { useState, useCallback } from 'react'
import ColorThief from 'colorthief'

interface ExtractedPalette {
  colors: [number, number, number][] // RGB values
  hues: number[] // Hue values (0-360) for your shader
  dominantColor: [number, number, number]
}

export const useColorExtraction = () => {
  const [isExtracting, setIsExtracting] = useState(false)
  const [lastExtractedPalette, setLastExtractedPalette] = useState<ExtractedPalette | null>(null)

  // Convert RGB to HSV to extract hue
  const rgbToHsv = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min

    let h = 0
    const s = max === 0 ? 0 : delta / max
    const v = max

    if (delta !== 0) {
      switch (max) {
        case r:
          h = ((g - b) / delta + (g < b ? 6 : 0)) / 6
          break
        case g:
          h = ((b - r) / delta + 2) / 6
          break
        case b:
          h = ((r - g) / delta + 4) / 6
          break
      }
    }

    return [h * 360, s, v] // Return hue in degrees
  }

  const extractColorsFromImage = useCallback(async (file: File): Promise<ExtractedPalette | null> => {
    try {
      setIsExtracting(true)

      // Create image element
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Could not get canvas context')
      }

      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            // Set canvas size to image size
            canvas.width = img.width
            canvas.height = img.height

            // Draw image to canvas
            ctx.drawImage(img, 0, 0)

            // Initialize ColorThief
            const colorThief = new ColorThief()

            // Get dominant color
            const dominantColor = colorThief.getColor(img, 10)

            // Get palette of 5 colors (we'll use 3 main ones)
            const palette = colorThief.getPalette(img, 5, 10)

            console.log('Extracted colors:', { dominantColor, palette })

            // Convert to hues for your shader system
            const hues: number[] = []
            const colors: [number, number, number][] = []

            // Process dominant color
            const [h1] = rgbToHsv(dominantColor[0], dominantColor[1], dominantColor[2])
            
            // Process palette colors (take first 3 most vibrant)
            palette.slice(0, 3).forEach((color) => {
              const [h] = rgbToHsv(color[0], color[1], color[2])
              hues.push(Math.round(h))
              colors.push([color[0], color[1], color[2]])
            })

            // If we don't have 3 colors, fill with variations of the dominant
            while (hues.length < 3) {
              const variation = (h1 + (hues.length * 60)) % 360
              hues.push(Math.round(variation))
              colors.push(dominantColor)
            }

            const result: ExtractedPalette = {
              colors,
              hues,
              dominantColor
            }

            setLastExtractedPalette(result)
            resolve(result)
          } catch (error) {
            console.error('Error extracting colors:', error)
            reject(error)
          }
        }

        img.onerror = () => {
          reject(new Error('Failed to load image'))
        }

        // Convert file to data URL
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            img.src = e.target.result as string
          }
        }
        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error('Color extraction failed:', error)
      return null
    } finally {
      setIsExtracting(false)
    }
  }, [])

  return {
    extractColorsFromImage,
    isExtracting,
    lastExtractedPalette
  }
} 