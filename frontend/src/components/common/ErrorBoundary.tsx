import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

/**
 * ErrorBoundary — Global React Crash Protection
 *
 * Catches any unhandled JS error from child components and
 * renders a user-friendly Nepali error screen instead of
 * a blank white page.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'Unknown error' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Module Crash:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '1.5rem',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(245,158,11,0.12))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(239,68,68,0.2)',
            }}
          >
            <AlertTriangle size={44} style={{ color: '#f59e0b' }} />
          </div>

          <div>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: '0.5rem',
              }}
            >
              मोड्युल लोड हुन सकेन
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '480px', lineHeight: 1.6 }}>
              {this.props.fallbackMessage ||
                'यो मोड्युलमा प्राविधिक समस्या आएको छ। कृपया पुनः प्रयास गर्नुहोस् वा मुख पृष्ठमा फर्कनुहोस्।'}
            </p>
            {this.state.errorMessage && (
              <code
                style={{
                  display: 'block',
                  marginTop: '0.75rem',
                  fontSize: '0.75rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  color: '#dc2626',
                  maxWidth: '500px',
                  wordBreak: 'break-all',
                }}
              >
                {this.state.errorMessage}
              </code>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={this.handleRetry}
              className="dt-btn dt-btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={16} />
              पुनः प्रयास गर्नुहोस्
            </button>
            <button
              onClick={this.handleGoHome}
              className="dt-btn dt-btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Home size={16} />
              मुख पृष्ठमा फर्कनुहोस्
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
