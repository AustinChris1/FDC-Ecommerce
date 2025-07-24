import React from 'react';
import { Link } from 'react-router-dom';

const Forbidden = () => {
    document.title = `403 - Access Denied`; // Set document title for better SEO and user experience

    return (
        <div className="min-h-screen flex flex-col justify-center items-center
                        bg-gradient-to-r from-red-50 to-red-100   /* Light mode: soft red gradient */
                        dark:from-gray-900 dark:to-gray-950"> {/* Dark mode: deep gray gradient */}
            {/* Lock Icon */}
            <div className="mb-8
                            text-red-600 /* Light mode icon color: vibrant red */
                            dark:text-red-400"> {/* Dark mode icon color: slightly lighter red for contrast */}
                <svg className="w-24 h-24 md:w-32 md:h-32" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0-6a2 2 0 110-4 2 2 0 010 4m9 8a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>

            {/* Error Message */}
            <h1 className="text-4xl md:text-6xl font-bold mb-4
                           text-red-900 /* Light mode heading color: dark red */
                           dark:text-white"> {/* Dark mode heading color: pure white */}
                403 - Access Denied
            </h1>
            <p className="text-lg md:text-xl mb-8 text-center
                          text-red-600 /* Light mode paragraph color: vibrant red */
                          dark:text-red-300"> {/* Dark mode paragraph color: softer red for contrast */}
                You do not have permission to view this page.
            </p>

            {/* Button */}
            <Link to="/" className="px-8 py-3 rounded-lg shadow transition-all
                                   bg-red-600 text-white hover:bg-red-700 /* Light mode button: vibrant red with darker hover */
                                   dark:bg-red-800 dark:hover:bg-red-700"> {/* Dark mode button: deeper red with lighter hover */}
                Return to Home
            </Link>

        </div>
    );
};

export default Forbidden;
