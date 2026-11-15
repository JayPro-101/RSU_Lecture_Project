
import { LoaderCircle } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingScreen({
  message = 'Loading...',
  fullScreen = true,
}: LoadingScreenProps) {
  return (
    <div
      className={`loading-screen ${
        fullScreen ? 'loading-screen--fullscreen' : ''
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="loading-screen__content">
        <div className="loading-screen__icon">
          <LoaderCircle size={30} />
        </div>

        <p>{message}</p>
      </div>
    </div>
  );
}
