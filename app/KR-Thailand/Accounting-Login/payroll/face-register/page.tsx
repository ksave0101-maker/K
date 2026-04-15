"use client"

import React, { useState, useRef, useEffect } from 'react'
import AccWindow, { useLang } from '../../components/AccWindow'
import * as faceapi from 'face-api.js'

interface Employee {
  userId: number
  name: string
  name_th?: string
  email: string
}

export default function FaceRegisterPage() {
  const { L } = useLang()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  // ดึงรายชื่อพนักงาน
  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/payroll/employees')
      const data = await res.json()
      if (data.employees) {
        setEmployees(data.employees)
      }
    } catch (err) {
      console.error('Error fetching employees:', err)
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setScanning(true)
      setError('')
    } catch (err) {
      setError(L('Cannot access camera', 'ไม่สามารถเข้าถึงกล้องได้'))
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setScanning(false)
  }

  const handleCapture = async () => {
    if (!videoRef.current || !modelsLoaded || !selectedEmployee) return

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

      // บันทึก face descriptor
      const faceDescriptor = Array.from(detections.descriptor)

      const res = await fetch('/api/face-recognition/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedEmployee.userId,
          faceDescriptor,
          imageUrl: imageDataUrl
        })
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        stopCamera()
        setTimeout(() => {
          setSuccess(false)
          setSelectedEmployee(null)
        }, 3000)
      } else {
        setError(data.message || L('Registration failed', 'ลงทะเบียนไม่สำเร็จ'))
      }
    } catch (err: any) {
      console.error('Capture error:', err)
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
      <div style={{ padding: 30, maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          background: '#6b7280',
          borderRadius: 12,
          padding: '24px 32px',
          marginBottom: 24,
          color: '#fff',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            📸 {L('Face Registration', 'ลงทะเบียนใบหน้าพนักงาน')}
          </div>
          <div style={{ fontSize: 13, marginTop: 8, opacity: 0.9 }}>
            {L('Register employee face for clock-in/out system', 'ลงทะเบียนใบหน้าสำหรับระบบเช็คเวลาเข้า-ออกงาน')}
          </div>
        </div>

        {!modelsLoaded && (
          <div style={{
            background: '#fef3c7',
            border: '2px solid #fbbf24',
            borderRadius: 8,
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
          <div style={{
            background: '#f9fafb',
            borderRadius: 12,
            padding: 24,
            border: '2px solid #d1d5db'
          }}>
            {/* เลือกพนักงาน */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#374151' }}>
                {L('Select Employee', 'เลือกพนักงาน')} *
              </label>
              <select
                value={selectedEmployee?.userId || ''}
                onChange={e => {
                  const emp = employees.find(em => em.userId === parseInt(e.target.value))
                  setSelectedEmployee(emp || null)
                  setError('')
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: 14,
                  borderRadius: 8,
                  border: '2px solid #d1d5db',
                  background: '#fff'
                }}
              >
                <option value="">{L('-- Select Employee --', '-- เลือกพนักงาน --')}</option>
                {employees.map(emp => (
                  <option key={emp.userId} value={emp.userId}>
                    {emp.name_th || emp.name} ({emp.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Camera View */}
            {selectedEmployee && (
              <>
                <div style={{
                  background: '#1f2937',
                  borderRadius: 12,
                  overflow: 'hidden',
                  position: 'relative',
                  marginBottom: 16
                }}>
                  {scanning ? (
                    <div style={{ position: 'relative' }}>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{ width: '100%', display: 'block' }}
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
                    <div style={{ textAlign: 'center', color: '#9ca3af', padding: 60 }}>
                      <div style={{ fontSize: 60, marginBottom: 16 }}>📷</div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>
                        {L('Click "Start Camera" to begin', 'กดปุ่ม "เปิดกล้อง" เพื่อเริ่ม')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Control Buttons */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  {!scanning ? (
                    <button
                      onClick={startCamera}
                      disabled={!modelsLoaded}
                      style={{
                        padding: '12px 28px',
                        fontSize: 15,
                        fontWeight: 700,
                        background: modelsLoaded ? '#6b7280' : '#9ca3af',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        cursor: modelsLoaded ? 'pointer' : 'not-allowed'
                      }}
                    >
                      📷 {L('Start Camera', 'เปิดกล้อง')}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCapture}
                        disabled={loading}
                        style={{
                          padding: '12px 28px',
                          fontSize: 15,
                          fontWeight: 700,
                          background: loading ? '#9ca3af' : '#10b981',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {loading ? '⏳ กำลังบันทึก...' : `✅ ${L('Capture & Save', 'ถ่ายและบันทึก')}`}
                      </button>
                      <button
                        onClick={stopCamera}
                        disabled={loading}
                        style={{
                          padding: '12px 28px',
                          fontSize: 15,
                          fontWeight: 700,
                          background: '#6b7280',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        ❌ {L('Cancel', 'ยกเลิก')}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                marginTop: 16,
                background: '#fee2e2',
                border: '2px solid #ef4444',
                borderRadius: 8,
                padding: 12,
                color: '#991b1b',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Instructions */}
            <div style={{
              marginTop: 20,
              background: '#eff6ff',
              border: '2px solid #3b82f6',
              borderRadius: 8,
              padding: 16
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1e40af', marginBottom: 8 }}>
                💡 {L('Instructions', 'คำแนะนำ')}
              </div>
              <ul style={{ margin: 0, paddingLeft: 24, color: '#1e40af', fontSize: 13, lineHeight: 1.8 }}>
                <li>{L('Position your face in the center of the camera', 'จัดตำแหน่งใบหน้าให้อยู่ตรงกลางกล้อง')}</li>
                <li>{L('Face the camera directly', 'หันหน้าเข้ากล้องโดยตรง')}</li>
                <li>{L('Remove glasses and mask for best results', 'ถอดแว่นและหน้ากากเพื่อผลลัพธ์ที่ดีที่สุด')}</li>
                <li>{L('Ensure good lighting', 'ตรวจสอบว่ามีแสงสว่างเพียงพอ')}</li>
                <li>{L('Click "Capture" when ready', 'กดปุ่ม "ถ่ายและบันทึก" เมื่อพร้อม')}</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Success Message */
          <div style={{
            background: '#10b981',
            borderRadius: 12,
            padding: 50,
            textAlign: 'center',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(16,185,129,0.3)'
          }}>
            <div style={{ fontSize: 70, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
              {L('Registration Successful!', 'ลงทะเบียนสำเร็จ!')}
            </div>
            <div style={{ fontSize: 16, opacity: 0.95 }}>
              {selectedEmployee?.name_th || selectedEmployee?.name}
            </div>
          </div>
        )}

      </div>
    </AccWindow>
  )
}
