'use client';

import { useEffect, useRef, useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoadingImageProps = ImageProps & {
  wrapperClassName?: string;
  spinnerSizeClassName?: string;
  disableSkeleton?: boolean;
};

export function LoadingImage({
  wrapperClassName,
  className,
  spinnerSizeClassName: _spinnerSizeClassName,
  disableSkeleton = false,
  src,
  alt,
  onLoad,
  onError,
  ...props
}: LoadingImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [proxyAttempted, setProxyAttempted] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const wrapperBaseClassName = props.fill ? 'relative h-full w-full' : 'relative';
  const normalizedSrc = typeof src === 'string' ? src.trim() : src;
  const isExternalUrl = typeof normalizedSrc === 'string' && /^(https?:)?\/\//i.test(normalizedSrc);
  const proxySrc =
    isExternalUrl && typeof normalizedSrc === 'string'
      ? `/api/image-proxy?url=${encodeURIComponent(normalizedSrc)}`
      : normalizedSrc;
  const [runtimeSrc, setRuntimeSrc] = useState<typeof normalizedSrc>(normalizedSrc);

  useEffect(() => {
    setHasFailed(false);
    setProxyAttempted(false);
    setRuntimeSrc(normalizedSrc);
    const imgEl = imgRef.current;
    if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [normalizedSrc]);

  const handleImgRef = (node: HTMLImageElement | null) => {
    imgRef.current = node;
    if (node && node.complete && node.naturalWidth > 0) {
      setIsLoaded(true);
    }
  };

  const hasValidSrc = typeof normalizedSrc === 'string' ? normalizedSrc.length > 0 : Boolean(normalizedSrc);

  if (!hasValidSrc || hasFailed) {
    return (
      <div
        className={cn(
          wrapperBaseClassName,
          'flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-xl bg-surface text-muted-foreground',
          wrapperClassName
        )}
      >
        <Package className="h-8 w-8 opacity-40" />
        <span className="text-xs font-medium opacity-70">Imagen no disponible</span>
      </div>
    );
  }

  return (
    <div className={cn(wrapperBaseClassName, 'overflow-hidden', wrapperClassName)}>
      {!isLoaded && !disableSkeleton && (
        <div
          aria-hidden="true"
          className="rb-skeleton pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
        />
      )}

      {isExternalUrl ? (
        <img
          ref={handleImgRef}
          src={typeof runtimeSrc === 'string' && runtimeSrc ? runtimeSrc : undefined}
          alt={alt}
          className={cn(
            className,
            props.fill ? 'absolute inset-0 h-full w-full' : undefined
          )}
          width={props.fill ? undefined : props.width}
          height={props.fill ? undefined : props.height}
          sizes={props.sizes}
          decoding="async"
          loading={props.priority ? 'eager' : props.loading ?? 'lazy'}
          onLoad={(event) => {
            setIsLoaded(true);
            onLoad?.(event as unknown as Parameters<NonNullable<typeof onLoad>>[0]);
          }}
          onError={(event) => {
            if (!proxyAttempted && typeof proxySrc === 'string') {
              setProxyAttempted(true);
              setRuntimeSrc(proxySrc);
              setIsLoaded(false);
              return;
            }
            setIsLoaded(true);
            setHasFailed(true);
            onError?.(event as unknown as Parameters<NonNullable<typeof onError>>[0]);
          }}
        />
      ) : (
        <Image
          {...props}
          ref={handleImgRef}
          src={normalizedSrc}
          alt={alt}
          className={className}
          onLoad={(event) => {
            setIsLoaded(true);
            onLoad?.(event);
          }}
          onError={(event) => {
            setIsLoaded(true);
            setHasFailed(true);
            onError?.(event);
          }}
        />
      )}
    </div>
  );
}
