import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const CatalogScrollReset = () => {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    if (pathname === '/products' || pathname.startsWith('/product/')) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, search]);

  return null;
};