'use client';

import { useState } from 'react';
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
  const wrapperBaseClassName = props.fill ? 'relative h-full w-full' : 'relative';

  const hasValidSrc = typeof src === 'string' ? src.trim().length > 0 : Boolean(src);

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
      <Image
        {...props}
        src={src}
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
    </div>
  );
}
