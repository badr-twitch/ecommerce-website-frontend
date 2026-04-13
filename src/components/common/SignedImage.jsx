import { useEffect, useState } from 'react';
import storageService from '../../services/storageService';

/**
 * Renders an <img> for a private S3 key (e.g. refund-proofs).
 * Fetches a short-lived signed GET URL from the backend on mount.
 * If `src` already looks like a URL or blob, it is used as-is (local preview).
 */
export default function SignedImage({ src, alt = '', className, ...rest }) {
  const [resolved, setResolved] = useState(() => (looksLikeUrl(src) ? src : null));
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!src) {
      setResolved(null);
      return;
    }
    if (looksLikeUrl(src)) {
      setResolved(src);
      return;
    }
    setResolved(null);
    setError(false);
    storageService.fetchSignedUrl(src)
      .then((url) => { if (!cancelled) setResolved(url); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [src]);

  if (error) {
    return (
      <div className={className} role="img" aria-label={alt}
           style={{ background: '#fee2e2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#b91c1c' }}>
        ⚠
      </div>
    );
  }
  if (!resolved) {
    return <div className={className} aria-busy="true" style={{ background: '#f3f4f6' }} />;
  }
  return <img src={resolved} alt={alt} className={className} {...rest} />;
}

function looksLikeUrl(value) {
  return typeof value === 'string' && /^(https?:|blob:|data:)/i.test(value);
}
