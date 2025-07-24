import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
    Truck,           // For fast shipping
    ShieldCheck,     // For secure payments/guarantee
    Headphones,      // For support
    Award,           // For quality/excellence
    RefreshCcw,      // For easy returns
    Zap              // For innovative/fast tech
} from 'lucide-react';

const propositions = [
    {
        icon: Truck,
        title: 'Blazing Fast Shipping',
        description: 'Get your tech delivered to your doorstep at lightning speed, worldwide.',
        color: 'text-sky-500 dark:text-cyan-400', // Light mode: sky-500, Dark mode: cyan-400
    },
    {
        icon: ShieldCheck,
        title: 'Secure & Seamless Payments',
        description: 'Shop with confidence using our encrypted and trusted payment gateways.',
        color: 'text-green-500 dark:text-lime-400', // Light mode: green-500, Dark mode: lime-400
    },
    {
        icon: Headphones,
        title: '24/7 Premium Support',
        description: 'Our dedicated team is always here to assist you, day or night.',
        color: 'text-indigo-500 dark:text-blue-400', // Light mode: indigo-500, Dark mode: blue-400
    },
    {
        icon: Award,
        title: 'Uncompromising Quality',
        description: 'Every product is rigorously tested to meet the highest standards of excellence.',
        color: 'text-amber-500 dark:text-yellow-400', // Light mode: amber-500, Dark mode: yellow-400
    },
    {
        icon: RefreshCcw,
        title: 'Hassle-Free Returns',
        description: 'Not satisfied? Our easy return policy ensures a smooth experience.',
        color: 'text-fuchsia-500 dark:text-purple-400', // Light mode: fuchsia-500, Dark mode: purple-400
    },
    {
        icon: Zap,
        title: 'Cutting-Edge Selection',
        description: 'Stay ahead with our constantly updated inventory of the latest innovations.',
        color: 'text-orange-500 dark:text-orange-400', // Light mode: orange-500, Dark mode: orange-400 (kept similar as orange works well)
    },
];

const ValueProposition = () => {
    // For scroll-based animation
    const { ref, inView } = useInView({
        triggerOnce: true, // Only animate once when it enters view
        threshold: 0.1,    // Trigger when 10% of the component is visible
    });

    // Framer Motion variants for section title
    const sectionTitleVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
    };

    // Framer Motion variants for individual proposition cards
    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 30 },
        visible: (i) => ({
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                delay: i * 0.15, // Staggered animation for each card
                duration: 0.6,
                ease: 'easeOut',
            },
        }),
    };

    return (
        <section
            ref={ref} // Attach the ref for intersection observer
            className="py-16 md:py-24 bg-gray-50 text-gray-900 relative overflow-hidden border-t border-gray-200 dark:bg-gray-950 dark:text-white dark:border-gray-800"
        >
            {/* Subtle background abstract shapes/glows */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: inView ? 1 : 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
            >
                {/* Randomly placed, subtle glows */}
                <div className="absolute top-[10%] left-[5%] w-48 h-48 bg-purple-200/30 rounded-full blur-3xl opacity-50 dark:bg-purple-500/10 dark:opacity-30"></div>
                <div className="absolute bottom-[20%] right-[10%] w-56 h-56 bg-blue-200/30 rounded-full blur-3xl opacity-50 dark:bg-blue-500/10 dark:opacity-30"></div>
                <div className="absolute top-[60%] left-[30%] w-40 h-40 bg-cyan-200/30 rounded-full blur-3xl opacity-50 dark:bg-cyan-500/10 dark:opacity-30"></div>
            </motion.div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-12 md:mb-16"
                    variants={sectionTitleVariants}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                >
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-sm leading-tight dark:drop-shadow-lg">
                        Why <span className="text-blue-600 dark:text-indigo-400">Choose Us</span>?
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
                        Experience the difference with our commitment to quality, speed, and exceptional service.
                    </p>
                </motion.div>

                {/* Propositions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {propositions.map((prop, i) => (
                        <motion.div
                            key={i}
                            className="bg-white rounded-xl p-8 shadow-xl flex flex-col items-center text-center group transform hover:scale-105 transition-transform duration-300 ease-out border border-gray-200 hover:border-blue-400 dark:bg-gray-800 dark:shadow-2xl dark:border-transparent dark:hover:border-indigo-600"
                            variants={cardVariants}
                            initial="hidden"
                            animate={inView ? "visible" : "hidden"}
                            custom={i}
                        >
                            <div className={`mb-6 p-4 rounded-full bg-gray-100 group-hover:bg-blue-500 transition-colors duration-300 shadow-md dark:bg-gray-700 dark:group-hover:bg-indigo-600`}>
                                <prop.icon className={`w-10 h-10 ${prop.color} group-hover:text-white transition-colors duration-300`} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-300 dark:text-white dark:group-hover:text-indigo-400">
                                {prop.title}
                            </h3>
                            <p className="text-gray-600 text-base leading-relaxed dark:text-gray-400">
                                {prop.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ValueProposition;