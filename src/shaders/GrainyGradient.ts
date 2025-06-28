import { Shaders } from 'gl-react'

export const GrainyGradientShader = Shaders.create({
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