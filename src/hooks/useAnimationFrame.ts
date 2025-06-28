import { useEffect, useState } from 'react'

/**
 * Custom hook for animation frame updates
 * @returns Current time in seconds
 */
export const useAnimationFrame = () => {
  const [time, setTime] = useState(0)

  useEffect(() => {
    let animationId: number
    
    const animate = () => {
      setTime(performance.now() * 0.001)
      animationId = requestAnimationFrame(animate)
    }
    
    animationId = requestAnimationFrame(animate)
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return time
} 