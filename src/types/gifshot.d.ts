declare module 'gifshot' {
  interface GifshotOptions {
    images?: string[] | HTMLCanvasElement[] | ImageData[]
    gifWidth?: number
    gifHeight?: number
    interval?: number // Time between frames in seconds
    numFrames?: number
    frameDuration?: number
    fontWeight?: string
    fontSize?: string
    fontFamily?: string
    fontColor?: string
    textAlign?: string
    textBaseline?: string
    sampleInterval?: number
    numWorkers?: number
    progressCallback?: (progress: number) => void
    completeCallback?: () => void
  }

  interface GifshotResult {
    image: string // base64 data URL
    error?: boolean
    errorCode?: string
    errorMsg?: string
  }

  interface Gifshot {
    createGIF(options: GifshotOptions, callback: (obj: GifshotResult) => void): void
    createGIF(options: GifshotOptions): Promise<GifshotResult>
  }

  const gifshot: Gifshot
  export default gifshot
} 