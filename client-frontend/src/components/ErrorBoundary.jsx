import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log l'erreur pour le débogage
    console.error('Erreur capturée par ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
          <div className="max-w-md mx-auto text-center p-8">
            <div className="mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                Oups ! Une erreur s'est produite
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Nous nous excusons pour ce désagrément. Veuillez réessayer ou retourner à l'accueil.
              </p>
            </div>
            
            <div className="space-y-3">
              <Link 
                to="/" 
                className="btn btn-primary w-full"
                onClick={() => this.setState({ hasError: false })}
              >
                Retour à l'accueil
              </Link>
              
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-outline w-full"
              >
                Recharger la page
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-slate-500">
                  Détails techniques (développement)
                </summary>
                <div className="mt-2 p-3 bg-slate-200 dark:bg-slate-800 rounded text-xs overflow-auto">
                  <pre>{this.state.error.toString()}</pre>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 