import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Rocket, Eye, Heart, History, Users } from 'lucide-react'; // Relevant icons for About Us content

const AboutUs = () => {
    // Animation variants for Framer Motion, similar to other components
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.1,
                duration: 0.6,
                when: "beforeChildren",
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            className="min-h-screen bg-gray-50 text-gray-900 pt-28 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center
                       dark:bg-gray-950 dark:text-gray-200"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Helmet>
                <title>About Us - FirstSmart Mart</title>
                <meta name="description" content="Learn more about FirstSmart Mart: our mission, vision, and values." />
            </Helmet>

            <motion.div
                className="w-full max-w-4xl bg-white rounded-xl shadow-xl p-6 sm:p-8 lg:p-10 border border-gray-200
                           dark:bg-gray-900 dark:shadow-2xl dark:border-gray-800"
                variants={itemVariants}
            >
                <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-6 text-gray-800 bg-clip-text
                           dark:text-white dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-purple-400 dark:to-pink-600 leading-tight">
                    About FirstSmart Mart
                </h1>
                <p className="text-center text-lg text-gray-600 mb-10 max-w-xl mx-auto dark:text-gray-400">
                    Driving innovation and connecting communities since our inception.
                </p>

                <div className="space-y-10">
                    {/* Our Mission Section */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 p-5
                                bg-gray-100 rounded-lg shadow-sm border border-gray-200
                                dark:bg-gray-800 dark:shadow-inner dark:border-gray-700">
                        <Rocket className="w-12 h-12 text-blue-600 flex-shrink-0 dark:text-blue-400" />
                        <div>
                            <h2 className="text-2xl font-bold text-blue-700 mb-2 dark:text-blue-300">Our Mission</h2>
                            <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                                Our mission is to empower individuals and businesses through seamless digital communication solutions. We strive to bridge gaps, foster connections, and deliver reliable, high-speed services that drive progress and enrich lives.
                            </p>
                        </div>
                    </motion.div>

                    {/* Our Vision Section */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 p-5
                                bg-gray-100 rounded-lg shadow-sm border border-gray-200
                                dark:bg-gray-800 dark:shadow-inner dark:border-gray-700">
                        <Eye className="w-12 h-12 text-green-600 flex-shrink-0 dark:text-green-400" />
                        <div>
                            <h2 className="text-2xl font-bold text-green-700 mb-2 dark:text-green-300">Our Vision</h2>
                            <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                                To be the leading communication provider, recognized for innovation, customer-centricity, and a commitment to a digitally inclusive future where everyone has access to the power of connection.
                            </p>
                        </div>
                    </motion.div>

                    {/* Our Values Section */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 p-5
                                bg-gray-100 rounded-lg shadow-sm border border-gray-200
                                dark:bg-gray-800 dark:shadow-inner dark:border-gray-700">
                        <Heart className="w-12 h-12 text-red-600 flex-shrink-0 dark:text-red-400" />
                        <div>
                            <h2 className="text-2xl font-bold text-red-700 mb-2 dark:text-red-300">Our Values</h2>
                            <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-1 dark:text-gray-300">
                                <li>**Innovation:** Continuously seeking new and better ways to serve our customers.</li>
                                <li>**Integrity:** Operating with honesty, transparency, and ethical conduct.</li>
                                <li>**Customer Focus:** Prioritizing the needs and satisfaction of our users.</li>
                                <li>**Community:** Contributing positively to the communities we serve.</li>
                                <li>**Excellence:** Striving for the highest quality in all our services.</li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Our History (Brief) Section */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 p-5
                                bg-gray-100 rounded-lg shadow-sm border border-gray-200
                                dark:bg-gray-800 dark:shadow-inner dark:border-gray-700">
                        <History className="w-12 h-12 text-yellow-600 flex-shrink-0 dark:text-yellow-400" />
                        <div>
                            <h2 className="text-2xl font-bold text-yellow-700 mb-2 dark:text-yellow-300">Our Journey</h2>
                            <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                                Founded in [Year], FirstSmart Mart began with a simple goal: to make digital communication accessible and reliable for everyone. Over the years, we've grown, adapted, and innovated, always staying true to our core mission of connecting people.
                            </p>
                        </div>
                    </motion.div>

                    {/* Team Statement Section (Optional) */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 p-5
                                bg-gray-100 rounded-lg shadow-sm border border-gray-200
                                dark:bg-gray-800 dark:shadow-inner dark:border-gray-700">
                        <Users className="w-12 h-12 text-purple-600 flex-shrink-0 dark:text-purple-400" />
                        <div>
                            <h2 className="text-2xl font-bold text-purple-700 mb-2 dark:text-purple-300">Our Team</h2>
                            <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                                Behind FirstSmart Mart is a passionate team of experts dedicated to technological excellence and outstanding customer service. We believe in collaboration, continuous learning, and pushing the boundaries of what's possible in digital communication.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AboutUs;