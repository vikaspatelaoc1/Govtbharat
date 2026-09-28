/**
 * GovtBharat Image Optimizer & Compression Utility
 * High-performance browser-side image downscaling, WebP/PNG transcoding, and byte reduction
 * for Header Logo and Category Column Icons.
 */

export interface ImageOptimizerOptions {
  /** Maximum width/height dimension in pixels (e.g. 256 for Logo, 96 for Category Icons) */
  maxDimension?: number;
  /** Image compression quality between 0.1 and 1.0 (default: 0.85) */
  quality?: number;
  /** Output format: 'auto' selects WebP if supported and retains transparency, falling back to PNG/JPEG */
  format?: 'auto' | 'image/webp' | 'image/png' | 'image/jpeg';
  /** Crop strategy: 'cover' (center cropped square), 'contain' (fit with aspect ratio preserved), or 'none' */
  cropMode?: 'cover' | 'contain' | 'none';
  /** Desired aspect ratio (e.g. 1 for square logos/icons) */
  targetAspectRatio?: number;
  /** Preserve transparent alpha channels (essential for logos and icons) */
  preserveTransparency?: boolean;
}

export interface OptimizationResult {
  dataUrl: string;
  originalSize: number;
  optimizedSize: number;
  savedBytes: number;
  savedPercentage: number;
  width: number;
  height: number;
  mimeType: string;
  formattedOriginalSize: string;
  formattedOptimizedSize: string;
}

/** Pre-configured optimization presets for the portal */
export const OPTIMIZER_PRESETS = {
  logo: {
    maxDimension: 256,
    quality: 0.88,
    cropMode: 'cover' as const,
    targetAspectRatio: 1,
    preserveTransparency: true,
    format: 'auto' as const
  },
  categoryIcon: {
    maxDimension: 96,
    quality: 0.85,
    cropMode: 'contain' as const,
    targetAspectRatio: 1,
    preserveTransparency: true,
    format: 'auto' as const
  }
};

/** Format raw bytes into human readable size string (e.g. "1.2 MB" or "18.4 KB") */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/** Test browser WebP encoding capability */
function checkWebpSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
}

/**
 * Compresses and optimizes a standard File object (e.g., from an <input type="file" />)
 */
export async function optimizeImageFile(
  file: File,
  options: ImageOptimizerOptions = {}
): Promise<OptimizationResult> {
  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Empty image payload'));
        return;
      }
      try {
        const result = await optimizeImageFromDataUrl(dataUrl, options, originalSize);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses, downsamples, and formats an image from a Data URL / Base64 string
 */
export async function optimizeImageFromDataUrl(
  sourceDataUrl: string,
  options: ImageOptimizerOptions = {},
  knownOriginalSize?: number
): Promise<OptimizationResult> {
  const {
    maxDimension = 256,
    quality = 0.85,
    format = 'auto',
    cropMode = 'contain',
    targetAspectRatio = 1,
    preserveTransparency = true
  } = options;

  // Approximate original size from base64 string if not explicitly provided
  const originalSize = knownOriginalSize || Math.round((sourceDataUrl.length * 3) / 4);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onerror = () => reject(new Error('Failed to load image for optimization'));

    img.onload = () => {
      let srcWidth = img.naturalWidth || img.width;
      let srcHeight = img.naturalHeight || img.height;

      if (!srcWidth || !srcHeight) {
        reject(new Error('Invalid image dimensions'));
        return;
      }

      let drawX = 0;
      let drawY = 0;
      let drawWidth = srcWidth;
      let drawHeight = srcHeight;
      let targetWidth = srcWidth;
      let targetHeight = srcHeight;

      if (cropMode === 'cover') {
        // Centered square or target aspect ratio crop
        const targetRatio = targetAspectRatio || 1;
        const currentRatio = srcWidth / srcHeight;

        if (currentRatio > targetRatio) {
          // Source is wider than target ratio
          drawWidth = srcHeight * targetRatio;
          drawHeight = srcHeight;
          drawX = (srcWidth - drawWidth) / 2;
          drawY = 0;
        } else {
          // Source is taller than target ratio
          drawWidth = srcWidth;
          drawHeight = srcWidth / targetRatio;
          drawX = 0;
          drawY = (srcHeight - drawHeight) / 2;
        }

        // Downscale while respecting maxDimension
        if (drawWidth > maxDimension || drawHeight > maxDimension) {
          const scale = maxDimension / Math.max(drawWidth, drawHeight);
          targetWidth = Math.round(drawWidth * scale);
          targetHeight = Math.round(drawHeight * scale);
        } else {
          targetWidth = Math.round(drawWidth);
          targetHeight = Math.round(drawHeight);
        }
      } else if (cropMode === 'contain') {
        // Fit within maxDimension preserving original aspect ratio
        const scale = Math.min(1, maxDimension / Math.max(srcWidth, srcHeight));
        targetWidth = Math.max(1, Math.round(srcWidth * scale));
        targetHeight = Math.max(1, Math.round(srcHeight * scale));
        drawWidth = srcWidth;
        drawHeight = srcHeight;
      } else {
        // Simple downscale
        if (srcWidth > maxDimension || srcHeight > maxDimension) {
          const scale = maxDimension / Math.max(srcWidth, srcHeight);
          targetWidth = Math.round(srcWidth * scale);
          targetHeight = Math.round(srcHeight * scale);
        }
      }

      // Create an off-screen canvas with high quality rendering
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d', { alpha: preserveTransparency });

      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }

      // Configure multi-step smoothing algorithms
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Clear for transparent background
      ctx.clearRect(0, 0, targetWidth, targetHeight);

      if (cropMode === 'cover') {
        ctx.drawImage(
          img,
          drawX, drawY, drawWidth, drawHeight,
          0, 0, targetWidth, targetHeight
        );
      } else {
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      }

      // Choose optimal mime format
      let outputMime = 'image/png';
      const webpSupported = checkWebpSupport();

      if (format === 'image/webp' || (format === 'auto' && webpSupported)) {
        outputMime = 'image/webp';
      } else if (format === 'image/jpeg' && !preserveTransparency) {
        outputMime = 'image/jpeg';
      } else {
        outputMime = 'image/png';
      }

      // Generate optimized Data URL
      let optimizedDataUrl = canvas.toDataURL(outputMime, quality);

      // Fallback safeguard: if WebP output happened to be larger than PNG, pick the smaller one
      if (outputMime === 'image/webp') {
        const pngFallback = canvas.toDataURL('image/png');
        if (pngFallback.length < optimizedDataUrl.length && pngFallback.length < originalSize) {
          optimizedDataUrl = pngFallback;
          outputMime = 'image/png';
        }
      }

      // Compute byte metrics
      const optimizedSize = Math.round((optimizedDataUrl.length * 3) / 4);
      const savedBytes = Math.max(0, originalSize - optimizedSize);
      const savedPercentage = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

      resolve({
        dataUrl: optimizedDataUrl,
        originalSize,
        optimizedSize,
        savedBytes,
        savedPercentage,
        width: targetWidth,
        height: targetHeight,
        mimeType: outputMime,
        formattedOriginalSize: formatBytes(originalSize),
        formattedOptimizedSize: formatBytes(optimizedSize)
      });
    };

    img.src = sourceDataUrl;
  });
}
