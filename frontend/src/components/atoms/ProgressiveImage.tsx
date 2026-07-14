import { useState } from 'react';
import { Image, ImageProps, Skeleton } from '@mantine/core';

// 1. Extend Mantine's native ImageProps interface
interface ProgressiveImageProps extends ImageProps {
  src: string;
  alt: string;
}

// 2. Destructure 'style' explicitly from your props
export function ProgressiveImage({ src, alt, style, ...props }: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
      {!loaded && (
        <Skeleton
          height="100%"
          width="100%"
          style={{ position: 'absolute', inset: 0, zIndex: 1 }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 300ms ease',
          // 3. Spread the destructured style safely
          ...style, 
        }}
        {...props} // style is no longer in here, preventing double-application
      />
    </div>
  );
}