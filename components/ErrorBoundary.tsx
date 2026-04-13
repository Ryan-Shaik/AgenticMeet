'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Uncaught error in ${this.props.name || 'Component'}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <h2 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Component Failed</h2>
          <p className="text-[10px] text-red-400/60 leading-tight">Something went wrong with this feature. The rest of the meeting is unaffected.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
