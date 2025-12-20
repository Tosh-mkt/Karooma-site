import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  thumbnailSrc?: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  fallbackSrc?: string;
  aspectRatio?: "square" | "video" | "portrait" | "auto";
}

export function LazyImage({
  src,
  thumbnailSrc,
  alt,
  className,
  placeholderClassName,
  onError,
  fallbackSrc = "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
  aspectRatio = "auto",
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    auto: "",
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    if (onError) {
      onError(e);
    } else if (fallbackSrc) {
      (e.target as HTMLImageElement).src = fallbackSrc;
    }
  };

  const imageSrc = hasError ? fallbackSrc : src;

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative overflow-hidden bg-gray-100 dark:bg-gray-800",
        aspectRatioClasses[aspectRatio],
        placeholderClassName
      )}
    >
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
      )}

      {thumbnailSrc && !isLoaded && isInView && (
        <img
          src={thumbnailSrc}
          alt={alt}
          className={cn(
            "absolute inset-0 w-full h-full object-cover blur-sm scale-105",
            className
          )}
        />
      )}

      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
    </div>
  );
}
