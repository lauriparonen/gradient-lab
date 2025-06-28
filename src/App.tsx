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
  
  const { hue1, hue2, grain } = useControls({
    hue1: { value: 200, min: 0, max: 360 },
    hue2: { value: 320, min: 0, max: 360 },
    grain: { value: 0.05, min: 0, max: 0.2 }
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
            grain
          }}
        />
      </Surface>
      
      <ExportButton onExport={exportToPNG} isExporting={isExporting} />
    </div>
  )
}
