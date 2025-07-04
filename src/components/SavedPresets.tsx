import { useState } from 'react'
import type { AppPreset } from '../hooks/usePresets'

interface SavedPresetsProps {
  onPresetApplied: (preset: AppPreset) => void
  onSaveCurrentPreset: (name?: string) => void
  savedPresets: AppPreset[]
  onDeletePreset: (id: string) => void
  onRenamePreset: (id: string, newName: string) => void
  onClearAllPresets: () => void
}

export const SavedPresets = ({ 
  onPresetApplied, 
  onSaveCurrentPreset,
  savedPresets,
  onDeletePreset,
  onRenamePreset,
  onClearAllPresets
}: SavedPresetsProps) => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const handleApplyPreset = (preset: AppPreset) => {
    onPresetApplied(preset)
  }

  const handleStartEdit = (preset: AppPreset) => {
    setEditingId(preset.id)
    setEditingName(preset.name)
  }

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      onRenamePreset(editingId, editingName.trim())
    }
    setEditingId(null)
    setEditingName('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const handleSaveNewPreset = () => {
    setShowSaveDialog(true)
    setNewPresetName(`Preset ${new Date().toLocaleDateString()}`)
  }

  const confirmSavePreset = () => {
    if (newPresetName.trim()) {
      onSaveCurrentPreset(newPresetName.trim())
      setShowSaveDialog(false)
      setNewPresetName('')
      
      // Show success toast
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    }
  }

  const cancelSavePreset = () => {
    setShowSaveDialog(false)
    setNewPresetName('')
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPresetPreview = (preset: AppPreset) => {
    const { colors } = preset.settings
    return [
      [colors.hue1, colors.brightness1],
      [colors.hue2, colors.brightness2], 
      [colors.hue3, colors.brightness3]
    ]
  }

  // Convert hue to RGB for preview (simplified)
  const hueToRgb = (hue: number, brightness: number = 1.0): string => {
    const s = 0.6 // Fixed saturation
    const v = brightness
    const c = v * s
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1))
    const m = v - c
    let r = 0, g = 0, b = 0

    if (0 <= hue && hue < 60) { r = c; g = x; b = 0 }
    else if (60 <= hue && hue < 120) { r = x; g = c; b = 0 }
    else if (120 <= hue && hue < 180) { r = 0; g = c; b = x }
    else if (180 <= hue && hue < 240) { r = 0; g = x; b = c }
    else if (240 <= hue && hue < 300) { r = x; g = 0; b = c }
    else if (300 <= hue && hue < 360) { r = c; g = 0; b = x }

    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)

    return `rgb(${r}, ${g}, ${b})`
  }

  return (
    <div className="space-y-3">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out">
          <div className="bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">Preset saved successfully!</span>
          </div>
        </div>
      )}

      {/* Header with save and clear buttons */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Saved Presets ({savedPresets.length})</h3>
        <div className="flex gap-2">
          <button
            onClick={handleSaveNewPreset}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            save current
          </button>
          {savedPresets.length > 0 && (
            <button
              onClick={onClearAllPresets}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors duration-200"
            >
              clear all
            </button>
          )}
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="border border-gray-600 rounded-lg p-3 bg-gray-800/50">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Save Current Preset</h4>
          <input
            type="text"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="Enter preset name..."
            className="w-full px-3 py-2 mb-3 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={confirmSavePreset}
              disabled={!newPresetName.trim()}
              className="
                flex-1 py-1.5 px-3
                bg-green-700 hover:bg-green-800 disabled:bg-gray-700 disabled:opacity-50
                text-white text-xs font-medium
                rounded
                transition-colors duration-200
              "
            >
              save
            </button>
            <button
              onClick={cancelSavePreset}
              className="
                flex-1 py-1.5 px-3
                bg-gray-700 hover:bg-gray-600
                text-white text-xs font-medium
                rounded
                transition-colors duration-200
              "
            >
              cancel
            </button>
          </div>
        </div>
      )}

      {/* Preset List */}
      {savedPresets.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-gray-400 mb-1">No saved presets yet</p>
          <p className="text-xs text-gray-500">Save your current settings as a preset</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {savedPresets.map((preset) => (
            <div key={preset.id} className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
              {/* Preset Header */}
              <div className="flex items-center justify-between mb-2">
                {editingId === preset.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSaveEdit}
                    className="bg-gray-700 text-white text-sm px-2 py-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none flex-1 mr-2"
                    autoFocus
                  />
                ) : (
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">{preset.name}</h4>
                    <p className="text-xs text-gray-500">{formatDate(preset.createdAt)}</p>
                  </div>
                )}
                
                {editingId !== preset.id && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleStartEdit(preset)}
                      className="p-1 text-gray-500 hover:text-white transition-colors duration-200"
                      title="Rename"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDeletePreset(preset.id)}
                      className="p-1 text-gray-500 hover:text-red-400 transition-colors duration-200"
                      title="Delete"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Color Preview */}
              <div className="flex gap-1 mb-3">
                {getPresetPreview(preset).map(([hue, brightness], index) => (
                  <div key={index} className="flex flex-col items-center gap-1">
                    <div
                      className="w-6 h-6 rounded border border-gray-600/50"
                      style={{ backgroundColor: hueToRgb(hue, brightness) }}
                    />
                    <span className="text-xs text-gray-500">{Math.round(hue)}°</span>
                  </div>
                ))}
              </div>

              {/* Settings Summary */}
              <div className="text-xs text-gray-500 mb-3 grid grid-cols-2 gap-1">
                <span>Scale: {preset.settings.animation.scale}</span>
                <span>Speed: {preset.settings.animation.speed}</span>
                <span>Ripples: {preset.settings.effects.rippleStrength}</span>
                <span>Canvas: {preset.settings.canvas.resolution}</span>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => handleApplyPreset(preset)}
                className="
                  w-full py-1.5 px-3
                  bg-purple-700/80 hover:bg-purple-700
                  text-white text-xs font-medium
                  rounded
                  transition-colors duration-200
                  focus:outline-none focus:ring-1 focus:ring-purple-500
                "
              >
                apply preset
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 