/**
 * Convert HSV color values to RGB
 * @param h Hue (0-1)
 * @param s Saturation (0-1) 
 * @param v Value/Brightness (0-1)
 * @returns RGB values as [r, g, b] array (0-1 range)
 */
export const hsv2rgb = (h: number, s: number, v: number): [number, number, number] => {
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

/**
 * Convert hue value (0-360) to RGB for shader use
 * @param hue Hue value in degrees (0-360)
 * @returns RGB values as [r, g, b] array
 */
export const hueToRGB = (hue: number, brightness: number = 1.0): [number, number, number] => {
  return hsv2rgb(hue / 360, 0.6, brightness);
} 