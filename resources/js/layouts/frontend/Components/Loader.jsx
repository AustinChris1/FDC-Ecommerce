import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react'; // Using a single icon for a subtle animation

const LoadingSpinner = ({ size = 'lg' }) => {
    // Determine size classes
    const sizeClasses = {
        'sm': 'w-8 h-8 text-cyan-400',
        'md': 'w-12 h-12 text-lime-400',
        'lg': 'w-16 h-16 text-blue-500', // Default large for full-screen
        'xl': 'w-24 h-24 text-purple-400',
    };

    // Determine text size based on spinner size
    const textClasses = {
        'sm': 'text-sm',
        'md': 'text-base',
        'lg': 'text-lg',
        'xl': 'text-xl',
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                when: "beforeChildren", // Animate container before children
                staggerChildren: 0.1
            }
        },
        exit: { opacity: 0, transition: { duration: 0.3 } }
    };

    const dotVariants = {
        initial: { y: "0%" },
        animate: {
            y: ["0%", "-50%", "0%"], // Bounce effect
            scaleY: [1, 0.6, 1], // Squash and stretch
            transition: {
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const lineVariants = {
        initial: { pathLength: 0, opacity: 0 },
        animate: (i) => ({
            pathLength: 1,
            opacity: [0.2, 1, 0.2],
            rotate: 360, // Continuous rotation
            transition: {
                duration: 2 + i * 0.2, // Staggered and slightly varied speed
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop"
            }
        })
    };


    return (
        <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center bg-gray-950 bg-opacity-90 backdrop-blur-sm z-[9999] text-gray-300" // Deeper dark background, higher z-index
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <motion.div
                className="relative w-32 h-32 flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Central Icon - Loader2 from Lucide React, continuously spinning */}
                <motion.div
                    className={`${sizeClasses[size]} absolute z-10 flex items-center justify-center`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                >
                    <Loader2 className="w-full h-full" />
                </motion.div>

                {/* Pulsing Outer Rings (SVG) */}
                <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                    {/* Inner ring pulse */}
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="30"
                        stroke="#0EA5E9" // Blue-500
                        strokeWidth="2"
                        fill="none"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0.1, 0.5, 0.1], scale: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {/* Outer ring pulse */}
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="#8B5CF6" // Purple-500
                        strokeWidth="2"
                        fill="none"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: [0.05, 0.3, 0.05], scale: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    />
                     {/* Dynamic Data Lines */}
                    {Array.from({ length: 4 }).map((_, i) => (
                        <motion.path
                            key={i}
                            d={`M 50 50 L ${50 + 40 * Math.cos(i * Math.PI / 2 + Math.PI / 4)} ${50 + 40 * Math.sin(i * Math.PI / 2 + Math.PI / 4)}`}
                            stroke="#06B6D4" // Cyan-500
                            strokeWidth="1.5"
                            fill="none"
                            variants={lineVariants}
                            initial="initial"
                            animate="animate"
                            custom={i}
                        />
                    ))}
                </svg>

                {/* Bouncing Dots (using absolute positioning) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex space-x-2">
                    {['#EC4899', '#F97316', '#EAB308'].map((color, i) => ( // Pink, Orange, Yellow
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: color }}
                            variants={dotVariants}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: i * 0.1 }} // Staggered bounce
                        />
                    ))}
                </div>
            </motion.div>

            <motion.p
                className={`mt-8 text-xl font-semibold ${textClasses[size]} text-gray-200`} // Adjusted text color
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
            >
                Processing...
            </motion.p>
        </motion.div>
    );
};

export default LoadingSpinner;