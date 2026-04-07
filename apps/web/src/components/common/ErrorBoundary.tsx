import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown): State {
    const normalised = error instanceof Error ? error : new Error(String(error));
    return { hasError: true, error: normalised };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo.componentStack);
  }

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{ background: 'var(--k-surface)' }}
      >
        <p
          className="text-[28px] font-bold mb-2"
          style={{ color: 'var(--k-on-surface)' }}
        >
          Something went wrong
        </p>
        <p
          className="text-[15px] mb-8 max-w-[280px] leading-relaxed"
          style={{ color: 'var(--k-secondary)' }}
        >
          {this.state.error?.message || 'An unexpected error occurred. Your progress is safe.'}
        </p>
        <button
          onClick={() => window.location.replace('/')}
          className="rounded-xl px-8 py-3 text-[17px] font-semibold"
          style={{ background: 'var(--k-primary)', color: '#FFFFFF' }}
        >
          Go Home
        </button>
      </div>
    );
  }
}
