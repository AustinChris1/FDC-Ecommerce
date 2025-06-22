import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const StarRating = ({ rating, totalStars = 5, onClick = () => {}, isClickable = false }) => {
    // Determine the fill percentage for partial stars
    const getFillPercentage = (starIndex) => {
        const diff = rating - starIndex;
        if (diff >= 1) return '100%'; // Full star
        if (diff > 0) return `${diff * 100}%`; // Partial star
        return '0%'; // Empty star
    };

    const starVariants = {
        hover: { scale: 1.2, color: 'rgb(251 191 36)' }, // Yellow-500
        tap: { scale: 0.9 }
    };

    return (
        <div className="flex items-center space-x-1">
            {[...Array(totalStars)].map((_, index) => {
                const currentStarValue = index + 1;
                const fillPercentage = getFillPercentage(index);

                return (
                    <motion.div
                        key={index}
                        className={`relative ${isClickable ? 'cursor-pointer' : ''}`}
                        onClick={isClickable ? () => onClick(currentStarValue) : undefined}
                        variants={isClickable ? starVariants : {}}
                        whileHover={isClickable ? "hover" : ""}
                        whileTap={isClickable ? "tap" : ""}
                    >
                        {/* Background for empty star */}
                        <Star
                            className="w-6 h-6 text-gray-700" // Dark gray for empty part
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.5}
                        />
                        {/* Overlay for filled part */}
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: fillPercentage,
                                overflow: 'hidden',
                                display: 'inline-block', // To make width apply to Star icon correctly
                            }}
                        >
                            <Star
                                className="w-6 h-6 text-yellow-400" // Vibrant yellow for filled part
                                fill="currentColor"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default StarRating;