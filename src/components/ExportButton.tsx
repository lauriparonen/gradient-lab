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
        text-white font-semibold
        rounded-xl
        shadow-lg
        hover:shadow-xl hover:opacity-80
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95
        transition-all duration-200 ease-in-out
        border-0 outline-0
        relative
      "
      style={{
        minWidth: '140px',
        height: '48px'
      }}
    >
      {isExporting ? 'exporting...' : 'export PNG'}
    </button>
  )
} 