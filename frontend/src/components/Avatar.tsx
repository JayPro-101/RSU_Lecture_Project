
import { useState } from 'react';

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function Avatar({
  name,
  imageUrl,
  size = 'medium',
  className = '',
}: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || '?';

  const showImage = Boolean(imageUrl) && !imageFailed;

  return (
    <div
      className={`avatar avatar--${size} ${className}`}
      role="img"
      aria-label={`${name || 'User'} profile`}
    >
      {showImage ? (
        <img
          src={imageUrl!}
          alt=""
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}
