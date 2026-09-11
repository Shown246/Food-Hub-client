export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: "image/webp" | "image/jpeg";
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.82,
  outputFormat: "image/webp",
};

/**
 * Format bytes into human-readable strings (e.g. 3.8 MB, 195 KB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Compresses and converts any image File (JPEG, PNG, HEIC, etc.) to an optimized WebP File
 * directly inside the browser using HTML5 Canvas.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // If already a small WebP/SVG file (< 300 KB), skip re-compression
  if (
    (file.type === "image/webp" || file.type === "image/svg+xml") &&
    file.size < 300 * 1024
  ) {
    return file;
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise<File>((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Calculate aspect ratio downscaling
      if (width > opts.maxWidth || height > opts.maxHeight) {
        if (width / height > opts.maxWidth / opts.maxHeight) {
          height = Math.round((height * opts.maxWidth) / width);
          width = opts.maxWidth;
        } else {
          width = Math.round((width * opts.maxHeight) / height);
          height = opts.maxHeight;
        }
      }

      // Safeguard against invalid zero dimensions
      width = Math.max(1, width);
      height = Math.max(1, height);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) {
        return reject(new Error("Unable to obtain 2D canvas context for image compression."));
      }

      // High-quality image rendering settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Generate blob in desired format with fallback to jpeg if webp unsupported
      const handleBlob = (blob: Blob | null, format: string) => {
        if (!blob) {
          if (format === "image/webp") {
            // Fallback to jpeg
            canvas.toBlob(
              (jpegBlob) => handleBlob(jpegBlob, "image/jpeg"),
              "image/jpeg",
              opts.quality
            );
            return;
          }
          return reject(new Error("Failed to compress image into modern web format."));
        }

        // Build clean output filename (.webp or .jpg)
        const originalBaseName = file.name.replace(/\.[^/.]+$/, "");
        const extension = format === "image/webp" ? ".webp" : ".jpg";
        const newFileName = `${originalBaseName}${extension}`;

        const optimizedFile = new File([blob], newFileName, {
          type: format,
          lastModified: Date.now(),
        });

        resolve(optimizedFile);
      };

      canvas.toBlob(
        (blob) => handleBlob(blob, opts.outputFormat),
        opts.outputFormat,
        opts.quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for compression. Please verify the file is a valid image."));
    };

    img.src = objectUrl;
  });
}
