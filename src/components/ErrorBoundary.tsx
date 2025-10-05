// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });

    // 프로덕션에서는 에러 로깅 서비스로 전송
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          background: 'var(--surface)',
          color: 'var(--text-primary)'
        }}>
          <div style={{
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <span className="material-icons" style={{
              fontSize: '64px',
              color: 'var(--error)',
              marginBottom: '20px'
            }}>
              error_outline
            </span>

            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '12px',
              color: 'var(--text-primary)'
            }}>
              문제가 발생했습니다
            </h1>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: 'var(--text-secondary)',
              marginBottom: '24px'
            }}>
              일시적인 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginTop: '20px',
                padding: '12px',
                background: 'var(--surface-variant)',
                borderRadius: '8px',
                textAlign: 'left',
                fontSize: '12px',
                color: 'var(--error)'
              }}>
                <summary style={{ cursor: 'pointer', marginBottom: '8px', fontWeight: '600' }}>
                  개발자 정보
                </summary>
                <pre style={{
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  margin: '8px 0'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '20px auto 0'
              }}
            >
              <span className="material-icons" style={{ fontSize: '20px' }}>refresh</span>
              페이지 새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
