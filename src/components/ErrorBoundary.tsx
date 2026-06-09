import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("Error caught by boundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Oups, une erreur s'est produite</h1>
            <p className="text-muted-foreground mb-6">
              {this.state.error?.message || "Une erreur inattendue s'est produite."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gold text-background rounded-lg font-semibold hover:bg-gold/90 transition"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
