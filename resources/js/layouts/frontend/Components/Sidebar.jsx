import React, { useState, useEffect, useRef } from "react";
import { Clock, Share2, ArrowUp, Sun, Moon, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [showButtons, setShowButtons] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [history, setHistory] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 65, y: window.innerHeight / 2 - 60 });
  const [dragging, setDragging] = useState(false);
  const location = useLocation();

  const menuRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing page:", error);
      }
    } else {
      console.warn("Share API is not supported on this browser.");
    }
  };

  const toggleButtons = () => {
    setShowButtons((prev) => !prev);
    setShowTooltip(false);
  };

  const handleClickOutside = (event) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target) &&
      !event.target.closest(".tooltip-container")
    ) {
      setShowButtons(false);
      setShowTooltip(false);
    }
  };

  const updateVisitedPages = () => {
    const pageTitle = document.title;
    const pageUrl = window.location.href;

    const visitedPages = JSON.parse(localStorage.getItem("visitedPages")) || [];
    const currentPage = { title: pageTitle, url: pageUrl };
    const domain = window.location.origin;
    const filteredPages = visitedPages.filter((page) =>
      page.url.startsWith(domain)
    );
    if (!filteredPages.some((page) => page.url === pageUrl)) {
      filteredPages.push(currentPage);
      localStorage.setItem("visitedPages", JSON.stringify(filteredPages));
    }
    setHistory(filteredPages.slice(-5));
  };

  useEffect(() => {
    updateVisitedPages();
  }, [location]);

  const handleRecentlyViewedClick = () => {
    setShowTooltip((prev) => !prev);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDragStart = (e) => {
    setDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragRef.current = {
      x: clientX - position.x,
      y: clientY - position.y,
    };
  };

  const handleDrag = (e) => {
    if (!dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const newX = Math.max(0, Math.min(window.innerWidth - 60, clientX - dragRef.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 60, clientY - dragRef.current.y));
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setDragging(false);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchmove", handleDrag);
    document.addEventListener("touchend", handleDragEnd);

    return () => {
      document.removeEventListener("mousemove", handleDrag);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchmove", handleDrag);
      document.removeEventListener("touchend", handleDragEnd);
    };
  }, [dragging]);

  return (
    <div
      className="fixed z-50 cursor-move"
      ref={menuRef}
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      <div className="relative flex items-center justify-center">
        <button
          onClick={toggleButtons}
          className={`bg-gray-200 text-gray-700 rounded-full p-3 shadow-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-transform duration-300 ${
            showButtons ? "rotate-90" : "rotate-0"
          }`}
        >
          <Menu size={20} />
        </button>

        <div
          className={`absolute w-48 h-48 -top-20 -left-20 flex items-center justify-center transition-all duration-500 ${
            showButtons
              ? "scale-100 opacity-100"
              : "scale-0 opacity-0 pointer-events-none"
          }`}
        >
          <button
            onClick={toggleDarkMode}
            className="absolute bg-gray-200 text-gray-700 rounded-full p-3 shadow-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-transform duration-500"
            style={{
              transform: showButtons
                ? "translate(0, -100px)"
                : "translate(0, 0)",
            }}
            title="Toggle Light/Dark Mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={handleScrollToTop}
            className="absolute bg-gray-200 text-gray-700 rounded-full p-3 shadow-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-transform duration-500"
            style={{
              transform: showButtons
                ? "translate(-70px, -70px)"
                : "translate(0, 0)",
            }}
            title="Scroll to Top"
          >
            <ArrowUp size={20} />
          </button>

          <button
            onClick={handleShare}
            className="absolute bg-gray-200 text-gray-700 rounded-full p-3 shadow-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-transform duration-500"
            style={{
              transform: showButtons
                ? "translate(-100px, 0)"
                : "translate(0, 0)",
            }}
            title="Share Page"
          >
            <Share2 size={20} />
          </button>

          <button
            onClick={handleRecentlyViewedClick}
            className="absolute bg-gray-200 text-gray-700 rounded-full p-3 shadow-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-transform duration-500 recently-viewed-btn"
            style={{
              transform: showButtons
                ? "translate(-70px, 70px)"
                : "translate(0, 0)",
            }}
            title="Recently Viewed"
          >
            <Clock size={20} />
          </button>

          {showTooltip && (
            <div className="tooltip-container absolute right-full top-1/2 transform translate-x-2 -translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-300 rounded-md shadow-md p-3 text-sm flex flex-col w-48 z-20">
              <p className="font-bold mb-2">Recently Viewed:</p>
              <ul className="space-y-1">
                {history.length > 0 ? (
                  history.reverse().map((page, index) => (
                    <li key={index}>
                      <Link
                        to={page.url}
                        className="text-blue-500 hover:underline dark:text-blue-400"
                        title={page.title}
                      >
                        {page.title}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 dark:text-gray-600">
                    No recently viewed pages.
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
