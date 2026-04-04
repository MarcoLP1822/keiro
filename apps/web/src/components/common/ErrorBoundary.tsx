import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{ background: 'var(--ios-bg-grouped)' }}
      >
        <p
          className="text-[28px] font-bold mb-2"
          style={{ color: 'var(--ios-label)' }}
        >
          Something went wrong
        </p>
        <p
          className="text-[15px] mb-8 max-w-[280px] leading-relaxed"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          {this.state.message || 'An unexpected error occurred. Your progress is safe.'}
        </p>
        <button
          onClick={() => window.location.replace('/')}
          className="rounded-[14px] px-8 py-3 text-[17px] font-semibold"
          style={{ background: 'var(--ios-blue)', color: '#FFFFFF' }}
        >
          Go back to Home
        </button>
      </div>
    );
  }
}
