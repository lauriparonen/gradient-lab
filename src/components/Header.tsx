import { useState } from 'react'
import { ColorPaletteUploader } from './ColorPaletteUploader'
import { SavedPalettes } from './SavedPalettes'

interface HeaderProps {
  onPaletteExtracted: (hues: number[]) => void
}

export function Header({ onPaletteExtracted }: HeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isPaletteDropdownOpen, setIsPaletteDropdownOpen] = useState(false)
  const [isSavedPalettesOpen, setIsSavedPalettesOpen] = useState(false)

  return (
    <>
      <header className="w-full bg-black/80 backdrop-blur-sm border-b border-gray-800 px-6 py-4 relative z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Hamburger Menu */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-300 hover:text-white transition-colors duration-200 
                       border border-gray-600 hover:border-gray-400 rounded-md
                       flex items-center justify-center"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Title */}
          <h1 className="text-2xl font-light text-white tracking-wide">
            gradient lab
          </h1>

          {/* Spacer to balance layout */}
          <div className="w-9"></div>
        </div>
      </header>

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 bg-gray-900/95 backdrop-blur-md border-r border-gray-700 
                   transform transition-transform duration-300 ease-in-out z-[60] flex flex-col
                   ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-medium text-white">Features</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Color Palette Feature */}
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setIsPaletteDropdownOpen(!isPaletteDropdownOpen)}
              className="w-full p-4 text-left text-gray-300 hover:text-white hover:bg-gray-800/50 
                         transition-all duration-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9M21 9H9M21 13H9" />
                </svg>
                <span>image color palette</span>
              </div>
              <svg 
                className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isPaletteDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Palette Dropdown Content */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out
                         ${isPaletteDropdownOpen ? 'max-h-[50vh] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="p-4 bg-gray-800/30 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-3">
                  extract colors from an image to use as your gradient palette
                </p>
                <div className="max-h-64 overflow-y-auto">
                  <ColorPaletteUploader onPaletteExtracted={onPaletteExtracted} />
                </div>
              </div>
            </div>
          </div>

          {/* Saved Palettes Feature */}
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setIsSavedPalettesOpen(!isSavedPalettesOpen)}
              className="w-full p-4 text-left text-gray-300 hover:text-white hover:bg-gray-800/50 
                         transition-all duration-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>saved palettes</span>
              </div>
              <svg 
                className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isSavedPalettesOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Saved Palettes Dropdown Content */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out
                         ${isSavedPalettesOpen ? 'max-h-[50vh] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="p-4 bg-gray-800/30 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-3">
                  manage and apply your saved color palettes
                </p>
                <div className="max-h-64 overflow-y-auto">
                  <SavedPalettes onPaletteApplied={onPaletteExtracted} />
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder for future features */}
          <div className="border border-gray-700 rounded-lg overflow-hidden opacity-50">
            <div className="w-full p-4 text-left text-gray-500 flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              <span>more features coming soon...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300" 
          onClick={() => {
            setIsSidebarOpen(false)
            setIsPaletteDropdownOpen(false)
            setIsSavedPalettesOpen(false)
          }}
        />
      )}
    </>
  )
} 