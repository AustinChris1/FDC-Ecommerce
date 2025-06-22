import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100); // Adjust the delay if necessary
    };

    handleScroll();
  }, [pathname]);

  return null;
};

export default ScrollToTop;
