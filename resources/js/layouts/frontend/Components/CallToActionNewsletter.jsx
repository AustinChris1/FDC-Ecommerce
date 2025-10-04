import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Mail, ArrowRight, ShoppingBag, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const CallToActionNewsletter = () => {
    const [email, setEmail] = useState('');

    // For scroll-based animation
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim() === '' || !email.includes('@')) {
            toast.error('Please enter a valid email address!');
            return;
        }
        console.log('Subscribed with:', email);
        toast.success(`Thank you for subscribing, ${email}!`);
        setEmail('');
    };

    // Framer Motion variants
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: 'easeOut',
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    };

    return (
        <section
            ref={ref}
            className="py-16 md:py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-950 text-white relative overflow-hidden border-t border-gray-800"
        >
            {/* Subtle background abstract shapes/glows */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: inView ? 1 : 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
            >
                <div className="absolute top-[5%] left-[15%] w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-[10%] right-[20%] w-72 h-72 bg-purple-500/10 rounded-full blur-3xl opacity-30"></div>
            </motion.div>

            <motion.div
                className="container mx-auto px-4 relative z-10 text-center max-w-4xl"
                variants={containerVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
            >
                <motion.h2
                    className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight"
                    variants={itemVariants}
                >
                    Stay Ahead. <span className="text-lime-400">Get Exclusive Deals.</span>
                </motion.h2>
                <motion.p
                    className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10"
                    variants={itemVariants}
                >
                    Sign up for our newsletter to receive the latest tech news, product drops, and special offers directly in your inbox.
                </motion.p>

                <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                    {/* Newsletter Subscription Form */}
                    <motion.form
                        onSubmit={handleSubscribe}
                        className="flex w-full max-w-md bg-gray-800 rounded-full p-2 shadow-xl border border-gray-700"
                        variants={itemVariants}
                    >
                        <Mail className="w-6 h-6 text-gray-400 ml-4 mr-2 self-center" />
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="flex-grow bg-transparent outline-none text-white placeholder-gray-400 text-lg py-2"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            aria-label="Email for newsletter subscription"
                        />
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full transition-colors duration-300 transform hover:scale-105 active:scale-95 flex items-center"
                            aria-label="Subscribe to newsletter"
                        >
                            <Send className="w-5 h-5 mr-2" /> Subscribe
                        </button>
                    </motion.form>

                    {/* Secondary Call to Action (e.g., Shop Now) */}
                    <motion.div variants={itemVariants}>
                        <Link
                            to="/shop"
                            className="inline-flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 group"
                        >
                            <ShoppingBag className="w-5 h-5 mr-2" />
                            Shop All Products
                            <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
};

export default CallToActionNewsletter;