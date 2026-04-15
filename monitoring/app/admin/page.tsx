"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminMainPage from './main/main_page'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      const token = localStorage.getItem('k_system_admin_token')
      if (token) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        router.replace('/admin/AdminKsavelogin')
      }
    } catch (error) {
      console.error('Authentication check failed:', error)
      setIsAuthenticated(false)
      router.replace('/admin/AdminKsavelogin')
    }
  }, [router])

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ 
          padding: '24px', 
          background: '#fff', 
          borderRadius: '8px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
        }}>
          <div>Checking authentication...</div>
        </div>
      </div>
    )
  }

  // Show login redirect if not authenticated  
  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ 
          padding: '24px', 
          background: '#fff', 
          borderRadius: '8px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
        }}>
          <div>Redirecting to login...</div>
        </div>
      </div>
    )
  }

  // Show admin main page if authenticated
  return <AdminMainPage />
}