import { useState } from 'react'
import { useSavedPalettes, type SavedPalette } from '../hooks/useSavedPalettes'

interface SavedPalettesProps {
  onPaletteApplied: (hues: number[]) => void
}

export const SavedPalettes = ({ onPaletteApplied }: SavedPalettesProps) => {
  const { savedPalettes, deletePalette, renamePalette, clearAllPalettes } = useSavedPalettes()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleApplyPalette = (palette: SavedPalette) => {
    onPaletteApplied(palette.hues)
  }

  const handleStartEdit = (palette: SavedPalette) => {
    setEditingId(palette.id)
    setEditingName(palette.name)
  }

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      renamePalette(editingId, editingName.trim())
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (savedPalettes.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-sm text-gray-400 mb-1">No saved palettes yet</p>
        <p className="text-xs text-gray-500">Extract colors from images to save palettes</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header with clear all button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Saved Palettes ({savedPalettes.length})</h3>
        {savedPalettes.length > 0 && (
          <button
            onClick={clearAllPalettes}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors duration-200"
          >
            clear all
          </button>
        )}
      </div>

      {/* Palette List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {savedPalettes.map((palette) => (
          <div key={palette.id} className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
            {/* Palette Header */}
            <div className="flex items-center justify-between mb-2">
              {editingId === palette.id ? (
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
                  <h4 className="text-sm font-medium text-white">{palette.name}</h4>
                  <p className="text-xs text-gray-500">{formatDate(palette.createdAt)}</p>
                </div>
              )}
              
              {editingId !== palette.id && (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleStartEdit(palette)}
                    className="p-1 text-gray-500 hover:text-white transition-colors duration-200"
                    title="Rename"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deletePalette(palette.id)}
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

            {/* Color Swatches */}
            <div className="flex gap-1 mb-3">
              {palette.colors.map((color, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div
                    className="w-6 h-6 rounded border border-gray-600/50"
                    style={{
                      backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`
                    }}
                  />
                  <span className="text-xs text-gray-500">
                    {palette.hues[index]}°
                  </span>
                </div>
              ))}
            </div>

            {/* Apply Button */}
            <button
              onClick={() => handleApplyPalette(palette)}
              className="
                w-full py-1.5 px-3
                bg-blue-700/80 hover:bg-blue-700
                text-white text-xs font-medium
                rounded
                transition-colors duration-200
                focus:outline-none focus:ring-1 focus:ring-blue-500
              "
            >
              apply to gradient
            </button>
          </div>
        ))}
      </div>
    </div>
  )
} 