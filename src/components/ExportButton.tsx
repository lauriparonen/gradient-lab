interface ExportButtonProps {
  onExportPNG: () => void
  onStartGIFRecording: () => void
  onCancelGIFRecording: () => void
  isExporting: boolean
  isRecordingGIF: boolean
  gifProgress: number
  gifDuration?: number
  gifFramerate?: number
}

export const ExportButton = ({ 
  onExportPNG, 
  onStartGIFRecording, 
  onCancelGIFRecording,
  isExporting,
  isRecordingGIF,
  gifProgress,
  gifDuration = 3,
  gifFramerate = 15
}: ExportButtonProps) => {
  const handleGIFExport = () => {
    if (isRecordingGIF) {
      onCancelGIFRecording()
    } else {
      onStartGIFRecording()
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* PNG Export Button */}
      <button
        onClick={onExportPNG}
        disabled={isExporting || isRecordingGIF}
        className="
          relative
          px-8 py-3
          font-medium text-white text-sm
          rounded-xl
          bg-black
          border border-gray-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transform transition-all duration-200 ease-out
          hover:scale-105 hover:border-gray-600
          active:scale-95
          focus:outline-none
        "
        style={{
          minWidth: '140px'
        }}
      >
        {/* Loading spinner */}
        {isExporting && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        
        <span className="flex items-center justify-center gap-2">
          {!isExporting && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          {isExporting ? 'exporting...' : 'export PNG'}
        </span>
      </button>

      {/* GIF Export Button */}
      <button
        onClick={handleGIFExport}
        disabled={isExporting}
        className="
          relative overflow-hidden
          px-8 py-3
          font-medium text-white text-sm
          rounded-xl
          bg-black
          border border-gray-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transform transition-all duration-200 ease-out
          hover:scale-105 hover:border-gray-600
          active:scale-95
          focus:outline-none
        "
        style={{
          minWidth: '140px'
        }}
      >
        {/* Progress bar for GIF rendering */}
        {isRecordingGIF && gifProgress > 0 && (
          <div 
            className="absolute left-0 top-0 h-full bg-white/20 transition-all duration-300"
            style={{ width: `${gifProgress * 100}%` }}
          />
        )}
        
        {/* Loading spinner for encoding */}
        {isRecordingGIF && gifProgress > 0 && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        
        <span className="relative z-10 flex items-center justify-center gap-2">
          {!isRecordingGIF && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
          {isRecordingGIF && gifProgress === 0 && (
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          )}
          {isRecordingGIF 
            ? gifProgress > 0 
              ? `encoding... ${Math.round(gifProgress * 100)}%`
              : 'recording...'
            : 'record GIF'
          }
        </span>
      </button>
      
      {/* Info text */}
      {isRecordingGIF && (
        <p className="text-gray-400 text-xs text-center max-w-48">
          Recording {gifDuration}s at {gifFramerate}fps. Click to cancel.
        </p>
      )}
    </div>
  )
} 