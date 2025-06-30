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
      uniform vec3 colorC;
      uniform float grain;
      uniform float scale;
      uniform float speed;
      uniform float detail;

      // Define mod289 first
      vec3 mod289(vec3 x) { 
        return x - floor(x * (1.0 / 289.0)) * 289.0; 
      }
      
      vec2 mod289(vec2 x) { 
        return x - floor(x * (1.0 / 289.0)) * 289.0; 
      }
      
      // Then permute function
      vec3 permute(vec3 x) { 
        return mod289(((x*34.0)+1.0)*x); 
      }
      
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                            0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                           -0.577350269189626,  // -1.0 + 2.0 * C.x
                            0.024390243902439); // 1.0 / 41.0
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i); // Avoid truncation effects in permutation
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                        + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      // Smoother Fractal Brownian Motion with fewer octaves
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        // Reduced octaves for smoother, less detailed noise
        for(int i = 0; i < 6; i++) {
          value += amplitude * snoise(p * frequency);
          amplitude *= 0.6; // Gentler amplitude decay
          frequency *= 2.0; // Less aggressive frequency progression
        }
        return value;
      }
      
      // Gentle flow distortion instead of high-frequency detail
      float flowNoise(vec2 p) {
        return snoise(p * 2.0) * 0.1 + snoise(p * 0.5) * 0.2;
      }

      void main() {
        vec2 pos = uv * scale;
        float t = time * speed;
        
        // Define blob centers with smoother movement
        vec2 center1 = vec2(0.3 + 0.15 * sin(t * 0.3), 0.4 + 0.12 * cos(t * 0.25));
        vec2 center2 = vec2(0.7 + 0.12 * cos(t * 0.35), 0.6 + 0.15 * sin(t * 0.28));
        vec2 center3 = vec2(0.5 + 0.18 * sin(t * 0.2), 0.2 + 0.14 * cos(t * 0.32));
        
        // Gentler noise distortion for smooth organic shapes
        float flow1 = flowNoise(pos + t * 0.05);
        float flow2 = flowNoise(pos * 1.2 + t * 0.08);
        float flow3 = flowNoise(pos * 0.9 + t * 0.06);
        
        // Smoother distance calculations
        float dist1 = distance(uv, center1) + flow1 * 0.08;
        float dist2 = distance(uv, center2) + flow2 * 0.06;
        float dist3 = distance(uv, center3) + flow3 * 0.1;
        
        // Create very smooth influence zones with larger blend areas
        float influence1 = 1.0 - smoothstep(0.0, 0.8, dist1);
        float influence2 = 1.0 - smoothstep(0.0, 0.7, dist2);
        float influence3 = 1.0 - smoothstep(0.0, 0.9, dist3);
        
        // Smooth color mixing
        vec3 col = colorA;
        col = mix(col, colorB, influence1);
        col = mix(col, colorC, influence2);
        col = mix(col, colorA * 0.7 + colorB * 0.3, influence3);
        
        // Much subtler grain that doesn't interfere with smooth forms
        float subtleGrain = snoise(uv * 300.0 + t * 0.5) * grain * 0.3;
        col += subtleGrain;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `
  }
}) 