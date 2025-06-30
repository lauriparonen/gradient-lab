import { Surface } from 'gl-react-dom'
import { Node } from 'gl-react'
import { useControls } from 'leva'
import { GrainyGradientShader } from './shaders'
import { hueToRGB } from './utils'
import { useAnimationFrame } from './hooks/useAnimationFrame'
import { useExport } from './hooks/useExport'
import { ExportButton } from './components/ExportButton'

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 600

export default function App() {
  const time = useAnimationFrame()
  const { surfaceRef, isExporting, exportToPNG } = useExport()
  
  const { hue1, hue2, hue3, grain, scale, speed } = useControls({
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

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: '#000000' }}
    >
      <Surface 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT} 
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
            speed
          }}
        />
      </Surface>
      
      <ExportButton onExport={exportToPNG} isExporting={isExporting} />
    </div>
  )
}
