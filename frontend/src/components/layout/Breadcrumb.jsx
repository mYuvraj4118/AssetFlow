import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import './Breadcrumb.css';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const formatName = (str) => {
    return str
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <nav className="breadcrumb text-sm-sz" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <Link to={ROUTES.DASHBOARD} className="breadcrumb-link text-muted">
            <Home size={14} className="breadcrumb-home-icon" />
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          // Don't repeat Dashboard if we are on Dashboard route
          if (name.toLowerCase() === 'dashboard' && index === 0) {
            return null;
          }

          return (
            <React.Fragment key={routeTo}>
              <li className="breadcrumb-separator text-muted">
                <ChevronRight size={14} />
              </li>
              <li className="breadcrumb-item">
                {isLast ? (
                  <span className="breadcrumb-current text-main font-semibold">
                    {formatName(name)}
                  </span>
                ) : (
                  <Link to={routeTo} className="breadcrumb-link text-muted">
                    {formatName(name)}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
