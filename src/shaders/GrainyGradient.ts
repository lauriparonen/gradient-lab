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
      uniform vec2 mouse;
      uniform float trailPositions[16]; // 8 points * 2 coordinates
      uniform float trailAges[8];
      uniform vec2 resolution;

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
          amplitude *= 0.6; 
          frequency *= 2.0; 
        }
        return value;
      }
      
      // Gentle flow distortion instead of high-frequency detail
      float flowNoise(vec2 p) {
        return snoise(p * 2.0) * 0.1 + snoise(p * 0.5) * 0.2;
      }

      void main() {
        // Calculate pixel-based scale to maintain consistent visual density
        float pixelScale = max(resolution.x, resolution.y) / 800.0; // Base scale for 800px reference
        vec2 pos = uv * scale * pixelScale;
        float t = time * speed;
        
        // Calculate combined trail ripple effects
        float totalRippleEffect = 0.0;
        vec2 totalDistortion = vec2(0.0);
        
        for (int i = 0; i < 8; i++) {
          vec2 trailPos = vec2(trailPositions[i * 2], trailPositions[i * 2 + 1]);
          float age = trailAges[i];
          
          // Skip invalid positions
          if (trailPos.x < 0.0 || age > 10.0) continue;
          
          float distance = distance(uv, trailPos);
          
          // Create expanding ripples based on age
          float rippleRadius = age * 0.4; // Ripples expand over time
          float rippleWidth = 0.08;
          
          // Calculate ripple intensity - peaks when distance matches ripple radius
          float rippleIntensity = 1.0 - smoothstep(0.0, rippleWidth, abs(distance - rippleRadius));
          
          // Fade the ripple over time
          float ageFade = 1.0 - smoothstep(0.0, 3.0, age);
          
          float rippleStrength = rippleIntensity * ageFade * 0.3;
          totalRippleEffect += rippleStrength;
          
          // Add radial distortion from each ripple
          vec2 rippleDirection = normalize(uv - trailPos);
          totalDistortion += rippleDirection * rippleStrength * 0.05 * sin(t * 3.0 + distance * 20.0);
        }
        
        // Apply ripple distortion to UV coordinates
        vec2 rippleDistortedUV = uv + totalDistortion;
        
        // Current mouse effect (reduced since we have trail effects now)
        float mouseDistance = distance(uv, mouse);
        float mouseEffect = (1.0 - smoothstep(0.0, 0.4, mouseDistance)) * 0.5;
        
        // Create additional distortion around current mouse
        vec2 mouseDirection = normalize(uv - mouse);
        float distortionStrength = mouseEffect * 0.08;
        vec2 currentMouseDistortion = mouseDirection * distortionStrength * sin(t * 2.0 + mouseDistance * 15.0);
        
        // Combine all distortions
        vec2 finalDistortedUV = rippleDistortedUV + currentMouseDistortion;
        
        // Mouse influence on blob centers
        float mouseInfluence = 0.6;
        vec2 mouseOffset = (mouse - 0.5) * mouseInfluence;
        
        // Add trail ripple influence to blob movement
        vec2 trailInfluence = totalDistortion * 2.0;
        
        // Define blob centers with mouse and trail influence
        vec2 center1 = vec2(0.3 + 0.15 * sin(t * 0.3), 0.4 + 0.12 * cos(t * 0.25)) + mouseOffset * 1.2 + trailInfluence;
        vec2 center2 = vec2(0.7 + 0.12 * cos(t * 0.35), 0.6 + 0.15 * sin(t * 0.28)) + mouseOffset * -1.0 + trailInfluence * 0.8;
        vec2 center3 = vec2(0.5 + 0.18 * sin(t * 0.2), 0.2 + 0.14 * cos(t * 0.32)) + mouseOffset * 1.5 + trailInfluence * 1.2;
        
        // Add warping with combined effects
        float combinedEffect = mouseEffect + totalRippleEffect;
        vec2 warpedUV1 = finalDistortedUV + combinedEffect * 0.08 * sin(finalDistortedUV * 12.0 + t);
        vec2 warpedUV2 = finalDistortedUV + combinedEffect * 0.06 * cos(finalDistortedUV * 10.0 + t * 1.2);
        vec2 warpedUV3 = finalDistortedUV + combinedEffect * 0.1 * sin(finalDistortedUV * 15.0 + t * 0.8);
        
        // Enhanced flow noise
        float flow1 = flowNoise(pos + t * 0.05 + mouse * 0.6) * (1.0 + combinedEffect * 1.5);
        float flow2 = flowNoise(pos * 1.2 + t * 0.08 + mouse * 0.4) * (1.0 + combinedEffect * 1.2);
        float flow3 = flowNoise(pos * 0.9 + t * 0.06 + mouse * 0.8) * (1.0 + combinedEffect * 1.8);
        
        // Distance calculations using warped UV coordinates
        float dist1 = distance(warpedUV1, center1) + flow1 * 0.12;
        float dist2 = distance(warpedUV2, center2) + flow2 * 0.10;
        float dist3 = distance(warpedUV3, center3) + flow3 * 0.15;
        
        // Add shape deformation based on combined effects
        dist1 *= (1.0 + combinedEffect * 0.4 * sin(atan(warpedUV1.y - center1.y, warpedUV1.x - center1.x) * 3.0 + t));
        dist2 *= (1.0 + combinedEffect * 0.3 * cos(atan(warpedUV2.y - center2.y, warpedUV2.x - center2.x) * 4.0 + t * 1.3));
        dist3 *= (1.0 + combinedEffect * 0.5 * sin(atan(warpedUV3.y - center3.y, warpedUV3.x - center3.x) * 5.0 + t * 0.7));
        
        // Create influence zones
        float influence1 = 1.0 - smoothstep(0.0, 0.8 * (1.0 + combinedEffect * 0.3), dist1);
        float influence2 = 1.0 - smoothstep(0.0, 0.7 * (1.0 + combinedEffect * 0.2), dist2);
        float influence3 = 1.0 - smoothstep(0.0, 0.9 * (1.0 + combinedEffect * 0.4), dist3);
        
        // Smooth color mixing
        vec3 col = colorA;
        col = mix(col, colorB, influence1);
        col = mix(col, colorC, influence2);
        col = mix(col, colorA * 0.7 + colorB * 0.3, influence3);
        
        // Much subtler grain that doesn't interfere with smooth forms
        // Scale grain sampling based on actual pixel density
        float grainScale = pixelScale * 300.0;
        float subtleGrain = snoise(uv * grainScale + t * 0.5) * grain * 0.3;
        col += subtleGrain;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `
  }
}) 