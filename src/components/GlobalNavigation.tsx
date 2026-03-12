import { useEffect, useState } from 'react';
import './GlobalNavigation.css';

export const GlobalNavigation = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 320);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <button
        type="button"
        className={`global-nav-btn global-nav-top ${showScrollTop ? 'visible' : ''}`}
        aria-label="Наверх"
        onClick={handleScrollTop}
      >
        ↑
      </button>
    </>
  );
};
