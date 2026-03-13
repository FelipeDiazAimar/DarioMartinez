'use client';

import { useEffect, useRef, useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

type LoadingImageProps = ImageProps & {
  wrapperClassName?: string;
  spinnerSizeClassName?: string;
};

export function LoadingImage({
  wrapperClassName,
  className,
  spinnerSizeClassName,
  src,
  alt,
  onLoad,
  onError,
  ...props
}: LoadingImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [proxyAttempted, setProxyAttempted] = useState(false);
  const externalImgRef = useRef<HTMLImageElement | null>(null);
  const wrapperBaseClassName = props.fill ? 'relative h-full w-full' : 'relative';
  const normalizedSrc = typeof src === 'string' ? src.trim() : src;
  const isExternalUrl = typeof normalizedSrc === 'string' && /^(https?:)?\/\//i.test(normalizedSrc);
  const proxySrc =
    isExternalUrl && typeof normalizedSrc === 'string'
      ? `/api/image-proxy?url=${encodeURIComponent(normalizedSrc)}`
      : normalizedSrc;
  const [runtimeSrc, setRuntimeSrc] = useState<typeof normalizedSrc>(normalizedSrc);

  useEffect(() => {
    setIsLoaded(false);
    setProxyAttempted(false);
    setRuntimeSrc(normalizedSrc);
  }, [normalizedSrc]);

  useEffect(() => {
    if (!isExternalUrl) {
      return;
    }

    const imgEl = externalImgRef.current;
    if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [isExternalUrl, runtimeSrc]);

  const hasValidSrc = typeof normalizedSrc === 'string' ? normalizedSrc.length > 0 : Boolean(normalizedSrc);

  if (!hasValidSrc) {
    return (
      <div className={cn(wrapperBaseClassName, 'flex items-center justify-center bg-muted/30', wrapperClassName)}>
        <div className={cn('h-full w-full bg-muted/30', className)} />
      </div>
    );
  }

  return (
    <div className={cn(wrapperBaseClassName, wrapperClassName)}>
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/30">
          <div
            className={cn(
              'h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent',
              spinnerSizeClassName
            )}
          />
        </div>
      )}

      {isExternalUrl ? (
        <img
          ref={externalImgRef}
          src={typeof runtimeSrc === 'string' && runtimeSrc ? runtimeSrc : undefined}
          alt={alt}
          className={cn(className, props.fill ? 'absolute inset-0 h-full w-full' : undefined)}
          width={props.fill ? undefined : props.width}
          height={props.fill ? undefined : props.height}
          sizes={props.sizes}
          loading={props.priority ? 'eager' : props.loading}
          onLoad={(event) => {
            setIsLoaded(true);
            if (typeof runtimeSrc === 'string' && runtimeSrc) {
              console.info('[LoadingImage] loaded', {
                alt,
                src: runtimeSrc,
                viaProxy: runtimeSrc.startsWith('/api/image-proxy?url='),
              });
            }
            onLoad?.(event as unknown as Parameters<NonNullable<typeof onLoad>>[0]);
          }}
          onError={(event) => {
            const currentSrc = typeof runtimeSrc === 'string' ? runtimeSrc : undefined;

            if (!proxyAttempted && typeof proxySrc === 'string') {
              setProxyAttempted(true);
              setRuntimeSrc(proxySrc);
              setIsLoaded(false);
              console.warn('[LoadingImage] external image failed, retrying via proxy', {
                alt,
                originalSrc: normalizedSrc,
                proxySrc,
              });
              return;
            }

            setIsLoaded(true);
            console.error('[LoadingImage] image failed after retry', {
              alt,
              src: currentSrc,
              originalSrc: normalizedSrc,
            });
            onError?.(event as unknown as Parameters<NonNullable<typeof onError>>[0]);
          }}
        />
      ) : (
        <Image
          {...props}
          src={normalizedSrc}
          alt={alt}
          className={className}
          onLoad={(event) => {
            setIsLoaded(true);
            onLoad?.(event);
          }}
          onError={(event) => {
            setIsLoaded(true);
            onError?.(event);
          }}
        />
      )}
    </div>
  );
}
