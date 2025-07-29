import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GlitchLoadingSpinner = ({ size = 'lg' }) => {
    const [glitchText, setGlitchText] = useState('LOADING');
    const [binaryStream, setBinaryStream] = useState([]);
    const [hexData, setHexData] = useState([]);

    // Generate random binary stream
    useEffect(() => {
        const generateBinary = () => {
            const stream = Array.from({ length: 50 }, () => 
                Math.random() > 0.5 ? '1' : '0'
            );
            setBinaryStream(stream);
        };
        
        const interval = setInterval(generateBinary, 150);
        return () => clearInterval(interval);
    }, []);

    // Generate hex data
    useEffect(() => {
        const generateHex = () => {
            const hex = Array.from({ length: 8 }, () => 
                Math.floor(Math.random() * 16).toString(16).toUpperCase()
            );
            setHexData(hex);
        };
        
        const interval = setInterval(generateHex, 200);
        return () => clearInterval(interval);
    }, []);

    // Glitch text effect
    useEffect(() => {
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?`~';
        const originalText = 'LOADING';
        
        const glitchInterval = setInterval(() => {
            if (Math.random() > 0.7) {
                const glitched = originalText.split('').map(char => 
                    Math.random() > 0.8 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
                ).join('');
                setGlitchText(glitched);
                
                setTimeout(() => setGlitchText(originalText), 100);
            }
        }, 300);
        
        return () => clearInterval(glitchInterval);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        },
        exit: { opacity: 0, transition: { duration: 0.3 } }
    };

    const glitchVariants = {
        initial: { 
            scale: 1,
            x: 0,
            filter: 'hue-rotate(0deg) contrast(1)'
        },
        animate: {
            scale: [1, 1.02, 0.98, 1],
            x: [0, -2, 2, 0],
            filter: [
                'hue-rotate(0deg) contrast(1)',
                'hue-rotate(90deg) contrast(1.2)',
                'hue-rotate(180deg) contrast(0.8)',
                'hue-rotate(0deg) contrast(1)'
            ],
            transition: {
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
            }
        }
    };

    const scanLineVariants = {
        animate: {
            y: [-200, 200],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };

    const binaryVariants = {
        animate: (i) => ({
            opacity: [0.2, 1, 0.2],
            y: [0, -10, 0],
            transition: {
                duration: 1,
                repeat: Infinity,
                delay: i * 0.05,
                ease: "easeInOut"
            }
        })
    };

    return (
        <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-95 backdrop-blur-sm z-[9999] overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            {/* Scanning lines background */}
            <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                        style={{ top: `${i * 5}%` }}
                        animate={{
                            opacity: [0.1, 0.8, 0.1],
                            scaleX: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            {/* Moving scan line */}
            <motion.div
                className="absolute w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-60"
                variants={scanLineVariants}
                animate="animate"
            />

            {/* Binary stream background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full flex flex-wrap text-green-400 text-xs opacity-20 font-mono">
                    {binaryStream.map((bit, i) => (
                        <motion.span
                            key={i}
                            className="inline-block"
                            variants={binaryVariants}
                            animate="animate"
                            custom={i}
                        >
                            {bit}
                        </motion.span>
                    ))}
                </div>
            </div>

            {/* Main loading container */}
            <motion.div
                className="relative z-10"
                variants={glitchVariants}
                initial="initial"
                animate="animate"
            >
                {/* Central holographic display */}
                <div className="relative w-80 h-80 border border-cyan-400 bg-black bg-opacity-80 rounded-lg overflow-hidden">
                    {/* Corner decorations */}
                    {[
                        'top-0 left-0',
                        'top-0 right-0',
                        'bottom-0 left-0',
                        'bottom-0 right-0'
                    ].map((position, i) => (
                        <div key={i} className={`absolute ${position} w-8 h-8`}>
                            <div className="w-full h-0.5 bg-cyan-400"></div>
                            <div className="w-0.5 h-full bg-cyan-400"></div>
                        </div>
                    ))}

                    {/* Rotating tech circles */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {[60, 100, 140].map((size, i) => (
                            <motion.div
                                key={i}
                                className={`absolute border border-cyan-400 rounded-full opacity-30`}
                                style={{ width: size, height: size }}
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 4 + i * 2,
                                    repeat: Infinity,
                                    ease: "linear",
                                    direction: i % 2 === 0 ? "normal" : "reverse"
                                }}
                            >
                                {/* Tech dots on circles */}
                                {Array.from({ length: 6 }).map((_, dotIndex) => (
                                    <motion.div
                                        key={dotIndex}
                                        className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                                        style={{
                                            top: '50%',
                                            left: '50%',
                                            transform: `translate(-50%, -50%) rotate(${dotIndex * 60}deg) translateY(-${size/2}px)`
                                        }}
                                        animate={{
                                            opacity: [0.3, 1, 0.3],
                                            scale: [0.5, 1, 0.5]
                                        }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            delay: dotIndex * 0.1
                                        }}
                                    />
                                ))}
                            </motion.div>
                        ))}

                        {/* Central pulsing core */}
                        <motion.div
                            className="w-16 h-16 border-2 border-green-400 rounded-full flex items-center justify-center"
                            animate={{
                                scale: [1, 1.2, 1],
                                borderColor: ['#22c55e', '#06b6d4', '#3b82f6', '#22c55e']
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <motion.div
                                className="w-8 h-8 bg-green-400 rounded-full"
                                animate={{
                                    scale: [0.5, 1, 0.5],
                                    opacity: [0.5, 1, 0.5]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        </motion.div>
                    </div>

                    {/* Hex data display */}
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                        <div className="text-xs font-mono text-cyan-400 opacity-70">
                            0x{hexData.join('')}
                        </div>
                        <div className="text-xs font-mono text-green-400 opacity-50 mt-1">
                            SYS_LOADING.EXE
                        </div>
                    </div>
                </div>

                {/* Glitch text */}
                <motion.div
                    className="mt-8 text-center"
                    animate={{
                        textShadow: [
                            '0 0 5px #22c55e',
                            '2px 0 0 #ff0000, -2px 0 0 #00ffff',
                            '0 0 10px #3b82f6',
                            '0 0 5px #22c55e'
                        ]
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <h1 className="text-3xl font-bold text-green-400 font-mono tracking-wider">
                        {glitchText}
                    </h1>
                </motion.div>

                {/* Progress dots */}
                <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-cyan-400 rounded-full"
                            animate={{
                                opacity: [0.3, 1, 0.3],
                                scale: [0.8, 1.2, 0.8]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>

                {/* Status text */}
                <motion.p
                    className="mt-4 text-sm text-cyan-400 text-center font-mono opacity-70"
                    animate={{
                        opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    INITIALIZING NEURAL PATHWAYS...
                </motion.p>
            </motion.div>

            {/* Glitch overlay effect */}
            <AnimatePresence>
                {Math.random() > 0.9 && (
                    <motion.div
                        className="absolute inset-0 bg-red-500 mix-blend-multiply pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.1, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default GlitchLoadingSpinner;