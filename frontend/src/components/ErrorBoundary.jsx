import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("React Error Boundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen w-screen flex flex-col items-center justify-center bg-red-50 p-10 text-center">
                    <h1 className="text-4xl font-bold text-red-600 mb-4">Oops! Something went wrong.</h1>
                    <p className="text-gray-700 mb-6">The application crashed. Please try refreshing the page.</p>
                    <div className="max-w-2xl w-full p-4 bg-white border border-red-200 rounded-lg text-left overflow-auto max-h-60 font-mono text-sm">
                        <p className="text-red-500 font-bold mb-2">{this.state.error?.toString()}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition"
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
