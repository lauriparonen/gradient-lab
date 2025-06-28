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

      // High-resolution Fractal Brownian Motion
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        // Increased octaves for more detail
        for(int i = 0; i < 8; i++) {
          value += amplitude * snoise(p * frequency);
          amplitude *= 0.5;
          frequency *= 3.0 + detail * 0.5; // Detail affects frequency progression
        }
        return value;
      }
      
      // High-frequency detail layer
      float detailNoise(vec2 p) {
        float highFreq = snoise(p * 220.0 * detail);
        float midFreq = snoise(p * 8.0 * detail) * 0.5;
        return (highFreq + midFreq) * 0.3;
      }

      void main() {
        vec2 pos = uv * scale;
        float t = time * speed;
        
        // Define blob centers with time-based movement
        vec2 center1 = vec2(0.3 + 0.1 * sin(t * 0.7), 0.4 + 0.1 * cos(t * 0.5));
        vec2 center2 = vec2(0.7 + 0.1 * cos(t * 0.8), 0.6 + 0.1 * sin(t * 0.6));
        vec2 center3 = vec2(0.5 + 0.15 * sin(t * 0.4), 0.2 + 0.1 * cos(t * 0.9));
        
        // Distance to each blob center with enhanced noise distortion
        float noise1 = fbm(pos + t * 0.1) + detailNoise(pos + t * 0.05) * 0.5;
        float noise2 = fbm(pos * 1.5 + t * 0.15) + detailNoise(pos * 1.2 + t * 0.08) * 0.4;
        float noise3 = fbm(pos * 0.8 + t * 0.05) + detailNoise(pos * 0.9 + t * 0.12) * 0.6;
        
        float dist1 = distance(uv, center1) + noise1 * 0.2;
        float dist2 = distance(uv, center2) + noise2 * 0.15;
        float dist3 = distance(uv, center3) + noise3 * 0.25;
        
        // Create smooth influence zones
        float influence1 = 1.0 - smoothstep(0.0, 0.6, dist1);
        float influence2 = 1.0 - smoothstep(0.0, 0.5, dist2);
        float influence3 = 1.0 - smoothstep(0.0, 0.7, dist3);
        
        // Mix colors based on influences
        vec3 col = colorA;
        col = mix(col, colorB, influence1);
        col = mix(col, colorC, influence2);
        col = mix(col, colorA * 0.8 + colorB * 0.2, influence3);
        
        // Enhanced grain with detail
        float grainNoise = fbm(uv * 50.0 + t) * grain * 0.1;
        grainNoise += detailNoise(uv * 80.0 + t) * grain * 0.05;
        col += grainNoise;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `
  }
}) 