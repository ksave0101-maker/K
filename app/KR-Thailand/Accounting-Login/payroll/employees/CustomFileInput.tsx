import React, { useRef } from 'react'

type CustomFileInputProps = {
  label: string
  icon: string
  file: File | null
  onChange: (file: File | null) => void
  accept: string
  L: (en: string, th: string) => string
}

export default function CustomFileInput({
  label,
  icon,
  file,
  onChange,
  accept,
  L
}: CustomFileInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    onChange(selectedFile)
  }

  return (
    <div>
      <label style={{
        display: 'block',
        marginBottom: 8,
        fontWeight: 600,
        fontSize: 13
      }}>
        {icon} {label}
      </label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Custom button */}
      <button
        type="button"
        onClick={handleButtonClick}
        style={{
          width: '100%',
          padding: '12px 16px',
          border: '2px dashed #d1d5db',
          borderRadius: 8,
          fontSize: 13,
          outline: 'none',
          cursor: 'pointer',
          background: file ? '#f0fdf4' : '#fff',
          color: file ? '#059669' : '#6b7280',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transition: 'all 0.2s',
          fontWeight: file ? 600 : 400
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = file ? '#dcfce7' : '#f9fafb'
          e.currentTarget.style.borderColor = '#6366f1'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = file ? '#f0fdf4' : '#fff'
          e.currentTarget.style.borderColor = '#d1d5db'
        }}
      >
        {file ? (
          <>
            <span style={{ fontSize: 16 }}>✓</span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file.name}
            </span>
            <span style={{
              fontSize: 11,
              color: '#059669',
              background: '#dcfce7',
              padding: '2px 8px',
              borderRadius: 4
            }}>
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </>
        ) : (
          <>
            <span style={{ fontSize: 16 }}>📎</span>
            <span>{L('Choose file...', 'เลือกไฟล์...')}</span>
          </>
        )}
      </button>

      {file && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onChange(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
          }}
          style={{
            marginTop: 6,
            padding: '4px 12px',
            background: '#fee2e2',
            color: '#dc2626',
            border: 'none',
            borderRadius: 6,
            fontSize: 12,
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          🗑️ {L('Remove', 'ลบไฟล์')}
        </button>
      )}
    </div>
  )
}
