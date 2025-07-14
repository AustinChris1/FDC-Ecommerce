import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Sparkles, Gift, Flame, Package, Wallet, Tag, Cloud, Zap, Percent, ShoppingCart, Truck, CreditCard, Star } from 'lucide-react'; // Added more icons

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-creative';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Import required modules
import { EffectCreative, Autoplay, Pagination, Navigation } from 'swiper/modules';

// --- Global Animation Variants (Adjusted for faster, more impactful entry) ---

const contentContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08, // Even faster stagger for immediate impact
            delayChildren: 0.1, // Minimal delay for quick reveal
        }
    }
};

const slideItemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)', rotateX: 20 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        rotateX: 0,
        transition: {
            duration: 0.7, // Slightly longer for more impact, but still quick
            ease: [0.22, 1, 0.36, 1], // More aggressive "easeOutExpo" like curve
        }
    }
};

// Define your slider content with more unique properties and animations
const slides = [
    {
        id: 1,
        preTitle: "Mega Savings Event!",
        title: "⚡ Flash Deals: Prices Exploding! 💥",
        subtitle: "Grab jaw-dropping discounts on electronics, fashion, and more before they vanish!",
        buttonText: "Ignite Savings",
        buttonLink: "/flash-sales",
        buttonIcon: <Flame className="w-5 h-5 mr-2" />, // More thematic icon for the button
        icon: <Zap className="w-8 h-8 mr-3 text-yellow-300 transform rotate-[-10deg]" />, // Larger, slightly rotated lead icon
        // --- UPDATED BACKGROUND IMAGE ---
        backgroundImage: 'https://plus.unsplash.com/premium_photo-1661682801696-e499fa39ac0e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8aGFwcHklMjBibGFjayUyMHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D',
        // Removed explicit bgColor as it's not used when backgroundImage is present
        uniqueAnimationProps: {
            preTitle: { y: -50, opacity: 0, scale: 0.8 },
            title: { rotateX: -90, opacity: 0, scale: 0.5, transformOrigin: 'bottom' }, // More dramatic 3D rotation
            subtitle: { x: -100, opacity: 0, skewX: -20 }, // Skewed entry
            button: { y: 150, opacity: 0, scale: 0.7, rotateZ: 30 }, // Larger movement, slight rotation
        },
        backgroundElements: (
            <>
                {/* Large, swirling background shapes for energy */}
                <motion.div
                    className="absolute top-[10%] left-[10%] w-[180px] h-[180px] sm:w-[280px] sm:h-[280px] bg-red-600/25 rounded-full" // Responsive sizing
                    style={{ filter: 'blur(120px)' }}
                    animate={{ scale: [0.9, 1.3, 0.9], opacity: [0.5, 0.9, 0.5], rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute bottom-[5%] right-[15%] w-[120px] h-[120px] sm:w-[220px] sm:h-[220px] bg-orange-500/25 rounded-full" // Responsive sizing
                    style={{ filter: 'blur(110px)' }}
                    animate={{ scale: [1.3, 0.9, 1.3], opacity: [0.9, 0.5, 0.9], rotate: [360, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "linear", delay: 0.5 }}
                />

                {/* Smaller, scattered icons/elements for detail */}
                <motion.div
                    className="absolute top-[20%] left-[45%] text-red-400/70"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: [0, 1, 0], y: [-20, 0, 20] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
                >
                    <Percent className="w-8 h-8 sm:w-10 sm:h-10" /> {/* Responsive icon size */}
                </motion.div>
                <motion.div
                    className="absolute bottom-[25%] left-[20%] text-yellow-400/70"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 180] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
                >
                    <Tag className="w-10 h-10 sm:w-12 sm:h-12" /> {/* Responsive icon size */}
                </motion.div>
                <motion.div
                    className="absolute top-[35%] right-[5%] text-orange-400/70"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: [0, 1, 0], x: [20, 0, -20] }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: 0.8, ease: "easeInOut" }}
                >
                    <Star className="w-8 h-8 sm:w-10 sm:h-10" /> {/* Responsive icon size */}
                </motion.div>
                <motion.div
                    className="absolute top-[5%] right-[25%] text-red-500/60"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: [0, 0.8, 0], scale: [0.7, 1.1, 0.7], rotate: [0, 90, 180] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.3, ease: "easeInOut" }}
                >
                    <Zap className="w-6 h-6 sm:w-8 sm:h-8" /> {/* Responsive icon size */}
                </motion.div>
                <motion.div
                    className="absolute bottom-[10%] left-[40%] text-yellow-500/60"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: [0, 0.8, 0], y: [-30, 0, 30] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.6, ease: "easeInOut" }}
                >
                    <Flame className="w-7 h-7 sm:w-9 sm:h-9" /> {/* Responsive icon size */}
                </motion.div>
            </>
        ),
        additionalIcons: (
            <>
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 animate-pulse" />
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 animate-bounce-slow" />
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 animate-slide-right" />
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
            </>
        ),
    },
    {
        id: 2,
        preTitle: "Massive Giveaways!",
        title: "🎁 Awoof Bonanza: Unbox Pure Joy!",
        subtitle: "Exclusive deals and irresistible freebies from your favorite brands. Don't miss out!",
        buttonText: "Claim Awoof",
        buttonLink: "/",
        buttonIcon: <Gift className="w-5 h-5 mr-2" />,
        icon: <Sparkles className="w-8 h-8 mr-3 text-lime-400 transform scale-125" />,
        backgroundImage: 'https://images.unsplash.com/photo-1655720362153-1bbfa72c2d13?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGFwcHklMjBibGFjayUyMHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D',
        uniqueAnimationProps: {
            preTitle: { opacity: 0, y: -40 },
            title: { scale: 0.6, opacity: 0, rotateZ: 90 },
            subtitle: { y: 100, opacity: 0, skewY: -15 },
            button: { x: -100, opacity: 0, scale: 0.6, rotateX: 90 },
        },
        backgroundElements: (
            <>
                <motion.div
                    className="absolute top-[15%] left-[20%] w-[100px] h-[100px] sm:w-[180px] sm:h-[180px] bg-green-500/20 rounded-xl rotate-45"
                    style={{ filter: 'blur(80px)' }}
                    animate={{ y: ["-10%", "10%", "-10%"], x: ["-5%", "5%", "-5%"], rotate: [45, 90, 45] }}
                    transition={{ duration: 12, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-[10%] right-[25%] w-[80px] h-[80px] sm:w-[150px] sm:h-[150px] bg-blue-400/20 rounded-full"
                    style={{ filter: 'blur(70px)' }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                />
                <motion.div
                    className="absolute top-[40%] right-[10%] text-green-300/70"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, -180] }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: 0.7, ease: "easeInOut" }}
                >
                    <Gift className="w-8 h-8 sm:w-10 sm:h-10" />
                </motion.div>
                <motion.div
                    className="absolute bottom-[30%] left-[5%] text-teal-300/70"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: [0, 1, 0], x: [-20, 0, 20] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.4, ease: "easeInOut" }}
                >
                    <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />
                </motion.div>
            </>
        ),
        additionalIcons: (
            <>
                <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 animate-bounce" />
                <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
            </>
        ),
    },
    {
        id: 3,
        preTitle: "Swift & Secure!",
        title: "🚀 Warp Speed Delivery: Your Goods Await!",
        subtitle: "Experience lightning-fast delivery across Lagos. Get your orders in record time!",
        buttonText: "Track Your Order",
        buttonLink: "/user/orders",
        buttonIcon: <Truck className="w-5 h-5 mr-2" />,
        icon: <Package className="w-8 h-8 mr-3 text-sky-400 animate-pulse" />,
        backgroundImage: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhhcHB5JTIwYmxhY2slMjBwZXJzb258ZW58MHx8MHx8fDA%3D',
        uniqueAnimationProps: {
            preTitle: { opacity: 0, y: -30 },
            title: { x: -80, opacity: 0, scale: 0.8 },
            subtitle: { x: 80, opacity: 0, scale: 0.8 },
            button: { opacity: 0, rotateZ: -90, scale: 0.6 },
        },
        backgroundElements: (
            <>
                {/* Speed lines effect */}
                <motion.div
                    className="absolute top-0 left-0 w-full h-[30px] sm:h-[60px] bg-cyan-400/15" // Responsive height
                    style={{ filter: 'blur(40px)' }}
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute bottom-0 right-0 w-full h-[30px] sm:h-[60px] bg-indigo-400/15" // Responsive height
                    style={{ filter: 'blur(40px)' }}
                    animate={{ x: ["100%", "-100%"] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 1 }}
                />
                {/* Subtle grid pattern for futuristic feel */}
                <motion.div
                    className="absolute inset-0 [mask-image:radial-gradient(transparent,black)] [background-size:20px_20px] sm:[background-size:40px_40px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] opacity-20" // Responsive background-size
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1, opacity: [0.1, 0.25, 0.1] }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                ></motion.div>
                {/* More delivery-themed icons */}
                <motion.div
                    className="absolute top-[25%] left-[15%] text-white/50"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: [0, 1, 0], y: [-30, 0, 30] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
                >
                    <Cloud className="w-8 h-8 sm:w-10 sm:h-10" />
                </motion.div>
                <motion.div
                    className="absolute bottom-[20%] right-[10%] text-white/50"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.6, 1.1, 0.6], rotate: [0, 360] }}
                    transition={{ duration: 4.5, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
                >
                    <Truck className="w-10 h-10 sm:w-12 sm:h-12" />
                </motion.div>
            </>
        ),
        additionalIcons: (
            <>
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 animate-pulse" />
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
                <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
            </>
        ),
    },
    {
        id: 4,
        preTitle: "Upgrade Your Lifestyle!",
        title: "🛒 Must-Have Sale: Elevate Your Every Day!",
        subtitle: "Discover the latest trends in fashion, electronics, and home goods with unbeatable prices.",
        buttonText: "Shop All Essentials",
        buttonLink: "/trending",
        buttonIcon: <ShoppingCart className="w-5 h-5 mr-2" />,
        icon: <ShoppingBag className="w-8 h-8 mr-3 text-purple-400 transform scale-110" />,
        backgroundImage: 'https://images.unsplash.com/photo-1542849887-f70517865241?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        uniqueAnimationProps: {
            preTitle: { opacity: 0, y: -20 },
            title: { scale: 0.7, opacity: 0, rotateZ: -10 },
            subtitle: { x: -80, opacity: 0 },
            button: { y: 60, opacity: 0, scale: 0.8 },
        },
        backgroundElements: (
            <>
                <motion.div
                    className="absolute top-[10%] left-[10%] w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] bg-purple-500/20 rounded-full" // Responsive sizing
                    style={{ filter: 'blur(150px)', transform: 'translate(-50%, -50%)' }}
                    animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.05, 1] }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-[10%] right-[10%] w-[150px] h-[150px] sm:w-[250px] sm:h-[250px] bg-fuchsia-400/20 rounded-full" // Responsive sizing
                    style={{ filter: 'blur(100px)' }}
                    animate={{ y: ["-15%", "15%"], x: ["-15%", "15%"] }}
                    transition={{ duration: 11, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-[20%] left-[25%] text-purple-300/60"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8], rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.3, ease: "easeInOut" }}
                >
                    <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12" />
                </motion.div>
                <motion.div
                    className="absolute bottom-[20%] left-[30%] text-pink-300/60"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: [0, 1, 0], x: [-20, 0, 20] }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: 0.6, ease: "easeInOut" }}
                >
                    <Star className="w-8 h-8 sm:w-10 sm:h-10" />
                </motion.div>
                <motion.div
                    className="absolute top-[40%] right-[20%] text-fuchsia-300/60"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: [0, 1, 0], y: [20, 0, -20] }}
                    transition={{ duration: 4.2, repeat: Infinity, delay: 0.9, ease: "easeInOut" }}
                >
                    <Tag className="w-8 h-8 sm:w-10 sm:h-10" />
                </motion.div>
            </>
        ),
        additionalIcons: (
            <>
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
                <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
            </>
        ),
    }
];

const HeroSlider = () => {
    return (
        <section className="relative mt-10 w-full h-screen md:h-[600px] lg:h-[700px] xl:h-[800px] overflow-hidden text-white bg-gray-950 dark:bg-black">
            <Swiper
                modules={[EffectCreative, Autoplay, Pagination, Navigation]}
                effect={"creative"}
                creativeEffect={{
                    prev: {
                        shadow: true,
                        translate: ["-120%", 0, -500],
                    },
                    next: {
                        shadow: true,
                        translate: ["120%", 0, -500],
                    },
                }}
                autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                }}
                speed={1200}
                pagination={{ clickable: true }}
                navigation={true}
                loop={true}
                className="mySwiper w-full h-full"
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        {({ isActive }) => (
                            <div className="relative w-full h-full flex items-center justify-center text-center">
                                {/* Layer 1: Contextual Background Image (Prominent but filtered) */}
                                <div
                                    className="absolute inset-0 z-0 opacity-40"
                                    style={{
                                        backgroundImage: `url(${slide.backgroundImage})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        filter: 'brightness(60%) contrast(120%) saturate(120%)',
                                    }}
                                ></div>

                                {/* Layer 2: Gradient Overlay with Brand Colors (Dominant color layer) */}
                                {/* The original component had `slide.bgColor` but no `bgColor` in the slide data.
                                    Assuming it was intended to use a dynamic class based on the slide.
                                    For now, I'll add a placeholder gradient if `slide.bgColor` isn't defined.
                                */}
                                <div className={`absolute inset-0 z-10 bg-gradient-to-br ${slide.bgColor || 'from-gray-800/70 to-black/70'}`}></div>

                                {/* Layer 3: Dynamic & Thematic Background Elements */}
                                <motion.div
                                    className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: isActive ? 1 : 0 }}
                                    transition={{ duration: 0.8, delay: 0.1 }}
                                >
                                    {slide.backgroundElements}
                                </motion.div>

                                {/* Layer 4: Content Area with Enhanced Animations */}
                                <motion.div
                                    className="relative z-30 p-4 sm:p-6 md:p-10 lg:p-16 max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto text-white perspective-1000" // Responsive padding and max-width
                                    variants={contentContainerVariants}
                                    initial="hidden"
                                    animate={isActive ? "visible" : "hidden"}
                                >
                                    {/* PreTitle with icon */}
                                    <motion.h2
                                        className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold tracking-wider opacity-90 mb-3 sm:mb-4 flex items-center justify-center" // Responsive text size, reduced margin
                                        variants={slideItemVariants}
                                        initial={slide.uniqueAnimationProps.preTitle || { opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ ...slideItemVariants.visible.transition, delay: 0.1 }}
                                    >
                                        {slide.icon}
                                        {slide.preTitle}
                                    </motion.h2>

                                    {/* Main Title */}
                                    <motion.h1
                                        className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-extrabold leading-tight tracking-tighter drop-shadow-3xl mb-6 sm:mb-8 text-shadow-lg" // Responsive text size, reduced margin
                                        variants={slideItemVariants}
                                        initial={slide.uniqueAnimationProps.title}
                                        animate={{ opacity: 1, y: 0, x: 0, scale: 1, rotateX: 0, rotateY: 0, rotateZ: 0, skewY: 0, filter: 'blur(0px)' }}
                                        transition={{ ...slideItemVariants.visible.transition, delay: 0.3 }}
                                    >
                                        {slide.title.split(' ').map((word, index) => (
                                            <span key={index} className={word.includes(':') || word.includes('!') || word.includes('💥') ? 'text-yellow-400 animate-pulse-fast' : ''}>
                                                {word}{' '}
                                            </span>
                                        ))}
                                    </motion.h1>

                                    {/* Subtitle */}
                                    <motion.p
                                        className="text-base sm:text-lg md:text-xl lg:text-2xl font-light leading-relaxed mb-8 sm:mb-10 opacity-95 drop-shadow-xl max-w-3xl mx-auto" // Responsive text size, reduced margin, max-width
                                        variants={slideItemVariants}
                                        initial={slide.uniqueAnimationProps.subtitle}
                                        animate={{ opacity: 1, y: 0, x: 0, scale: 1, rotateX: 0, rotateY: 0, rotateZ: 0, skewY: 0, filter: 'blur(0px)' }}
                                        transition={{ ...slideItemVariants.visible.transition, delay: 0.5 }}
                                    >
                                        {slide.subtitle}
                                    </motion.p>

                                    {/* Call to Action Button */}
                                    <motion.div
                                        variants={slideItemVariants}
                                        initial={slide.uniqueAnimationProps.button}
                                        animate={{ opacity: 1, y: 0, x: 0, scale: 1, rotateZ: 0 }}
                                        transition={{ ...slideItemVariants.visible.transition, delay: 0.7 }}
                                    >
                                        <Link
                                            to={slide.buttonLink}
                                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-6 sm:py-4 sm:px-10 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center group text-lg sm:text-xl relative overflow-hidden z-10 mx-auto border-2 border-white/30" // Responsive padding, text size
                                            style={{ maxWidth: 'fit-content' }}
                                        >
                                            {slide.buttonIcon}
                                            {slide.buttonText}
                                            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 transition-all duration-300" /> {/* Responsive icon size, reduced margin */}
                                            <span className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.3)_0%,_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></span>
                                        </Link>
                                    </motion.div>

                                    {/* Additional Icons / Micro-infographics */}
                                    {slide.additionalIcons && (
                                        <motion.div
                                            className="flex justify-center items-center mt-6 sm:mt-8 space-x-4 sm:space-x-6 opacity-80" // Responsive margin-top and space-x
                                            variants={slideItemVariants}
                                            initial={{ opacity: 0, y: 40, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
                                        >
                                            {slide.additionalIcons}
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default HeroSlider;