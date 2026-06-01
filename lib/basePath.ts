export const basePath = '/PLC_fishbowl';

/**
 * Prepends the basePath to a given asset or page path if it isn't already present.
 */
export function prefixPath(path: string): string {
  if (path.startsWith(basePath)) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${cleanPath}`;
}
