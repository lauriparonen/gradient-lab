import { Surface } from 'gl-react-dom'
import { Node } from 'gl-react'
import { useControls } from 'leva'
import { GrainyGradientShader } from './shaders'
import { hueToRGB } from './utils'
import { useAnimationFrame } from './hooks/useAnimationFrame'

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 600

export default function App() {
  const time = useAnimationFrame()
  
  const { hue1, hue2, grain } = useControls({
    hue1: { value: 200, min: 0, max: 360 },
    hue2: { value: 320, min: 0, max: 360 },
    grain: { value: 0.05, min: 0, max: 0.2 }
  })

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center"
      style={{ backgroundColor: '#000000' }}
    >
      <Surface width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
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
    </div>
  )
}
