import React from 'react';
import { Link } from 'react-router-dom';

const Forbidden = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-red-50 to-red-100">
      {/* Lock Icon */}
      <div className="text-red-600 mb-8">
        <svg className="w-24 h-24 md:w-32 md:h-32" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0-6a2 2 0 110-4 2 2 0 010 4m9 8a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      {/* Error Message */}
      <h1 className="text-4xl md:text-6xl font-bold text-red-900 mb-4">
        403 - Access Denied
      </h1>
      <p className="text-lg md:text-xl text-red-600 mb-8 text-center">
        You do not have permission to view this page.
      </p>

      {/* Button */}
      <Link to="/" className="px-8 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-500 transition-all">
        Return to Home
      </Link>

    </div>
  );
};

export default Forbidden;
