import { getMealImageUploadUrl, PresignedUrlPayload } from "@/app/console/provider/_actions";
import { compressImage, formatBytes } from "./image-compressor";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // Allow raw photo inputs up to 10 MB

export async function uploadFileToR2(
  file: File,
  onProgress?: (percent: number) => void,
  onStatusChange?: (status: string) => void
): Promise<string> {
  // 1. Client-side validation of input file
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageType)) {
    throw new Error(
      `Unsupported file format (${file.type || "unknown"}). Allowed formats: JPEG, PNG, WebP, GIF, AVIF.`
    );
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(
      `File size (${sizeMb} MB) exceeds the maximum allowed limit of 10 MB.`
    );
  }

  // 2. Client-side compression & WebP optimization
  onStatusChange?.("Optimizing image...");
  const optimizedFile = await compressImage(file);

  if (optimizedFile.size < file.size) {
    const origSize = formatBytes(file.size);
    const optSize = formatBytes(optimizedFile.size);
    const reduction = Math.round(((file.size - optimizedFile.size) / file.size) * 100);
    onStatusChange?.(`Optimized ${origSize} ➔ ${optSize} (${reduction}% smaller)`);
  } else {
    onStatusChange?.("Preparing upload...");
  }

  // 3. Request presigned upload URL from backend server action using optimized properties
  const payload: PresignedUrlPayload = {
    fileName: optimizedFile.name,
    contentType: optimizedFile.type as AllowedImageType,
    fileSize: optimizedFile.size,
    folder: "meals",
  };

  const presignedRes = await getMealImageUploadUrl(payload);

  if (!presignedRes.success || !presignedRes.data) {
    throw new Error(
      presignedRes.message || "Failed to obtain upload authorization."
    );
  }

  const { uploadUrl, publicUrl } = presignedRes.data;

  // 4. Direct PUT upload to Cloudflare R2 with progress tracking
  onStatusChange?.("Uploading image to Cloudflare R2...");

  return new Promise<string>((resolve, reject) => {
    if (typeof XMLHttpRequest !== "undefined") {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("Content-Type", optimizedFile.type);
      xhr.setRequestHeader("Cache-Control", "public, max-age=31536000, immutable");

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.(100);
          onStatusChange?.("Upload complete!");
          resolve(publicUrl);
        } else {
          reject(
            new Error(
              `Direct upload to storage failed with status ${xhr.status} ${xhr.statusText || ""}`.trim()
            )
          );
        }
      };

      xhr.onerror = () => {
        reject(
          new Error(
            "Network error during upload to Cloudflare R2. Please check CORS settings and internet connection."
          )
        );
      };

      xhr.ontimeout = () => {
        reject(new Error("Upload request to storage timed out. Please try again."));
      };

      xhr.send(optimizedFile);
    } else {
      // Fallback for non-browser environments
      fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": optimizedFile.type,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
        body: optimizedFile,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Direct upload failed with status ${response.status}`);
          }
          onProgress?.(100);
          onStatusChange?.("Upload complete!");
          resolve(publicUrl);
        })
        .catch(reject);
    }
  });
}
