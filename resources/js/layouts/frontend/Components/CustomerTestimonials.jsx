import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

// Placeholder data for testimonials
// In a real application, you might fetch these from your backend
const testimonials = [
    {
        id: 1,
        name: 'Austin',
        title: 'Freelance Developer',
        rating: 5,
        review: 'Impressed by the unique gadgets available. Found exactly what I needed for my coding setup. The website is intuitive, and checkout was a breeze. Keep up the great work!',
        avatar: '/uploads/teams/austinc.jpg'
    },
    {
        id: 2,
        name: 'Vera',
        title: 'Smart Home Creator',
        rating: 4,
        review: 'Finally, a store that gets it! The smart home devices I ordered integrated seamlessly. The product descriptions were accurate, and shipping was incredibly fast. A truly premium shopping experience.',
        avatar: '/uploads/teams/vera.jpg'
    },
    {
        id: 3,
        name: 'Jane',
        title: 'Professional Designer',
        rating: 5,
        review: 'The professional monitor I purchased is exceptional. The color accuracy is perfect for my design work. Fast delivery and secure packaging. This is my new go-to for electronics!',
        avatar: '/uploads/teams/star.jpg'
    },
    {
        id: 4,
        name: 'Kingsley',
        title: 'Tech Enthusiast',
        rating: 4,
        review: 'Absolutely blown away by the quality and speed of delivery! My new drone is incredible, and the customer service was top-notch. Highly recommend for any tech lover!',
        avatar: '/uploads/teams/kingsley.jpg'
    },
];

const CustomerTestimonials = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsToShow, setItemsToShow] = useState(1); // Default for mobile
    const carouselRef = useRef(null);
    const intervalRef = useRef(null);

    // For scroll-based animation
    const { ref: sectionRef, inView: sectionInView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    // Determine how many items to show based on screen width
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) { // Large screens (lg)
                setItemsToShow(3);
            } else if (window.innerWidth >= 768) { // Medium screens (md)
                setItemsToShow(2);
            } else { // Small screens (sm)
                setItemsToShow(1);
            }
        };

        handleResize(); // Set initially
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Autoplay functionality
    useEffect(() => {
        const startAutoplay = () => {
            intervalRef.current = setInterval(() => {
                setCurrentIndex(prevIndex => {
                    const nextIndex = (prevIndex + 1) % (testimonials.length - (itemsToShow - 1));
                    return nextIndex;
                });
            }, 5000); // Change testimonial every 5 seconds
        };

        const stopAutoplay = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };

        // Only start autoplay if there are enough testimonials to scroll
        if (testimonials.length > itemsToShow) {
            startAutoplay();
        }

        return () => stopAutoplay();
    }, [itemsToShow]); // Restart autoplay if itemsToShow changes

    const handleNext = () => {
        setCurrentIndex(prevIndex => {
            const nextIndex = (prevIndex + 1) % (testimonials.length - (itemsToShow - 1));
            return nextIndex;
        });
        clearInterval(intervalRef.current); // Pause autoplay on manual interaction
    };

    const handlePrev = () => {
        setCurrentIndex(prevIndex => {
            const newIndex = prevIndex - 1;
            return newIndex < 0 ? testimonials.length - (itemsToShow - 1) - 1 : newIndex;
        });
        clearInterval(intervalRef.current); // Pause autoplay on manual interaction
    };


    // Framer Motion variants
    const sectionTitleVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
    };

    const testimonialCardVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 30 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
        exit: { opacity: 0, scale: 0.9, y: -30, transition: { duration: 0.4, ease: "easeIn" } } // Exit animation
    };

    // Calculate the offset for the carousel transformation
    const carouselOffset = -(100 / itemsToShow) * currentIndex;

    return (
        <section
            ref={sectionRef} // Attach ref for intersection observer
            className="py-16 md:py-24 bg-gray-50 text-gray-900 relative overflow-hidden border-t border-gray-200
                       dark:bg-gray-950 dark:text-white dark:border-gray-800"
            style={{
                backgroundImage: `radial-gradient(at 0% 100%, rgba(200,200,250,0.4) 0%, transparent 50%),
                                  radial-gradient(at 100% 0%, rgba(250,200,200,0.4) 0%, transparent 50%)`, // Lighter, more airy gradients
                backgroundBlendMode: 'overlay',
            }}
        >
            {/* Subtle background abstract shapes/glows */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: sectionInView ? 1 : 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
            >
                {/* Lighter, more vibrant glows for light mode */}
                <div className="absolute top-[10%] right-[5%] w-48 h-48 bg-sky-300/30 rounded-full blur-3xl opacity-50 dark:bg-cyan-500/10 dark:opacity-30"></div>
                <div className="absolute bottom-[20%] left-[10%] w-56 h-56 bg-emerald-300/30 rounded-full blur-3xl opacity-50 dark:bg-lime-500/10 dark:opacity-30"></div>
            </motion.div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-12 md:mb-16"
                    variants={sectionTitleVariants}
                    initial="hidden"
                    animate={sectionInView ? "visible" : "hidden"}
                >
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-sm leading-tight
                                   dark:drop-shadow-lg">
                        What Our <span className="text-emerald-600 dark:text-lime-400">Customers Say</span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
                        Hear from the amazing people who love our products and service.
                    </p>
                </motion.div>

                {/* Testimonials Carousel */}
                <div className="relative">
                    <div className="overflow-hidden">
                        <motion.div
                            ref={carouselRef}
                            className="flex"
                            initial={false} // Prevent initial animation on transform
                            animate={{ x: carouselOffset + '%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <AnimatePresence> {/* AnimatePresence added for exit animations */}
                                {testimonials.map((testimonial, i) => (
                                    <motion.div
                                        key={testimonial.id}
                                        className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 p-4" // Use padding for gap
                                        variants={testimonialCardVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit" // Apply exit animation
                                    >
                                        <div className="bg-white rounded-xl p-8 shadow-xl h-full flex flex-col justify-between
                                                    group transform hover:scale-103 transition-transform duration-300 ease-out
                                                    border border-gray-200 hover:border-emerald-400
                                                    dark:bg-gray-800 dark:shadow-2xl dark:border-transparent dark:hover:border-lime-600">
                                            <Quote className="w-10 h-10 text-gray-300 mb-6 self-start transform -rotate-12 opacity-70
                                                            dark:text-gray-600 dark:opacity-50" />
                                            <p className="text-gray-700 text-lg leading-relaxed mb-6 flex-grow italic
                                                        dark:text-gray-300">
                                                "{testimonial.review}"
                                            </p>
                                            <div className="flex items-center mt-auto">
                                                <img
                                                    src={testimonial.avatar}
                                                    alt={testimonial.name}
                                                    className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-sky-500 shadow-md
                                                                dark:border-cyan-500"
                                                />
                                                <div>
                                                    <h4 className="text-xl font-bold text-gray-800 mb-1 dark:text-white">
                                                        {testimonial.name}
                                                    </h4>
                                                    <p className="text-gray-500 text-sm dark:text-gray-400">{testimonial.title}</p>
                                                    <div className="flex items-center mt-2">
                                                        {[...Array(5)].map((_, starIndex) => (
                                                            <Star
                                                                key={starIndex}
                                                                className={`w-5 h-5 ${starIndex < testimonial.rating
                                                                    ? 'text-amber-500 fill-amber-500 dark:text-yellow-400 dark:fill-yellow-400'
                                                                    : 'text-gray-400 dark:text-gray-600'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Carousel Navigation Buttons */}
                    {testimonials.length > itemsToShow && (
                        <>
                            <button
                                onClick={handlePrev}
                                className="absolute top-1/2 -translate-y-1/2 left-0 -ml-6 md:-ml-10
                                           bg-gray-200 text-gray-800 p-3 rounded-full shadow-lg
                                           hover:bg-gray-300 transition-colors duration-300 z-20 focus:outline-none focus:ring-2 focus:ring-emerald-500
                                           dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-cyan-500"
                                aria-label="Previous testimonial"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute top-1/2 -translate-y-1/2 right-0 -mr-6 md:-mr-10
                                           bg-gray-200 text-gray-800 p-3 rounded-full shadow-lg
                                           hover:bg-gray-300 transition-colors duration-300 z-20 focus:outline-none focus:ring-2 focus:ring-emerald-500
                                           dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-cyan-500"
                                aria-label="Next testimonial"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}
                    {/* Dots for navigation */}
                    {testimonials.length > itemsToShow && (
                        <div className="flex justify-center mt-8 gap-3">
                            {testimonials.slice(0, testimonials.length - (itemsToShow - 1)).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-3 h-3 rounded-full transition-colors duration-300
                                                ${currentIndex === idx
                                            ? 'bg-emerald-500 scale-125 dark:bg-lime-400'
                                            : 'bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500'
                                        }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CustomerTestimonials;