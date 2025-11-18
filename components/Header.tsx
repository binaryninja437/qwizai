
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="text-center">
            <div className="flex justify-center mb-6">
                <div className="bg-white/95 p-6 rounded-2xl shadow-2xl border-4 border-cyan-400">
                    <img
                        src="/newlogo.png"
                        alt="QwizAI Logo"
                        className="h-24 sm:h-32 w-auto"
                        onError={(e) => {
                            console.error('Logo failed to load');
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 mb-2">
                QwizAI
            </h1>
            <p className="mt-2 text-lg text-cyan-100">
                Your visual assistant for MCQs and complex reasoning.
            </p>
        </header>
    );
};
