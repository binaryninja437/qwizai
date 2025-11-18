import React, { useRef, useEffect, useCallback, useState } from 'react';
import { SwitchCameraIcon } from './icons/Icons';

interface CameraViewProps {
    onCapture: (imageData: string, mimeType: string) => void;
    onClose: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    const [activeDeviceId, setActiveDeviceId] = useState<string | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    const [zoom, setZoom] = useState(1);
    const [zoomCapabilities, setZoomCapabilities] = useState<{ min: number; max: number; step: number; supported: boolean } | null>(null);
    const [focusIndicator, setFocusIndicator] = useState<{ x: number; y: number; visible: boolean } | null>(null);

    const cleanupCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    useEffect(() => {
        const openCamera = async () => {
            cleanupCamera();
            setError(null);
            try {
                const constraints: MediaStreamConstraints = {
                    video: {
                        deviceId: activeDeviceId ? { exact: activeDeviceId } : undefined,
                    },
                };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    streamRef.current = stream;
                }

                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoInputs = devices.filter(d => d.kind === 'videoinput');
                setVideoDevices(videoInputs);

                // Check for zoom capabilities
                const track = stream.getVideoTracks()[0];
                const capabilities = track.getCapabilities();
                if ('zoom' in capabilities) {
                    // FIX: The `zoom` property on MediaTrackCapabilities is not standard and may be typed as `unknown`. Cast to `any` to access sub-properties.
                    const zoomCapability = (capabilities as any).zoom;
                    setZoomCapabilities({
                        min: zoomCapability.min,
                        max: zoomCapability.max,
                        step: zoomCapability.step,
                        supported: true
                    });
                    // FIX: The `zoom` property on MediaTrackSettings is not standard. Cast to `any` to access it.
                    setZoom((track.getSettings() as any).zoom || 1);
                } else {
                    setZoomCapabilities({ supported: false, min: 1, max: 1, step: 1 });
                }


            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("Could not access camera. Please ensure you have granted permission and that your camera is not in use by another application.");
            }
        };

        openCamera();

        return () => {
            cleanupCamera();
        };
    }, [activeDeviceId, onClose, cleanupCamera]);

    const handleSwitchCamera = () => {
        if (videoDevices.length > 1) {
            const currentId = streamRef.current?.getVideoTracks()[0]?.getSettings().deviceId;
            const currentIndex = videoDevices.findIndex(device => device.deviceId === currentId);
            const nextIndex = (currentIndex + 1) % videoDevices.length;
            setActiveDeviceId(videoDevices[nextIndex]?.deviceId);
        }
    };

    const handleCapture = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const imageData = canvas.toDataURL('image/jpeg');
                onCapture(imageData, 'image/jpeg');
            }
            cleanupCamera();
        }
    };

    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newZoom = parseFloat(e.target.value);
        setZoom(newZoom);
        const track = streamRef.current?.getVideoTracks()[0];
        if (track && 'zoom' in track.getCapabilities()) {
            // FIX: The `zoom` property is not standard in MediaTrackConstraintSet. Cast the constraint to `any`.
            track.applyConstraints({ advanced: [{ zoom: newZoom } as any] });
        }
    };

    const handleFocusClick = (e: React.MouseEvent<HTMLVideoElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setFocusIndicator({ x, y, visible: true });
        setTimeout(() => setFocusIndicator(prev => prev && { ...prev, visible: false }), 1000);
    };

    const handleClose = () => {
        cleanupCamera();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg shadow-2xl p-4 sm:p-6 w-full max-w-3xl text-center flex flex-col">
                {error ? (
                    <div className="flex flex-col items-center justify-center h-full p-8">
                        <p className="text-red-400 text-lg mb-6">{error}</p>
                        <button
                            onClick={handleClose}
                            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="relative w-full rounded-md mb-4 overflow-hidden">
                             <video ref={videoRef} autoPlay playsInline onClick={handleFocusClick} className="w-full aspect-video object-cover bg-black"></video>
                            {focusIndicator?.visible && (
                                <div
                                    className="absolute border-2 border-yellow-400 rounded-full w-16 h-16 transition-opacity duration-500 animate-ping-once"
                                    style={{
                                        left: `${focusIndicator.x - 32}px`,
                                        top: `${focusIndicator.y - 32}px`,
                                        opacity: focusIndicator.visible ? 1 : 0,
                                    }}
                                ></div>
                            )}
                        </div>

                        {zoomCapabilities?.supported && (
                            <div className="flex items-center gap-3 px-2 mb-4">
                                <span className="text-sm text-gray-400">ZOOM</span>
                                <input
                                    type="range"
                                    min={zoomCapabilities.min}
                                    max={zoomCapabilities.max}
                                    step={zoomCapabilities.step}
                                    value={zoom}
                                    onChange={handleZoomChange}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-around w-full">
                            <button
                                onClick={handleClose}
                                className="px-5 py-3 text-sm bg-transparent text-gray-300 font-semibold rounded-lg hover:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-75 transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleCapture}
                                className="w-20 h-20 rounded-full bg-white flex items-center justify-center ring-4 ring-gray-600 hover:ring-white transition-all duration-200 focus:outline-none"
                                aria-label="Capture Photo"
                            >
                                <div className="w-16 h-16 rounded-full bg-white border-4 border-gray-900"></div>
                            </button>

                            {videoDevices.length > 1 ? (
                                <button
                                    onClick={handleSwitchCamera}
                                    title="Switch Camera"
                                    className="p-4 bg-gray-700 text-white font-semibold rounded-full shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-colors"
                                    aria-label="Switch Camera"
                                >
                                    <SwitchCameraIcon/>
                                </button>
                            ) : (
                                <div className="w-14 h-14"></div> // Placeholder for alignment
                            )}
                        </div>
                    </>
                )}
            </div>
             <style>{`
                @keyframes ping-once {
                  75%, 100% {
                    transform: scale(1.5);
                    opacity: 0;
                  }
                }
                .animate-ping-once {
                  animation: ping-once 1s cubic-bezier(0, 0, 0.2, 1);
                }
            `}</style>
        </div>
    );
};
