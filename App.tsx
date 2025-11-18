
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageInput } from './components/ImageInput';
import { CameraView } from './components/CameraView';
import { ResultDisplay } from './components/ResultDisplay';
import { getAnswerFromImage } from './services/geminiService';
import { ImagePreview } from './components/ImagePreview';

type AppState = {
  image: { data: string; mimeType: string; } | null;
  isLoading: boolean;
  result: string | null;
  error: string | null;
  isCameraOpen: boolean;
};

function App() {
  const [state, setState] = useState<AppState>({
    image: null,
    isLoading: false,
    result: null,
    error: null,
    isCameraOpen: false,
  });

  const handleImageSelect = (imageData: string, mimeType: string) => {
    setState({
      ...state,
      image: { data: imageData, mimeType },
      result: null,
      error: null,
      isCameraOpen: false
    });
  };

  const handleGetAnswer = useCallback(async () => {
    if (!state.image) return;

    setState(prevState => ({ ...prevState, isLoading: true, result: null, error: null }));

    try {
      const base64Data = state.image.data.split(',')[1];
      const answer = await getAnswerFromImage(base64Data, state.image.mimeType);
      setState(prevState => ({ ...prevState, result: answer, isLoading: false }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setState(prevState => ({ ...prevState, error: `Failed to get answer: ${errorMessage}`, isLoading: false }));
    }
  }, [state.image]);

  const handleReset = () => {
    setState({
      image: null,
      isLoading: false,
      result: null,
      error: null,
      isCameraOpen: false,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-3xl mx-auto">
        <Header />
        <main className="mt-8">
          {!state.image && (
            <ImageInput
              onImageSelect={handleImageSelect}
              onOpenCamera={() => setState(prevState => ({ ...prevState, isCameraOpen: true }))}
            />
          )}

          {state.isCameraOpen && (
            <CameraView
              onCapture={handleImageSelect}
              onClose={() => setState(prevState => ({ ...prevState, isCameraOpen: false }))}
            />
          )}

          {state.image && (
            <div className="flex flex-col items-center gap-6">
              <ImagePreview imageSrc={state.image.data} />
              <div className="flex space-x-4">
                <button
                  onClick={handleGetAnswer}
                  disabled={state.isLoading}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {state.isLoading ? 'Thinking...' : 'Get Answer'}
                </button>
                <button
                  onClick={handleReset}
                  disabled={state.isLoading}
                  className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}
          
          <ResultDisplay
            isLoading={state.isLoading}
            result={state.result}
            error={state.error}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
