import { useState, useEffect, useCallback } from 'react'

export interface AppPreset {
  id: string
  name: string
  createdAt: number
  settings: {
    // Colors
    colors: {
      hue1: number
      hue2: number  
      hue3: number
      brightness1: number
      brightness2: number
      brightness3: number
    }
    // Animation
    animation: {
      scale: number
      speed: number
      grain: number
    }
    // Effects
    effects: {
      rippleSpeed: number
      rippleWidth: number
      rippleLifetime: number
      rippleStrength: number
      rippleFrequency: number
    }
    // Canvas
    canvas: {
      resolution: string
      customWidth: number
      customHeight: number
    }
    // Export (optional - maybe not needed for presets)
    export?: {
      gifDuration: number
      gifFramerate: number
      gifQuality: number
    }
  }
}

const STORAGE_KEY = 'gradient-lab-presets'

export const usePresets = () => {
  const [savedPresets, setSavedPresets] = useState<AppPreset[]>([])

  // Load presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const presets = JSON.parse(stored) as AppPreset[]
        setSavedPresets(presets)
      }
    } catch (error) {
      console.error('Failed to load saved presets:', error)
    }
  }, [])

  // Save presets to localStorage whenever they change
  const persistPresets = useCallback((presets: AppPreset[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
    } catch (error) {
      console.error('Failed to save presets to localStorage:', error)
    }
  }, [])

  // Save a new preset
  const savePreset = useCallback((
    currentSettings: AppPreset['settings'],
    name?: string
  ) => {
    const newPreset: AppPreset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name || `Preset ${savedPresets.length + 1}`,
      createdAt: Date.now(),
      settings: currentSettings
    }

    const updatedPresets = [newPreset, ...savedPresets]
    setSavedPresets(updatedPresets)
    persistPresets(updatedPresets)
    
    return newPreset.id
  }, [savedPresets, persistPresets])

  // Delete a preset
  const deletePreset = useCallback((id: string) => {
    const updatedPresets = savedPresets.filter(p => p.id !== id)
    setSavedPresets(updatedPresets)
    persistPresets(updatedPresets)
  }, [savedPresets, persistPresets])

  // Rename a preset
  const renamePreset = useCallback((id: string, newName: string) => {
    const updatedPresets = savedPresets.map(p => 
      p.id === id ? { ...p, name: newName } : p
    )
    setSavedPresets(updatedPresets)
    persistPresets(updatedPresets)
  }, [savedPresets, persistPresets])

  // Get a specific preset
  const getPreset = useCallback((id: string) => {
    return savedPresets.find(p => p.id === id)
  }, [savedPresets])

  // Clear all presets
  const clearAllPresets = useCallback(() => {
    setSavedPresets([])
    persistPresets([])
  }, [persistPresets])

  return {
    savedPresets,
    savePreset,
    deletePreset,
    renamePreset,
    getPreset,
    clearAllPresets
  }
} 