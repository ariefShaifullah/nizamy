import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    featureName: string;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error boundary for individual features.
 * Catches errors in a specific feature without crashing the entire app.
 */
export class FeatureErrorBoundary extends Component<Props, State> {
    setState(arg0: { hasError: boolean; error: null; }) {
        throw new Error('Method not implemented.');
    }
    public state: State = {
        hasError: false,
        error: null
    };
    props: any;

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`[${this.props.featureName}] Uncaught error:`, error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-3xl mb-4">
                        ⚠️
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                        Terjadi Kesalahan
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-sm">
                        Fitur <strong>{this.props.featureName}</strong> mengalami masalah.
                        Silakan coba lagi atau muat ulang halaman.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={this.handleRetry}
                            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                        >
                            Coba Lagi
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Muat Ulang
                        </button>
                    </div>
                    {import.meta.env.DEV && this.state.error && (
                        <pre className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-xs text-red-600 dark:text-red-400 text-left overflow-auto max-w-full max-h-32">
                            {this.state.error.message}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
