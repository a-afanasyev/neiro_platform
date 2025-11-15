'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Логирование ошибки в консоль для разработки
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // В продакшене здесь можно отправить ошибку в Sentry или другой сервис мониторинга
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error, errorInfo)
    // }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-4xl">⚠️</div>
                <CardTitle className="text-2xl">Что-то пошло не так</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-neutral-600">
                Произошла непредвиденная ошибка. Мы уже работаем над её исправлением.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-neutral-100 p-4 rounded-lg overflow-auto">
                  <p className="text-sm font-mono text-red-600 whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </p>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-sm font-semibold cursor-pointer">
                        Stack trace
                      </summary>
                      <pre className="text-xs mt-2 overflow-auto">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={this.handleReset} className="flex-1">
                  Попробовать снова
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1"
                >
                  На главную
                </Button>
              </div>

              <p className="text-xs text-neutral-500 text-center">
                Если проблема повторяется, пожалуйста, обратитесь в техническую поддержку
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

