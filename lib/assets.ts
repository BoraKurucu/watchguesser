export function getWatchImagePath(imageName: string): string {
  const sanitized = imageName.replace(/[^a-zA-Z0-9._-]/g, "");
  // Use a hardcoded version to bust production cache after large image updates
  const version = "v1";
  // Add cache-busting timestamp for development, version for production
  const cacheParam = process.env.NODE_ENV === 'development' 
    ? `?t=${Date.now()}` 
    : `?v=${version}`;
  return `/images/${sanitized}${cacheParam}`;
}

export function preloadImage(src: string): void {
  if (typeof window === "undefined") return;
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = src;
  document.head.appendChild(link);
}
