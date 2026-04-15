"use client"

import React, { useState, useRef, useEffect } from 'react'
import AccWindow, { useLang } from '../../components/AccWindow'
import * as faceapi from 'face-api.js'

export default function FaceScanInPage() {
  const { L } = useLang()
  const [scanning, setScanning] = useState(false)
  const [success, setSuccess] = useState(false)
  const [employee, setEmployee] = useState<any>(null)
  const [time, setTime] = useState('')
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // โหลด AI models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        setModelsLoaded(true)
      } catch (err) {
        console.error('Error loading models:', err)
        setError(L('Failed to load AI models', 'โหลด AI models ไม่สำเร็จ'))
      }
    }
    loadModels()
  }, [])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setScanning(true)
    } catch (err) {
      alert(L('Cannot access camera', 'ไม่สามารถเข้าถึงกล้องได้'))
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setScanning(false)
  }

  const handleScan = async () => {
    if (!videoRef.current || !modelsLoaded) return

    setLoading(true)
    setError('')

    try {
      // ตรวจจับใบหน้า
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (!detections) {
        setError(L('No face detected', 'ไม่พบใบหน้า'))
        setLoading(false)
        return
      }

      // วาดกรอบใบหน้า
      if (canvasRef.current && videoRef.current) {
        const canvas = canvasRef.current
        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight
        }
        faceapi.matchDimensions(canvas, displaySize)
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, [resizedDetections])
        faceapi.draw.drawFaceLandmarks(canvas, [resizedDetections])
      }

      // บันทึกรูป
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)

      // ตรวจสอบใบหน้า
      const faceDescriptor = Array.from(detections.descriptor)

      const res = await fetch('/api/face-recognition/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faceDescriptor,
          type: 'checkin',
          imageUrl: imageDataUrl
        })
      })

      const data = await res.json()

      if (data.success) {
        setEmployee({
          id: data.employee.userId,
          name: data.employee.name_th || data.employee.name,
          email: data.employee.email,
          time: data.time
        })
        setSuccess(true)
        stopCamera()

        // Auto reset after 5 seconds
        setTimeout(() => {
          setSuccess(false)
          setEmployee(null)
        }, 5000)
      } else {
        setError(data.message || L('Face not recognized', 'ไม่สามารถระบุตัวตนได้'))
      }
    } catch (err: any) {
      console.error('Scan error:', err)
      setError(err.message || L('An error occurred', 'เกิดข้อผิดพลาด'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  return (
    <AccWindow title={L('บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด', 'K Energy Save Co., Ltd.')}>
      <div style={{ padding: 30, maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: 16,
          padding: '30px 40px',
          marginBottom: 30,
          color: '#fff',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(16,185,129,0.3)'
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            📸 {L('Face Scan Clock-In', 'สแกนหน้าเข้างาน')}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 12, opacity: 0.95 }}>
            {time}
          </div>
        </div>

        {!modelsLoaded && (
          <div style={{
            background: '#fef3c7',
            border: '2px solid #fbbf24',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            textAlign: 'center',
            color: '#92400e',
            fontWeight: 600
          }}>
            ⏳ {L('Loading AI models...', 'กำลังโหลด AI models...')}
          </div>
        )}

        {!success ? (
          <>
            {/* Camera View */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: 30,
              marginBottom: 20,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '2px solid #e5e7eb'
            }}>
              <div style={{
                background: '#1f2937',
                borderRadius: 12,
                overflow: 'hidden',
                position: 'relative',
                aspectRatio: '4/3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {scanning ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <canvas
                      ref={canvasRef}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>
                    <div style={{ fontSize: 80, marginBottom: 20 }}>📷</div>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>
                      {L('Click "Start Camera" to scan your face', 'กดปุ่ม "เปิดกล้อง" เพื่อเริ่มสแกนใบหน้า')}
                    </div>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
                {!scanning ? (
                  <button
                    onClick={startCamera}
                    disabled={!modelsLoaded}
                    style={{
                      padding: '14px 32px',
                      fontSize: 16,
                      fontWeight: 700,
                      background: modelsLoaded ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#9ca3af',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      cursor: modelsLoaded ? 'pointer' : 'not-allowed',
                      boxShadow: modelsLoaded ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => modelsLoaded && (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    📷 {L('Start Camera', 'เปิดกล้อง')}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleScan}
                      disabled={loading}
                      style={{
                        padding: '14px 32px',
                        fontSize: 16,
                        fontWeight: 700,
                        background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: loading ? 'none' : '0 4px 12px rgba(59,130,246,0.3)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {loading ? '⏳ กำลังตรวจสอบ...' : `✅ ${L('Scan Face', 'สแกนใบหน้า')}`}
                    </button>
                    <button
                      onClick={stopCamera}
                      disabled={loading}
                      style={{
                        padding: '14px 32px',
                        fontSize: 16,
                        fontWeight: 700,
                        background: loading ? '#9ca3af' : '#6b7280',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => !loading && (e.currentTarget.style.background = '#4b5563')}
                      onMouseLeave={e => !loading && (e.currentTarget.style.background = '#6b7280')}
                    >
                      ❌ {L('Cancel', 'ยกเลิก')}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: '#fee2e2',
                border: '2px solid #ef4444',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                color: '#991b1b',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Instructions */}
            <div style={{
              background: '#eff6ff',
              border: '2px solid #3b82f6',
              borderRadius: 12,
              padding: 20,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1e40af', marginBottom: 8 }}>
                💡 {L('Instructions', 'คำแนะนำ')}
              </div>
              <ul style={{ margin: 0, paddingLeft: 24, color: '#1e40af', fontSize: 13, lineHeight: 1.8 }}>
                <li>{L('Position your face in the camera frame', 'จัดตำแหน่งใบหน้าให้อยู่ในกรอบกล้อง')}</li>
                <li>{L('Remove glasses and mask for better accuracy', 'ถอดแว่นและหน้ากากเพื่อความแม่นยำ')}</li>
                <li>{L('Ensure good lighting', 'ตรวจสอบว่ามีแสงสว่างเพียงพอ')}</li>
                <li>{L('Click "Scan Face" when ready', 'กดปุ่ม "สแกนใบหน้า" เมื่อพร้อม')}</li>
              </ul>
            </div>
          </>
        ) : (
          /* Success Message */
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: 16,
            padding: 50,
            textAlign: 'center',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(16,185,129,0.4)'
          }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>✅</div>
            <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
              {L('Clock-In Successful!', 'บันทึกเวลาเข้างานสำเร็จ!')}
            </div>
            {employee && (
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 12,
                padding: 24,
                marginTop: 24,
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
                  {L('Employee Information', 'ข้อมูลพนักงาน')}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{employee.name}</div>
                <div style={{ fontSize: 16, opacity: 0.95 }}>
                  {L('ID', 'รหัส')}: {employee.id}
                </div>
                <div style={{ fontSize: 16, opacity: 0.95 }}>{employee.email}</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 16 }}>
                  ⏰ {employee.time || time}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </AccWindow>
  )
}
