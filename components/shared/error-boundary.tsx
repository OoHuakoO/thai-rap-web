'use client'

import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { ErrorPage } from './error-page'
import { ROUTES } from '@/constants/routes'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Wire to error reporting service (e.g. Sentry) in Sprint 7
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <ErrorPage
          code={500}
          title="เกิดข้อผิดพลาด"
          message={this.state.error?.message ?? 'ส่วนนี้ของหน้าเว็บเกิดข้อผิดพลาด กรุณาลองอีกครั้ง'}
          actions={[
            { label: 'ลองอีกครั้ง', onClick: this.handleReset, variant: 'default' },
            { label: 'กลับหน้าหลัก', href: ROUTES.HOME, variant: 'outline' },
          ]}
        />
      )
    }

    return this.props.children
  }
}
