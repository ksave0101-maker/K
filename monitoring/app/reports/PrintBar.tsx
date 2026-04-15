"use client"
import React from 'react'

export default function PrintBar() {
  return (
    <div style={{ display: 'inline-flex', gap: 8 }}>
      <button className="k-btn" onClick={() => window.print()}>Print</button>
      <button className="k-btn k-btn-ghost" onClick={() => window.location.reload()}>Refresh</button>
    </div>
  )
}
