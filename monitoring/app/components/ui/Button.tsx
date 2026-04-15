"use client"

import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
}

export default function Button({ variant = 'primary', style, children, ...props }: ButtonProps) {
  const base: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
  }

  const variants: Record<string, React.CSSProperties> = {
    primary: { background: '#2563eb', color: '#fff' },
    secondary: { background: '#f3f4f6', color: '#111827', border: '1px solid #e5e7eb' },
    danger: { background: '#ef4444', color: '#fff' },
  }

  const merged = { ...base, ...(variants[variant] || {}), ...style }

  return (
    <button {...props} style={merged}>
      {children}
    </button>
  )
}
