
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'small' | 'medium' | 'large';
}

const Card = ({
  children,
  className = '',
  padding = 'medium',
}: CardProps) => {
  return (
    <div className={`app-card app-card-${padding} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
