import { Surface } from 'gl-react-dom'
import { Node } from 'gl-react'
import { useControls } from 'leva'
import { useState, useRef, useEffect } from 'react'
import { GrainyGradientShader } from './shaders'
import { hueToRGB } from './utils'
import { useAnimationFrame } from './hooks/useAnimationFrame'
import { useExport } from './hooks/useExport'
import { ExportButton } from './components/ExportButton'

// Resolution presets
const RESOLUTION_PRESETS = {
  'Mobile Portrait': { width: 375, height: 667 },
  'Mobile Landscape': { width: 667, height: 375 },
  'Desktop Small': { width: 800, height: 600 },
  'Desktop Medium': { width: 1200, height: 800 },
  'Desktop Large': { width: 1920, height: 1080 },
  'Square Small': { width: 400, height: 400 },
  'Square Medium': { width: 600, height: 600 },
  'Square Large': { width: 800, height: 800 },
  'Instagram Post': { width: 1080, height: 1080 },
  'Instagram Story': { width: 1080, height: 1920 },
  'Custom': { width: 400, height: 600 } // Default custom size
} as const

type ResolutionPreset = keyof typeof RESOLUTION_PRESETS

const TRAIL_LENGTH = 8

interface TrailPoint {
  position: [number, number]
  timestamp: number
}

export default function App() {
  const time = useAnimationFrame()
  const { surfaceRef, isExporting, exportToPNG } = useExport()
  const [mousePos, setMousePos] = useState<[number, number]>([0.5, 0.5])
  const trailRef = useRef<TrailPoint[]>([])
  const lastUpdateRef = useRef<number>(0)
  
  const { 
    hue1, 
    hue2, 
    hue3, 
    grain, 
    scale, 
    speed, 
    resolution,
    customWidth,
    customHeight
  } = useControls({
    // Resolution controls
    resolution: { 
      value: 'Desktop Small' as ResolutionPreset, 
      options: Object.keys(RESOLUTION_PRESETS) as ResolutionPreset[],
      label: 'Resolution Preset'
    },
    customWidth: { 
      value: 400, 
      min: 200, 
      max: 2560, 
      step: 1, 
      label: 'Custom Width',
      render: (get) => get('resolution') === 'Custom'
    },
    customHeight: { 
      value: 600, 
      min: 200, 
      max: 1440, 
      step: 1, 
      label: 'Custom Height',
      render: (get) => get('resolution') === 'Custom'
    },
    
    // Colors
    hue1: { value: 200, min: 0, max: 360, step: 1 },
    hue2: { value: 320, min: 0, max: 360, step: 1 },
    hue3: { value: 60, min: 0, max: 360, step: 1 },
    
    // Organic complexity controls
    scale: { value: 2.0, min: 0.5, max: 5.0, step: 0.1, label: 'Noise Scale' },
    speed: { value: 0.3, min: 0.0, max: 2.0, step: 0.1, label: 'Animation Speed' },
    
    // Grain
    grain: { value: 0.05, min: 0, max: 0.2, step: 0.01 }
  })

  // Get current canvas dimensions
  const canvasDimensions = resolution === 'Custom' 
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
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = 1.0 - (event.clientY - rect.top) / rect.height // Flip Y to match shader coordinates
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
        className="relative border border-gray-700 rounded-lg overflow-hidden"
        style={{ 
          width: canvasDimensions.width, 
          height: canvasDimensions.height,
          maxWidth: '90vw',
          maxHeight: '70vh'
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
              colorA: hueToRGB(hue1),
              colorB: hueToRGB(hue2),
              colorC: hueToRGB(hue3),
              grain,
              scale,
              speed,
              mouse: mousePos,
              trailPositions,
              trailAges
            }}
          />
        </Surface>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <div className="text-gray-400 text-sm text-center">
          <p>{resolution === 'Custom' ? 'Custom' : resolution}: {canvasDimensions.width}×{canvasDimensions.height}</p>
        </div>
        <ExportButton onExport={exportToPNG} isExporting={isExporting} />
        <p className="text-gray-400 text-sm">Press Ctrl+S to export without moving cursor</p>
      </div>
    </div>
  )
}
