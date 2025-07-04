import { useState, useEffect, useCallback } from 'react'

export interface SavedPalette {
  id: string
  name: string
  colors: [number, number, number][] // RGB values
  hues: number[] // Hue values for shader
  createdAt: number
  preview?: string // Optional image preview data URL
}

const STORAGE_KEY = 'gradient-lab-saved-palettes'

export const useSavedPalettes = () => {
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([])

  // Load palettes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const palettes = JSON.parse(stored) as SavedPalette[]
        setSavedPalettes(palettes)
      }
    } catch (error) {
      console.error('Failed to load saved palettes:', error)
    }
  }, [])

  // Save palettes to localStorage whenever they change
  const persistPalettes = useCallback((palettes: SavedPalette[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes))
    } catch (error) {
      console.error('Failed to save palettes to localStorage:', error)
    }
  }, [])

  // Save a new palette
  const savePalette = useCallback((
    colors: [number, number, number][],
    hues: number[],
    name?: string,
    preview?: string
  ) => {
    const newPalette: SavedPalette = {
      id: `palette-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name || `Palette ${savedPalettes.length + 1}`,
      colors,
      hues,
      createdAt: Date.now(),
      preview
    }

    const updatedPalettes = [newPalette, ...savedPalettes]
    setSavedPalettes(updatedPalettes)
    persistPalettes(updatedPalettes)
    
    return newPalette.id
  }, [savedPalettes, persistPalettes])

  // Delete a palette
  const deletePalette = useCallback((id: string) => {
    const updatedPalettes = savedPalettes.filter(p => p.id !== id)
    setSavedPalettes(updatedPalettes)
    persistPalettes(updatedPalettes)
  }, [savedPalettes, persistPalettes])

  // Rename a palette
  const renamePalette = useCallback((id: string, newName: string) => {
    const updatedPalettes = savedPalettes.map(p => 
      p.id === id ? { ...p, name: newName } : p
    )
    setSavedPalettes(updatedPalettes)
    persistPalettes(updatedPalettes)
  }, [savedPalettes, persistPalettes])

  // Get a specific palette
  const getPalette = useCallback((id: string) => {
    return savedPalettes.find(p => p.id === id)
  }, [savedPalettes])

  // Clear all palettes
  const clearAllPalettes = useCallback(() => {
    setSavedPalettes([])
    persistPalettes([])
  }, [persistPalettes])

  return {
    savedPalettes,
    savePalette,
    deletePalette,
    renamePalette,
    getPalette,
    clearAllPalettes
  }
} 