import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100); 
    };

    handleScroll();
  }, [pathname]);

  return null;
};

export default ScrollToTop;
