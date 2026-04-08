'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function CallbackClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')

    if (token) {
      // Store token in localStorage (since we can't set httpOnly cookies from frontend)
      localStorage.setItem('token', token)
      router.push('/dashboard')
    } else {
      router.push('/')
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-text text-lg">Authenticating...</p>
      </div>
    </div>
  )
}
