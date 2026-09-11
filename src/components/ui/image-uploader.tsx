'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
  uploadFileToR2,
} from '@/lib/upload';

export interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  disabled?: boolean;
  onUploadingChange?: (isUploading: boolean) => void;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  disabled = false,
  onUploadingChange,
  className = '',
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('Uploading image to Cloudflare R2...');
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState(value || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes
  useEffect(() => {
    setPreviewUrl(value || null);
    if (!isUploading) {
      setManualInput(value || '');
    }
  }, [value, isUploading]);

  const notifyUploading = (uploading: boolean) => {
    setIsUploading(uploading);
    onUploadingChange?.(uploading);
  };

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    setCompressionInfo(null);

    // Validate type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      setErrorMessage(
        'Unsupported file format. Please upload a JPEG, PNG, WebP, GIF, or AVIF image.'
      );
      return;
    }

    // Validate size (raw input limit 10 MB)
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setErrorMessage(
        `File is too large (${sizeMb} MB). Maximum allowed size is 10 MB.`
      );
      return;
    }

    // Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploadStatus('Optimizing image...');
    notifyUploading(true);
    setUploadProgress(0);

    try {
      const publicUrl = await uploadFileToR2(
        file,
        (percent) => {
          setUploadProgress(percent);
        },
        (status) => {
          setUploadStatus(status);
          if (status.includes('Optimized') || status.includes('smaller')) {
            setCompressionInfo(status);
          }
        }
      );

      // Update parent with the permanent Cloudflare R2 public URL
      onChange(publicUrl);
      setPreviewUrl(publicUrl);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to upload image to Cloudflare R2.');
      setPreviewUrl(value || null);
    } finally {
      notifyUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    onChange('');
    setPreviewUrl(null);
    setManualInput('');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleManualUrlChange = (url: string) => {
    setManualInput(url);
    setErrorMessage(null);
    const trimmed = url.trim();
    if (!trimmed) {
      onChange('');
      setPreviewUrl(null);
      return;
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        onChange(trimmed);
        setPreviewUrl(trimmed);
      } else {
        setErrorMessage('URL must begin with http:// or https://');
      }
    } catch {
      // Allow typing without immediate validation error
      onChange(trimmed);
      setPreviewUrl(trimmed);
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={onFileInputChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {/* Uploading Progress Overlay / Bar */}
      {isUploading && (
        <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-foreground">
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>{uploadStatus}</span>
            </div>
            <span className="text-primary font-bold">{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-primary/10 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Mode 1: Manual Image URL Input */}
      {manualMode ? (
        <div className="space-y-3 p-4 rounded-2xl border border-border/80 bg-muted/20">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <LinkIcon className="size-3.5 text-muted-foreground" />
                Image URL
              </label>
              <button
                type="button"
                onClick={() => setManualMode(false)}
                className="text-xs text-primary hover:underline font-medium"
              >
                Switch to File Upload
              </button>
            </div>
            <Input
              type="url"
              placeholder="https://example.com/meal.jpg"
              value={manualInput}
              onChange={(e) => handleManualUrlChange(e.target.value)}
              disabled={disabled || isUploading}
              className="rounded-xl border-border/80 focus-visible:ring-primary text-sm"
            />
          </div>

          {previewUrl && (
            <div className="flex items-center gap-3 pt-1">
              <div className="relative size-14 rounded-xl overflow-hidden bg-muted border border-border/60 shrink-0">
                <img
                  src={previewUrl}
                  alt="Meal Preview"
                  className="size-full object-cover"
                  onError={() => {
                    setErrorMessage('Failed to load image from the provided URL.');
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{previewUrl}</p>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-xs text-destructive hover:underline mt-0.5"
                >
                  Clear URL
                </button>
              </div>
            </div>
          )}
        </div>
      ) : previewUrl && !isUploading ? (
        /* Mode 2: Has Preview / Existing Image */
        <div className="p-3.5 rounded-2xl border border-border/80 bg-muted/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative size-16 rounded-xl overflow-hidden bg-muted border border-border shrink-0 shadow-xs">
              <img
                src={previewUrl}
                alt="Meal Preview"
                className="size-full object-cover"
                onError={() => {
                  setErrorMessage('Failed to load preview image.');
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span className="text-xs font-semibold text-foreground">
                  Image Ready
                </span>
                {compressionInfo && (
                  <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                    WebP Optimized
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs mt-0.5">
                {previewUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="h-8 rounded-lg px-2.5 text-xs gap-1.5 border-border/80 hover:border-primary/50"
            >
              <RefreshCw className="size-3.5" />
              <span className="hidden sm:inline">Replace</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              className="h-8 rounded-lg px-2.5 text-xs gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40"
            >
              <Trash2 className="size-3.5" />
              <span className="hidden sm:inline">Remove</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Mode 3: Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && !isUploading) {
              fileInputRef.current?.click();
            }
          }}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : 'border-border/80 hover:border-primary/50 bg-muted/10 hover:bg-muted/30'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <UploadCloud className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Click to upload meal photo or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP, GIF, or AVIF (max 10 MB, auto-optimized)
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setManualMode(true);
              }}
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium"
            >
              <LinkIcon className="size-3" />
              <span>Or enter image URL manually</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
