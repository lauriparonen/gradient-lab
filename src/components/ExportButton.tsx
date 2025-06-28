interface ExportButtonProps {
  onExport: () => void
  isExporting: boolean
}

export const ExportButton = ({ onExport, isExporting }: ExportButtonProps) => {
  return (
    <button
      onClick={onExport}
      disabled={isExporting}
      className="
        px-8 py-3 
        bg-gradient-to-r from-blue-500 to-purple-600 
        text-white font-semibold 
        rounded-xl 
        shadow-lg 
        hover:from-blue-600 hover:to-purple-700 
        hover:shadow-xl 
        disabled:opacity-50 disabled:cursor-not-allowed 
        active:scale-95 
        transition-all duration-200 ease-in-out
        border-0 outline-0
      "
      style={{
        minWidth: '140px',
        height: '48px'
      }}
    >
      {isExporting ? 'Exporting...' : 'Export PNG'}
    </button>
  )
} 