"use client"

import React, { useEffect, useState } from 'react'

const PRINT_SCALE_STORAGE_KEY = 'k_system_admin_print_scale'
const SCALE_OPTIONS = [70, 80, 90, 100, 110, 120]

export default function PrintStyles() {
  const [printScale, setPrintScale] = useState(100)

  useEffect(() => {
    try {
      const savedScale = Number(localStorage.getItem(PRINT_SCALE_STORAGE_KEY) || '100')
      const nextScale = Number.isFinite(savedScale) && savedScale > 0 ? savedScale : 100
      setPrintScale(nextScale)
      document.documentElement.style.setProperty('--print-scale', String(nextScale / 100))
    } catch {
      document.documentElement.style.setProperty('--print-scale', '1')
    }

    return () => {
      document.documentElement.style.setProperty('--print-scale', '1')
    }
  }, [])

  function handleScaleChange(nextScale: number) {
    setPrintScale(nextScale)
    document.documentElement.style.setProperty('--print-scale', String(nextScale / 100))
    try {
      localStorage.setItem(PRINT_SCALE_STORAGE_KEY, String(nextScale))
    } catch {}
  }

  return (
    <>
      <style>{`
      :root {
        --print-scale: 1;
      }

      /* Print page size */
      @page { size: A4 portrait; margin: 12mm; }

      /* Apply exact color printing where supported */
      html, body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      /* Make the on-screen preview closely match the printed page */
      .a4-page {
        width: 210mm;
        min-height: 297mm;
        margin: 0 auto 16px auto;
        padding: 12mm;
        /* Reserve extra bottom space so signature block won't overlap footer */
        padding-bottom: 40mm;
        position: relative; /* make footer absolute positioning scoped to this page */
        background: white;
        box-shadow: 0 6px 24px rgba(0,0,0,0.12);
        box-sizing: border-box;
        color: #222;
        transform-origin: top center;
        overflow: visible;
      }

      @media screen {
        .a4-page {
          zoom: var(--print-scale);
        }
      }

      @media print {
        html, body {
          height: auto !important;
          overflow: visible !important;
          background: white !important;
        }

        .a4-page {
          width: auto !important;
          max-width: none !important;
          min-height: auto !important;
          height: auto !important;
          zoom: var(--print-scale);
          overflow: visible !important;
        }
      }

      /* Hide the browser's vertical scrollbar in screen preview while keeping scrolling functional */
      @media screen {
        html, body {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
      }

      /* Ensure headers/footers and layout are preserved in preview */
      .no-print { display: block; }
      @media print {
        .no-print { display: none !important; }
        .a4-page {
          box-shadow: none;
          margin: 0;
          padding-bottom: 18mm;
          page-break-after: auto;
          break-after: auto;
        }

        /* Make table headers repeat on each printed page */
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }

        /* Allow the items table to break across pages cleanly */
        .items-table { page-break-inside: auto; }
        .items-table tr { page-break-inside: avoid; page-break-after: auto; }

        /* Keep summary blocks together when possible */
        .info-section,
        .summary-section,
        .summary-table,
        .payment-section,
        .payment-grid,
        .signature-section,
        .signature-box,
        .footer-info {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        /* Make footer act as a footer in print (attempt to place at bottom of each page)
           and fall back to positioned footer in screen preview */
        .footer-info {
          display: flex;
          position: static;
          margin-top: 6mm;
          padding-top: 4mm;
          flex-wrap: wrap;
          gap: 8px;
        }
      }

      /* Space below signature area so it doesn't collide with footer */
      .signature-section { margin-bottom: 8mm; }

      /* Hide the visible scrollbar on the A4 preview while keeping content scrollable */
      .a4-page { -ms-overflow-style: none; scrollbar-width: none; }
      .a4-page::-webkit-scrollbar { display: none; }

      /* Footer adjustments: smaller text and pinned to page bottom */
      .footer-info {
        position: absolute;
        bottom: 4mm;
        left: 12mm;
        right: 12mm;
        display: flex;
        justify-content: space-between;
        font-size: 7pt;
        color: #777;
        border-top: 1px solid #eee;
        padding-top: 6px;
        box-sizing: border-box;
      }

      /* Page number element (works when printing) */
      .footer-info .page-number::before {
        content: "Page " counter(page) " of " counter(pages);
      }

      /* Make description column left-aligned by default in preview */
      .items-table td:first-child, .items-table th:first-child { text-align: center; }
      .items-table td:nth-child(2), .items-table th:nth-child(2) { text-align: left; }

      /* Preserve background colors on print where possible */
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    `}</style>
      <div
        className="no-print"
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          borderRadius: 14,
          background: 'rgba(17, 24, 39, 0.9)',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <label htmlFor="print-scale-select" style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
          ขนาดพิมพ์ %
        </label>
        <select
          id="print-scale-select"
          value={printScale}
          onChange={(event) => handleScaleChange(Number(event.target.value))}
          style={{
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.25)',
            background: '#fff',
            color: '#111827',
            fontSize: 13,
            fontWeight: 600,
            padding: '6px 10px',
            cursor: 'pointer',
          }}
        >
          {SCALE_OPTIONS.map((scaleOption) => (
            <option key={scaleOption} value={scaleOption}>
              {scaleOption}%
            </option>
          ))}
        </select>
      </div>
    </>
  )
}
