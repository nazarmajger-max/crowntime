import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/** Normalize the visible subject, not just the source image dimensions. */
export const WatchImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    let cancelled = false;
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      try {
        const sample = document.createElement('canvas');
        sample.width = 240;
        sample.height = Math.max(1, Math.round(240 * image.height / image.width));
        const context = sample.getContext('2d', { willReadFrequently: true });
        const output = canvas.getContext('2d');
        if (!context || !output) return;
        context.drawImage(image, 0, 0, sample.width, sample.height);
        const { data } = context.getImageData(0, 0, sample.width, sample.height);
        let left = sample.width, top = sample.height, right = 0, bottom = 0;
        // Only trim plain light backgrounds; preserve lifestyle photos intact.
        const lightBackground = [0, sample.width - 1, (sample.height - 1) * sample.width, sample.width * sample.height - 1]
          .every(i => data[i * 4 + 3] < 20 || Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]) > 210);
        if (lightBackground) {
          for (let y = 0; y < sample.height; y++) {
            for (let x = 0; x < sample.width; x++) {
              const i = (y * sample.width + x) * 4;
              if (data[i + 3] > 40 && Math.min(data[i], data[i + 1], data[i + 2]) < 205) {
                left = Math.min(left, x); right = Math.max(right, x);
                top = Math.min(top, y); bottom = Math.max(bottom, y);
              }
            }
          }
        }
        if (right <= left || bottom <= top) {
          left = 0; top = 0; right = sample.width - 1; bottom = sample.height - 1;
        }
        const ratio = image.width / sample.width;
        const sx = Math.max(0, left - 2) * ratio;
        const sy = Math.max(0, top - 2) * ratio;
        const sw = Math.min(image.width - sx, (right - left + 5) * ratio);
        const sh = Math.min(image.height - sy, (bottom - top + 5) * ratio);
        canvas.width = 600; canvas.height = 750;
        const scale = Math.min(432 / sw, 585 / sh);
        const width = sw * scale, height = sh * scale;
        output.clearRect(0, 0, 600, 750);
        output.drawImage(image, sx, sy, sw, sh, (600 - width) / 2, (750 - height) / 2, width, height);
        setReady(true);
      } catch {
        // Cross-origin restrictions must never hide a product photograph.
        setReady(false);
      }
    };
    image.src = src;
    return () => { cancelled = true; };
  }, [src]);

  return (
    <div className={cn('relative h-full w-full', className)}>
      <canvas ref={canvasRef} role="img" aria-label={alt || undefined} aria-hidden={!alt || !ready} className={cn('absolute inset-0 h-full w-full object-contain', !ready && 'invisible')} />
      <img src={src} alt={alt} loading="lazy" className={cn('absolute inset-0 h-full w-full object-contain p-6 md:p-8', ready && 'invisible')} aria-hidden={ready} />
    </div>
  );
};