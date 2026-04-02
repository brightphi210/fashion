import React from 'react';

interface LoadingOverlayProps {
    visible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    visible,
}) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-2000">
            <div className="bg-white p-3 rounded-lg shadow-lg flex flex-col items-center">
                <div className="w-4 h-4 border-2 border-[#fa4503] border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );
};

export default LoadingOverlay;