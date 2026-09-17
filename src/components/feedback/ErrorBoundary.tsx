import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertOctagon, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled Application Error:', error, errorInfo)
    // Here we can forward to Sentry or backend error telemetry API
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4 shadow-inner">
            <AlertOctagon className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Operational System Interruption</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
            The hospitality console encountered an unexpected interface fault. Your session context remains safe.
          </p>

          {this.state.error && (
            <div className="mt-4 max-w-lg rounded-lg border border-border bg-muted/40 p-3 text-left font-mono text-xs text-muted-foreground overflow-auto max-h-32">
              {this.state.error.message}
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={this.handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reload Application
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                window.location.href = '/app/frontdesk'
              }}
            >
              Return to Front Desk
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
