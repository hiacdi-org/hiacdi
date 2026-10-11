import { cloudinarySrcSet, optimizedImage } from "../../utils/media";

export default function SmartImage({
  src,
  alt = "",
  width,
  height,
  className,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px",
}) {
  if (!src) return null;
  const srcSet = cloudinarySrcSet(src);
  return (
    <img
      src={optimizedImage(src, width || 800) || src}
      srcSet={srcSet || undefined}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
