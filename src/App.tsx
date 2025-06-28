import { Surface } from 'gl-react-dom'
import { Node, Shaders } from 'gl-react'
import { useControls } from 'leva'
import { useEffect, useState } from 'react'

// shader with proper vertex and fragment parts
const shaders = Shaders.create({
  GrainyGrad: {
    vert: `
      attribute vec2 position;
      varying vec2 uv;
      void main() {
        uv = (position + 1.0) / 2.0;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `,
    frag: `
      precision highp float;
      varying vec2 uv;
      uniform float time;
      uniform vec3 colorA;
      uniform vec3 colorB;
      uniform float grain;

      float rand(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        // smooth vertical gradient
        vec3 col = mix(colorA, colorB, uv.y);

        // cheap grain
        float noise = rand(uv + time) * grain;
        col += noise;

        gl_FragColor = vec4(col, 1.0);
      }
    `
  }
})

export default function App() {
  const [time, setTime] = useState(0)
  const { hue1, hue2, grain } = useControls({
    hue1: { value: 200, min: 0, max: 360 },
    hue2: { value: 320, min: 0, max: 360 },
    grain: { value: 0.05, min: 0, max: 0.2 }
  })

  useEffect(() => {
    const animate = () => {
      setTime(performance.now() * 0.001)
      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  const hsv2rgb = (h: number, s: number, v: number): [number, number, number] => {
    const c = v * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 1/6) { r = c; g = x; b = 0; }
    else if (1/6 <= h && h < 2/6) { r = x; g = c; b = 0; }
    else if (2/6 <= h && h < 3/6) { r = 0; g = c; b = x; }
    else if (3/6 <= h && h < 4/6) { r = 0; g = x; b = c; }
    else if (4/6 <= h && h < 5/6) { r = x; g = 0; b = c; }
    else if (5/6 <= h && h < 1) { r = c; g = 0; b = x; }
    
    return [r + m, g + m, b + m];
  }

  const toRGB = (h: number) =>
    hsv2rgb(h / 360, 0.6, 1.0)

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <Surface width={window.innerWidth} height={window.innerHeight}>
        <Node
          shader={shaders.GrainyGrad}
          uniforms={{
            time,
            colorA: toRGB(hue1),
            colorB: toRGB(hue2),
            grain
          }}
        />
      </Surface>
    </div>
  )
}
