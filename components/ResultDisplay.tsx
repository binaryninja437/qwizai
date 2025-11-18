
import React from 'react';

interface ResultDisplayProps {
    isLoading: boolean;
    result: string | null;
    error: string | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, result, error }) => {
    if (isLoading) {
        return (
            <div className="mt-8 flex flex-col items-center justify-center text-center p-8 bg-gray-800/50 rounded-2xl">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-500 h-12 w-12 mb-4 animate-spin" style={{ borderTopColor: '#3B82F6' }}></div>
                <p className="text-lg text-gray-300">The AI agent is analyzing the image...</p>
                <p className="text-sm text-gray-500">This may take a moment.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-8 p-6 bg-red-900/50 border border-red-700 text-red-200 rounded-lg">
                <h3 className="font-bold mb-2">An Error Occurred</h3>
                <p>{error}</p>
            </div>
        );
    }

    if (result) {
        return (
            <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-inner">
                <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">AI Analysis</h2>
                <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
                    {result}
                </div>
            </div>
        );
    }

    return null;
};
