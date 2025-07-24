import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    document.title = `404 - Page Not Found`;

    return (
        <div className="min-h-screen flex flex-col justify-center items-center
                        bg-gradient-to-r from-blue-50 to-blue-100  /* Light mode gradient: soft blues */
                        dark:from-gray-800 dark:to-gray-900"> {/* Dark mode gradient: deep grays */}
            {/* Icon */}
            <div className="text-blue-600 mb-8 /* Light mode icon color: vibrant blue */
                            dark:text-blue-400"> {/* Dark mode icon color: lighter blue */}
                <svg className="w-24 h-24 md:w-32 md:h-32" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6 6m0-6l-6-6m2-2a9 9 0 100 18 9 9 0 000-18z" />
                </svg>
            </div>

            {/* Error Message */}
            <h1 className="text-4xl md:text-6xl font-bold mb-4
                           text-blue-900 /* Light mode heading color: dark blue */
                           dark:text-white"> {/* Dark mode heading color: pure white */}
                404 - Page Not Found
            </h1>
            <p className="text-lg md:text-xl mb-8 text-center
                          text-blue-600 /* Light mode paragraph color: vibrant blue */
                          dark:text-blue-300"> {/* Dark mode paragraph color: softer blue */}
                Oops! The page you are looking for does not exist or has been moved.
            </p>

            {/* Button */}
            <button
                onClick={() => window.history.back()}
                className="px-8 py-3 rounded-lg shadow transition-all
                           bg-blue-600 text-white hover:bg-blue-500 /* Light mode button: blue with lighter hover */
                           dark:bg-blue-800 dark:hover:bg-blue-700" /* Dark mode button: darker blue with lighter hover */
            >
                Go Back
            </button>
        </div>
    );
};

export default NotFound;
