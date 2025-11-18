
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="text-center">
            <div className="flex justify-center mb-4">
                <img src="/newlogo.png" alt="AI Reasoning Agent" className="h-16 sm:h-20 w-auto" />
            </div>
            <p className="mt-2 text-lg text-gray-400">
                Your visual assistant for MCQs and complex reasoning.
            </p>
        </header>
    );
};
