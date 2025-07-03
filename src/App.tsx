import { Surface } from 'gl-react-dom'
import { Node } from 'gl-react'
import { useControls } from 'leva'
import { useState, useRef, useEffect } from 'react'
import { GrainyGradientShader } from './shaders'
import { hueToRGB } from './utils'
import { useAnimationFrame } from './hooks/useAnimationFrame'
import { useExport } from './hooks/useExport'
import { ExportButton } from './components/ExportButton'
import { ColorPaletteUploader } from './components/ColorPaletteUploader'

// Resolution presets
const RESOLUTION_PRESETS = {
  'mobile portrait': { width: 375, height: 667 },
  'mobile landscape': { width: 667, height: 375 },
  'desktop small': { width: 800, height: 600 },
  'desktop medium': { width: 1200, height: 800 },
  'desktop large': { width: 1920, height: 1080 },
  'square small': { width: 400, height: 400 },
  'square medium': { width: 600, height: 600 },
  'square large': { width: 800, height: 800 },
  'instagram post': { width: 1080, height: 1080 },
  'instagram story': { width: 1080, height: 1920 },
  'custom': { width: 400, height: 600 } // Default custom size
} as const

type ResolutionPreset = keyof typeof RESOLUTION_PRESETS

const TRAIL_LENGTH = 8

interface TrailPoint {
  position: [number, number]
  timestamp: number
}

export default function App() {
  const time = useAnimationFrame()
  const { 
    surfaceRef, 
    isExporting, 
    exportToPNG,
    isRecordingGIF,
    gifProgress,
    startGIFRecording,
    cancelGIFRecording
  } = useExport()
  const [mousePos, setMousePos] = useState<[number, number]>([0.5, 0.5])
  const trailRef = useRef<TrailPoint[]>([])
  const lastUpdateRef = useRef<number>(0)
  
  // 🎨 Colors Panel
  const [
    { 
      hue1, 
      hue2, 
      hue3, 
      brightness1,
      brightness2,
      brightness3
    },
    setColors
  ] = useControls('🎨 Colors', () => ({
    hue1: { value: 200, min: 0, max: 360, step: 1, label: 'color 1 hue' },
    brightness1: { value: 1.0, min: 0.0, max: 1.0, step: 0.01, label: 'color 1 brightness' },
    hue2: { value: 320, min: 0, max: 360, step: 1, label: 'color 2 hue' },
    brightness2: { value: 1.0, min: 0.0, max: 1.0, step: 0.01, label: 'color 2 brightness' },
    hue3: { value: 60, min: 0, max: 360, step: 1, label: 'color 3 hue' },
    brightness3: { value: 1.0, min: 0.0, max: 1.0, step: 0.01, label: 'color 3 brightness' }
  }))

  // 🎬 Animation Panel
  const { 
    scale, 
    speed, 
    grain
  } = useControls('🎬 Animation', {
    scale: { value: 2.0, min: 0.5, max: 5.0, step: 0.1, label: 'noise scale' },
    speed: { value: 0.3, min: 0.0, max: 2.0, step: 0.1, label: 'animation speed' },
    grain: { value: 0.05, min: 0, max: 0.2, step: 0.01, label: 'grain' }
  })

  // 🌊 Effects Panel
  const { 
    rippleSpeed,
    rippleWidth,
    rippleLifetime,
    rippleStrength,
    rippleFrequency
  } = useControls('🌊 Effects', {
    rippleSpeed: { value: 0.4, min: 0.1, max: 1.0, step: 0.01, label: 'ripple expansion speed' },
    rippleWidth: { value: 0.08, min: 0.02, max: 0.2, step: 0.01, label: 'ripple width' },
    rippleLifetime: { value: 3.0, min: 1.0, max: 8.0, step: 0.1, label: 'ripple lifetime' },
    rippleStrength: { value: 0.3, min: 0.0, max: 1.0, step: 0.01, label: 'ripple strength' },
    rippleFrequency: { value: 20.0, min: 5.0, max: 50.0, step: 1.0, label: 'ripple frequency' }
  })

  // 📐 Canvas Panel
  const { 
    resolution,
    customWidth,
    customHeight
  } = useControls('📐 Canvas', {
    resolution: { 
      value: 'desktop small' as ResolutionPreset, 
      options: Object.keys(RESOLUTION_PRESETS) as ResolutionPreset[],
      label: 'resolution preset'
    },
    customWidth: { 
      value: 400, 
      min: 200, 
      max: 2560, 
      step: 1, 
      label: 'custom width',
      render: (get) => get('resolution') === 'custom'
    },
    customHeight: { 
      value: 600, 
      min: 200, 
      max: 1440, 
      step: 1, 
      label: 'custom height',
      render: (get) => get('resolution') === 'custom'
    }
  })

  // 📤 Export Panel
  const { 
    gifDuration,
    gifFramerate,
    gifQuality
  } = useControls('📤 Export', {
    gifDuration: { value: 2, min: 1, max: 10, step: 0.5, label: 'GIF duration (seconds)' },
    gifFramerate: { value: 10, min: 5, max: 30, step: 1, label: 'GIF framerate (fps)' },
    gifQuality: { value: 15, min: 1, max: 30, step: 1, label: 'GIF quality (lower = better)' }
  })

  // Handler for applying extracted color palette
  const handlePaletteExtracted = (hues: number[]) => {
    setColors({
      hue1: hues[0] || 200,
      hue2: hues[1] || 320, 
      hue3: hues[2] || 60
    })
  }

  // Get current canvas dimensions
  const canvasDimensions = resolution === 'custom' 
    ? { width: customWidth, height: customHeight }
    : RESOLUTION_PRESETS[resolution]

  // Add keyboard event listener for Ctrl+S
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault() // Prevent browser's save dialog
        exportToPNG()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [exportToPNG])

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    updatePositionFromEvent(event.clientX, event.clientY, event.currentTarget)
  }

  // Extract position calculation logic for reuse between mouse and touch events
  const updatePositionFromEvent = (clientX: number, clientY: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect()
    const x = (clientX - rect.left) / rect.width
    const y = 1.0 - (clientY - rect.top) / rect.height // Flip Y to match shader coordinates
    const newPos: [number, number] = [Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y))]
    
    setMousePos(newPos)
    
    // Add to trail if enough time has passed or distance is significant
    const now = time
    const lastPoint = trailRef.current[trailRef.current.length - 1]
    const shouldAddPoint = !lastPoint || 
      (now - lastUpdateRef.current > 0.1) || // Time threshold
      (Math.abs(newPos[0] - lastPoint.position[0]) > 0.02 || Math.abs(newPos[1] - lastPoint.position[1]) > 0.02) // Distance threshold
    
    if (shouldAddPoint) {
      trailRef.current.push({
        position: newPos,
        timestamp: now
      })
      
      // Keep only the most recent trail points
      if (trailRef.current.length > TRAIL_LENGTH) {
        trailRef.current.shift()
      }
      
      lastUpdateRef.current = now
    }
  }

  // Touch event handlers for mobile support
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault() // Prevent scrolling
    const touch = event.touches[0]
    if (touch) {
      updatePositionFromEvent(touch.clientX, touch.clientY, event.currentTarget)
    }
  }

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault() // Prevent scrolling
    const touch = event.touches[0]
    if (touch) {
      updatePositionFromEvent(touch.clientX, touch.clientY, event.currentTarget)
    }
  }

  // Prepare trail data for shader
  const trailPositions: number[] = []
  const trailAges: number[] = []
  
  for (let i = 0; i < TRAIL_LENGTH; i++) {
    if (i < trailRef.current.length) {
      const point = trailRef.current[i]
      trailPositions.push(point.position[0], point.position[1])
      trailAges.push(time - point.timestamp)
    } else {
      trailPositions.push(-1, -1) // Invalid position to ignore in shader
      trailAges.push(999)
    }
  }

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: '#000000' }}
    >
      <div 
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className="relative rounded-lg overflow-hidden"
        style={{ 
          width: canvasDimensions.width, 
          height: canvasDimensions.height,
          maxWidth: '90vw',
          maxHeight: '70vh',
          touchAction: 'none'
        }}
      >
        <Surface 
          width={canvasDimensions.width} 
          height={canvasDimensions.height} 
          ref={surfaceRef}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
        >
          <Node
            shader={GrainyGradientShader.GrainyGrad}
            uniforms={{
              time,
              colorA: hueToRGB(hue1, brightness1),
              colorB: hueToRGB(hue2, brightness2),
              colorC: hueToRGB(hue3, brightness3),
              grain,
              scale,
              speed,
              mouse: mousePos,
              trailPositions,
              trailAges,
              resolution: [canvasDimensions.width, canvasDimensions.height],
              rippleSpeed,
              rippleWidth,
              rippleLifetime,
              rippleStrength,
              rippleFrequency
            }}
          />
        </Surface>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <div className="text-gray-400 text-sm text-center">
          <p>{resolution === 'custom' ? 'Custom' : resolution}: {canvasDimensions.width}×{canvasDimensions.height}</p>
        </div>
        <ExportButton 
          onExportPNG={exportToPNG}
          onStartGIFRecording={() => startGIFRecording({
            duration: gifDuration,
            framerate: gifFramerate,
            quality: gifQuality
          })}
          onCancelGIFRecording={cancelGIFRecording}
          isExporting={isExporting}
          isRecordingGIF={isRecordingGIF}
          gifProgress={gifProgress}
          gifDuration={gifDuration}
          gifFramerate={gifFramerate}
        />
        
        {/* Color Palette Uploader */}
        <ColorPaletteUploader onPaletteExtracted={handlePaletteExtracted} />
        
        <p className="text-gray-400 text-sm">press Ctrl+S to export PNG without moving cursor</p>
      </div>
    </div>
  )
}
