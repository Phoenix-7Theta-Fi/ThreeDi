import { useState, useCallback } from 'react';
import { validateImageFile, getFilePreview } from '../utils/fileHelpers';

interface UseFileUploadReturn {
  file: File | null;
  preview: string | null;
  error: string | null;
  handleFileSelect: (file: File) => Promise<void>;
  handleDragOver: (event: React.DragEvent) => void;
  handleDrop: (event: React.DragEvent) => Promise<void>;
  reset: () => void;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setError(null);
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const previewUrl = await getFilePreview(file);
      setFile(file);
      setPreview(previewUrl);
      setError(null);
    } catch (err) {
      setError('Failed to generate preview');
      console.error('Preview generation failed:', err);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;

    // Only process the first file
    await handleFileSelect(files[0]);
  }, [handleFileSelect]);

  return {
    file,
    preview,
    error,
    handleFileSelect,
    handleDragOver,
    handleDrop,
    reset,
  };
};
