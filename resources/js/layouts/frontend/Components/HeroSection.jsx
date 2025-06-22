import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, TrendingUp, ShieldCheck } from 'lucide-react'; // Added more relevant icons

// Placeholder for hero background image - choose a high-quality, abstract tech/product image
const heroImage = 'https://images.unsplash.com/photo-1510511459019-5da409737950?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Example: circuit board, abstract tech lines

const HeroSection = () => {
    // Framer Motion animation variants for staggered text and button entrance
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15, // Even faster staggering
                delayChildren: 0.4, // Reduced initial delay
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6, // Faster, snappier animation
                ease: 'easeOut',
            },
        },
    };

    // Variants for the subtle background elements/gradients
    const backgroundElementsVariants = {
        initial: { opacity: 0, scale: 0.95 },
        animate: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 1.5,
                ease: "easeOut",
                staggerChildren: 0.3,
                delayChildren: 0.5,
            },
        },
    };

    // Variants for the individual background shapes (more subtle motion)
    const shapeMotion = {
        animate: {
            y: ["-5%", "5%", "-5%"],
            x: ["-3%", "3%", "-3%"],
            rotate: [0.5, -0.5, 0.5],
            transition: {
                duration: 15,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
            },
        },
    };


    return (
        <section className="relative w-full h-screen overflow-hidden flex items-center justify-center text-center text-white bg-gray-950 dark:bg-black">
            {/* Background Layer 1: Dark base with subtle pattern/texture */}
            <div
                className="absolute inset-0 z-0 opacity-20"
                style={{
                    backgroundImage: `url(${heroImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'grayscale(100%) brightness(50%) contrast(150%)', // Desaturate, darken, add contrast
                }}
            ></div>

            {/* Background Layer 2: Complex Gradient Overlay for rich depth */}
            <div className="absolute inset-0 z-10 bg-gradient-to-br from-gray-900/90 via-blue-950/80 to-purple-900/70 dark:from-black/90 dark:via-gray-950/80 dark:to-blue-900/70"></div>

            {/* Background Layer 3: Dynamic Abstract Shapes/Glows (Framer Motion) */}
            <motion.div
                className="absolute inset-0 z-20 pointer-events-none"
                variants={backgroundElementsVariants}
                initial="initial"
                animate="animate"
            >
                {/* Large, slow, deep blue glow */}
                <motion.div
                    className="absolute top-1/4 left-1/4 w-[250px] h-[250px] bg-blue-700/10 rounded-full"
                    style={{ filter: 'blur(70px)' }}
                    variants={shapeMotion}
                />
                {/* Medium, faster, slightly purple glow */}
                <motion.div
                    className="absolute bottom-1/3 right-1/5 w-[200px] h-[200px] bg-indigo-600/10 rounded-full"
                    style={{ filter: 'blur(60px)' }}
                    variants={shapeMotion}
                    transition={{ ...shapeMotion.animate.transition, duration: 12, delay: 0.5 }}
                />
                {/* Smaller, subtle, electric blue glow */}
                <motion.div
                    className="absolute top-1/5 right-1/4 w-[150px] h-[150px] bg-cyan-400/10 rounded-full"
                    style={{ filter: 'blur(50px)' }}
                    variants={shapeMotion}
                    transition={{ ...shapeMotion.animate.transition, duration: 10, delay: 1 }}
                />
                {/* Subtle grid/line pattern (achieved with pseudo-elements or background-image) */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(var(--blue-900-rgb),0.05)_80%)] dark:bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(var(--gray-900-rgb),0.05)_80%)] opacity-30"></div>
                {/* More complex grid effect (requires custom CSS or SVG, simplified for Tailwind) */}
                <div className="absolute inset-0 [mask-image:radial-gradient(transparent,black)] [background-size:20px_20px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] opacity-10"></div>
            </motion.div>


            {/* Content Area */}
            <motion.div
                className="relative z-30 p-6 md:p-10 lg:p-16 max-w-5xl mx-auto text-white"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h1
                    className="text-4xl sm:text-6xl lg:text-8xl font-extrabold leading-tight tracking-tighter drop-shadow-2xl mb-6 text-shadow-xl" // Stronger text shadow
                    variants={itemVariants}
                >
                    Experience Tomorrow's <span className="text-cyan-400">Tech Today</span>.
                </motion.h1>

                <motion.p
                    className="text-lg sm:text-xl lg:text-2xl font-light leading-relaxed mb-10 opacity-90 drop-shadow-lg max-w-3xl mx-auto"
                    variants={itemVariants}
                >
                    Dive into a world of cutting-edge electronics, smart innovations, and essential gadgets. Your future, simplified.
                </motion.p>

                {/* Call to Action Buttons */}
                <motion.div
                    className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-12"
                    variants={itemVariants}
                >
                    <Link
                        to="/shop"
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3 px-8 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center group text-lg relative overflow-hidden z-10"
                    >
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        Explore Our Collections
                        <ArrowRight className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                        {/* Shimmer effect on hover */}
                        <span className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.2)_0%,_transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></span>
                    </Link>
                    <Link
                        to="/collections/trending" // Example: Link to trending products
                        className="bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center group text-lg"
                    >
                        <TrendingUp className="w-5 h-5 mr-2 text-lime-400" /> {/* Changed icon and color */}
                        What's Trending Now
                        <ArrowRight className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                    </Link>
                </motion.div>

                {/* Value Proposition/Feature Highlights */}
                <motion.div
                    className="flex flex-col md:flex-row justify-center items-center gap-8 text-white/80 text-sm md:text-base mt-8"
                    variants={itemVariants}
                >
                    <div className="flex items-center">
                        <ShieldCheck className="w-5 h-5 text-green-400 mr-2" /> {/* Changed icon and color */}
                        <span className="font-semibold">Secure Payments</span>
                    </div>
                    <div className="flex items-center">
                        <ShoppingBag className="w-5 h-5 text-sky-400 mr-2" />
                        <span className="font-semibold">Worldwide Delivery</span>
                    </div>
                    <div className="flex items-center">
                        <TrendingUp className="w-5 h-5 text-orange-400 mr-2" /> {/* Changed icon and color */}
                        <span className="font-semibold">Top-Rated Products</span>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default HeroSection;