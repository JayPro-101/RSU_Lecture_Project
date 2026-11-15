
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__main">
        {breadcrumb && (
          <div className="page-header__breadcrumb">
            {breadcrumb}
          </div>
        )}

        <h1>{title}</h1>

        {description && (
          <p className="page-header__description">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="page-header__actions">
          {actions}
        </div>
      )}
    </header>
  );
}
