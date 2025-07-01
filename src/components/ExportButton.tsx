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
    <div className="flex flex-col items-center gap-3">
      {/* PNG Export Button */}
      <button
        onClick={onExportPNG}
        disabled={isExporting || isRecordingGIF}
        className="
          px-6 py-2 
          text-white font-semibold text-sm
          rounded-lg
          shadow-lg
          hover:shadow-xl hover:opacity-80
          disabled:opacity-50 disabled:cursor-not-allowed
          active:scale-95
          transition-all duration-200 ease-in-out
          border-0 outline-0
          bg-blue-600 hover:bg-blue-700
        "
        style={{
          minWidth: '120px',
          height: '40px'
        }}
      >
        {isExporting ? 'exporting...' : 'export PNG'}
      </button>

      {/* GIF Export Button */}
      <button
        onClick={handleGIFExport}
        disabled={isExporting}
        className="
          px-6 py-2 
          text-white font-semibold text-sm
          rounded-lg
          shadow-lg
          hover:shadow-xl hover:opacity-80
          disabled:opacity-50 disabled:cursor-not-allowed
          active:scale-95
          transition-all duration-200 ease-in-out
          border-0 outline-0
          relative overflow-hidden
        "
        style={{
          minWidth: '120px',
          height: '40px',
          backgroundColor: isRecordingGIF ? '#ef4444' : '#16a34a',
        }}
      >
        {/* Progress bar for GIF rendering */}
        {isRecordingGIF && gifProgress > 0 && (
          <div 
            className="absolute left-0 top-0 h-full bg-white bg-opacity-20 transition-all duration-300"
            style={{ width: `${gifProgress * 100}%` }}
          />
        )}
        
        <span className="relative z-10">
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