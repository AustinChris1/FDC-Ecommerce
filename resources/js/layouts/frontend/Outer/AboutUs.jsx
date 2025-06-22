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
            className="min-h-screen bg-gray-950 text-gray-200 pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Helmet>
                <title>About Us - First Digit Communications</title>
                <meta name="description" content="Learn more about First Digit Communications: our mission, vision, and values." />
            </Helmet>

            <motion.div
                className="w-full max-w-4xl bg-gray-900 rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-800"
                variants={itemVariants}
            >
                <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 leading-tight">
                    About First Digit Communications
                </h1>
                <p className="text-center text-lg text-gray-400 mb-10 max-w-xl mx-auto">
                    Driving innovation and connecting communities since our inception.
                </p>

                <div className="space-y-10">
                    {/* Our Mission Section */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 p-5 bg-gray-800 rounded-lg shadow-inner border border-gray-700">
                        <Rocket className="w-12 h-12 text-blue-400 flex-shrink-0" />
                        <div>
                            <h2 className="text-2xl font-bold text-blue-300 mb-2">Our Mission</h2>
                            <p className="text-gray-300 leading-relaxed">
                                Our mission is to empower individuals and businesses through seamless digital communication solutions. We strive to bridge gaps, foster connections, and deliver reliable, high-speed services that drive progress and enrich lives.
                            </p>
                        </div>
                    </motion.div>

                    {/* Our Vision Section */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 p-5 bg-gray-800 rounded-lg shadow-inner border border-gray-700">
                        <Eye className="w-12 h-12 text-green-400 flex-shrink-0" />
                        <div>
                            <h2 className="text-2xl font-bold text-green-300 mb-2">Our Vision</h2>
                            <p className="text-gray-300 leading-relaxed">
                                To be the leading communication provider, recognized for innovation, customer-centricity, and a commitment to a digitally inclusive future where everyone has access to the power of connection.
                            </p>
                        </div>
                    </motion.div>

                    {/* Our Values Section */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 p-5 bg-gray-800 rounded-lg shadow-inner border border-gray-700">
                        <Heart className="w-12 h-12 text-red-400 flex-shrink-0" />
                        <div>
                            <h2 className="text-2xl font-bold text-red-300 mb-2">Our Values</h2>
                            <ul className="list-disc list-inside text-gray-300 leading-relaxed space-y-1">
                                <li>**Innovation:** Continuously seeking new and better ways to serve our customers.</li>
                                <li>**Integrity:** Operating with honesty, transparency, and ethical conduct.</li>
                                <li>**Customer Focus:** Prioritizing the needs and satisfaction of our users.</li>
                                <li>**Community:** Contributing positively to the communities we serve.</li>
                                <li>**Excellence:** Striving for the highest quality in all our services.</li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Our History (Brief) Section */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 p-5 bg-gray-800 rounded-lg shadow-inner border border-gray-700">
                        <History className="w-12 h-12 text-yellow-400 flex-shrink-0" />
                        <div>
                            <h2 className="text-2xl font-bold text-yellow-300 mb-2">Our Journey</h2>
                            <p className="text-gray-300 leading-relaxed">
                                Founded in [Year], First Digit Communications began with a simple goal: to make digital communication accessible and reliable for everyone. Over the years, we've grown, adapted, and innovated, always staying true to our core mission of connecting people.
                            </p>
                        </div>
                    </motion.div>

                    {/* Team Statement Section (Optional) */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 p-5 bg-gray-800 rounded-lg shadow-inner border border-gray-700">
                        <Users className="w-12 h-12 text-purple-400 flex-shrink-0" />
                        <div>
                            <h2 className="text-2xl font-bold text-purple-300 mb-2">Our Team</h2>
                            <p className="text-gray-300 leading-relaxed">
                                Behind First Digit Communications is a passionate team of experts dedicated to technological excellence and outstanding customer service. We believe in collaboration, continuous learning, and pushing the boundaries of what's possible in digital communication.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AboutUs;
