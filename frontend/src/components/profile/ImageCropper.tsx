'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cropToSquare, getImageDimensions, isSquare } from '../../utils/imageOptimization';

// =====================================================
// IMAGE CROPPER COMPONENT
// =====================================================
// Interactive image cropping with square aspect ratio

interface ImageCropperProps {
  imageFile: File;
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
  cropSize?: number;
  quality?: number;
  className?: string;
}

interface CropArea {
  x: number;
  y: number;
  size: number;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageFile,
  onCrop,
  onCancel,
  cropSize = 400,
  quality = 0.8,
  className = ''
}) => {
  // =====================================================
  // STATE
  // =====================================================

  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, size: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =====================================================
  // REFS
  // =====================================================

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // =====================================================
  // INITIALIZATION
  // =====================================================

  useEffect(() => {
    const initializeImage = async () => {
      try {
        // Create object URL for the image
        const url = URL.createObjectURL(imageFile);
        setImageUrl(url);

        // Get image dimensions
        const dimensions = await getImageDimensions(imageFile);
        setImageDimensions(dimensions);

        // Initialize crop area
        if (isSquare(dimensions.width, dimensions.height)) {
          // Image is already square, no cropping needed
          setCropArea({ x: 0, y: 0, size: Math.min(dimensions.width, dimensions.height) });
        } else {
          // Calculate initial crop area (center crop)
          const size = Math.min(dimensions.width, dimensions.height);
          const x = (dimensions.width - size) / 2;
          const y = (dimensions.height - size) / 2;
          setCropArea({ x, y, size });
        }
      } catch (error) {
        setError('Failed to load image');
      }
    };

    initializeImage();

    // Cleanup
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageFile]);

  // =====================================================
  // MOUSE HANDLERS
  // =====================================================

  const getMousePosition = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    if (!containerRef.current) return { x: 0, y: 0 };

    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const getImagePosition = useCallback((mousePos: { x: number; y: number }): { x: number; y: number } => {
    if (!imageRef.current) return { x: 0, y: 0 };

    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = imageDimensions.width / rect.width;
    const scaleY = imageDimensions.height / rect.height;

    return {
      x: (mousePos.x - rect.left) * scaleX,
      y: (mousePos.y - rect.top) * scaleY
    };
  }, [imageDimensions]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart(getMousePosition(e));
  }, [getMousePosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const currentPos = getMousePosition(e);
    const deltaX = currentPos.x - dragStart.x;
    const deltaY = currentPos.y - dragStart.y;

    const imagePos = getImagePosition(currentPos);
    const startImagePos = getImagePosition(dragStart);

    setCropArea(prev => {
      const newX = Math.max(0, Math.min(imageDimensions.width - prev.size, prev.x + deltaX));
      const newY = Math.max(0, Math.min(imageDimensions.height - prev.size, prev.y + deltaY));

      return {
        ...prev,
        x: newX,
        y: newY
      };
    });

    setDragStart(currentPos);
  }, [isDragging, dragStart, getMousePosition, getImagePosition, imageDimensions]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // =====================================================
  // CROP HANDLERS
  // =====================================================

  const handleCrop = async () => {
    if (isSquare(imageDimensions.width, imageDimensions.height)) {
      // Image is already square, just pass it through
      onCrop(imageFile);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const croppedFile = await cropToSquare(imageFile, cropSize, quality);
      onCrop(croppedFile);
    } catch (error) {
      setError('Failed to crop image');
    } finally {
      setIsProcessing(false);
    }
  };

  // =====================================================
  // RENDER HELPERS
  // =====================================================

  const renderImageContainer = () => {
    const containerStyle = {
      width: '100%',
      maxWidth: '500px',
      height: '400px',
      position: 'relative' as const,
      overflow: 'hidden',
      backgroundColor: 'var(--airvik-white)',
      border: '2px solid var(--airvik-blue)',
      borderRadius: 'var(--radius-lg)'
    };

    const imageStyle = {
      width: '100%',
      height: '100%',
      objectFit: 'contain' as const,
      cursor: isDragging ? 'grabbing' : 'grab'
    };

    const cropOverlayStyle = {
      position: 'absolute' as const,
      left: `${(cropArea.x / imageDimensions.width) * 100}%`,
      top: `${(cropArea.y / imageDimensions.height) * 100}%`,
      width: `${(cropArea.size / imageDimensions.width) * 100}%`,
      height: `${(cropArea.size / imageDimensions.height) * 100}%`,
      border: '2px solid var(--airvik-purple)',
      backgroundColor: 'rgba(147, 51, 234, 0.1)',
      cursor: isDragging ? 'grabbing' : 'grab',
      pointerEvents: 'none' as const
    };

    const cropAreaStyle = {
      position: 'absolute' as const,
      left: `${(cropArea.x / imageDimensions.width) * 100}%`,
      top: `${(cropArea.y / imageDimensions.height) * 100}%`,
      width: `${(cropArea.size / imageDimensions.width) * 100}%`,
      height: `${(cropArea.size / imageDimensions.height) * 100}%`,
      cursor: isDragging ? 'grabbing' : 'grab'
    };

    return (
      <div
        ref={containerRef}
        style={containerStyle}
        className="dark:bg-airvik-midnight dark:border-airvik-cyan"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Crop preview"
          style={imageStyle}
          draggable={false}
        />
        
        {/* Crop overlay */}
        <div style={cropOverlayStyle} />
        
        {/* Interactive crop area */}
        <div style={cropAreaStyle} />
        
        {/* Instructions overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black bg-opacity-50 text-white px-space-4 py-space-2 rounded-radius-md text-caption">
            Drag to adjust crop area
          </div>
        </div>
      </div>
    );
  };

  const renderControls = () => {
    return (
      <div className="mt-space-6 flex items-center justify-center space-x-space-4">
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="px-space-4 py-space-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-radius-md font-sf-pro text-button
            transition-all duration-normal hover:bg-gray-300 dark:hover:bg-gray-600 hover:shadow-lg hover:-translate-y-1 
            active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
        >
          Cancel
        </button>
        
        <button
          onClick={handleCrop}
          disabled={isProcessing}
          className="px-space-4 py-space-2 bg-airvik-blue text-airvik-white rounded-radius-md font-sf-pro text-button
            transition-all duration-normal hover:bg-airvik-blue-dark hover:shadow-lg hover:-translate-y-1 
            active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
            dark:bg-airvik-cyan dark:text-airvik-midnight dark:hover:bg-airvik-cyan-dark"
        >
          {isProcessing ? (
            <div className="flex items-center space-x-space-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Processing...</span>
            </div>
          ) : (
            'Crop Image'
          )}
        </button>
      </div>
    );
  };

  const renderInfo = () => {
    return (
      <div className="mt-space-4 text-center">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-radius-lg p-space-4">
          <h4 className="text-h6 text-airvik-black dark:text-airvik-white font-medium mb-space-2">
            Crop Settings
          </h4>
          <div className="grid grid-cols-2 gap-space-4 text-caption text-gray-600 dark:text-gray-400">
            <div>
              <p><strong>Original:</strong> {imageDimensions.width} × {imageDimensions.height}</p>
              <p><strong>Crop Size:</strong> {cropSize} × {cropSize}</p>
            </div>
            <div>
              <p><strong>Quality:</strong> {Math.round(quality * 100)}%</p>
              <p><strong>Format:</strong> {imageFile.type.split('/')[1].toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =====================================================
  // MAIN RENDER
  // =====================================================

  if (error) {
    return (
      <div className={`text-center p-space-8 ${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-radius-lg p-space-6">
          <svg className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-space-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h3 className="text-h5 text-red-800 dark:text-red-200 mb-space-2">
            Error Loading Image
          </h3>
          <p className="text-body text-red-700 dark:text-red-300 mb-space-4">
            {error}
          </p>
          <button
            onClick={onCancel}
            className="px-space-4 py-space-2 bg-red-600 text-airvik-white rounded-radius-md font-sf-pro text-button
              transition-all duration-normal hover:bg-red-700 hover:shadow-lg hover:-translate-y-1 
              active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="text-center mb-space-6">
        <h3 className="text-h4 text-airvik-black dark:text-airvik-white font-bold mb-space-2">
          Crop Profile Picture
        </h3>
        <p className="text-body text-gray-600 dark:text-gray-400">
          Adjust the crop area to get the perfect square profile picture
        </p>
      </div>

      {renderImageContainer()}
      {renderInfo()}
      {renderControls()}
    </div>
  );
};
