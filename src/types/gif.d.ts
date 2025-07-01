declare module 'gif.js' {
  interface GIFOptions {
    workers?: number
    quality?: number
    width?: number
    height?: number
    background?: string
    transparent?: string
    dither?: boolean
    debug?: boolean
    repeat?: number
    globalPalette?: boolean
    workerScript?: string
  }

  interface GIFFrame {
    data: ImageData | HTMLCanvasElement | CanvasRenderingContext2D
    delay?: number
  }

  class GIF {
    constructor(options?: GIFOptions)
    
    addFrame(canvas: HTMLCanvasElement | ImageData | CanvasRenderingContext2D, options?: { delay?: number }): void
    
    render(): void
    
    on(event: 'finished', callback: (blob: Blob) => void): void
    on(event: 'progress', callback: (progress: number) => void): void
    on(event: 'abort', callback: () => void): void
    
    abort(): void
  }

  export default GIF
} 