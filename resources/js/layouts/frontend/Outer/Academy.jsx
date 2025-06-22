import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Star, Award } from 'lucide-react';

const Academy = () => {
    document.title = `Academy - First Digits`;
    const courses = [
        {
            title: 'Introduction to Automation',
            description: 'Explore the fundamentals of home and office automation systems.',
            instructor: 'Alice Johnson',
            duration: '4 weeks',
        },
        {
            title: 'Advanced Robotics',
            description: 'Learn advanced robotics and automation techniques to build smart devices.',
            instructor: 'John Doe',
            duration: '6 weeks',
        },
        {
            title: 'IoT and Smart Technologies',
            description: 'Discover the Internet of Things and how to create connected devices.',
            instructor: 'Jane Smith',
            duration: '8 weeks',
        },
        // Add more courses as needed
    ];

    return (
        <div className="relative w-full min-h-screen bg-gray-900 dark:bg-gray-800">
            {/* Background Overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-5 sm:p-10 text-center bg-black/70 dark:bg-black/80">
                <div className="mt-20"></div>
                {/* Academy Header */}
                <motion.h1
                    initial={{ y: -100, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-white text-4xl sm:text-5xl mb-6 font-bold"
                >
                    Academy at First Digits
                </motion.h1>

                <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    whileInView={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-gray-300 dark:text-gray-200 mb-10 text-lg sm:text-xl max-w-3xl mx-auto"
                >
                    Empowering learners with knowledge in automation and technology. Our courses are designed to equip you with practical skills to thrive in a digital world.
                </motion.p>

                {/* Course Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {courses.map((course, index) => (
                        <motion.div
                            key={index}
                            initial={{ scale: 0.5, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-5 text-left"
                        >
                            <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-500 mb-2">{course.title}</h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">{course.description}</p>
                            <p className="text-gray-500 dark:text-gray-400">Instructor: {course.instructor}</p>
                            <p className="text-gray-500 dark:text-gray-400">Duration: {course.duration}</p>
                            <button className="mt-4 bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 transition duration-300">
                                Enroll Now
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Conclusion Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="max-w-2xl text-center mt-10"
                >
                    <h2 className="text-2xl font-bold text-white mb-4">Join Our Academy</h2>
                    <p className="text-gray-300 dark:text-gray-200 mb-5">
                        Be part of a community that embraces technology and innovation. Enroll today and start your journey towards mastering automation!
                    </p>
                    <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300 shadow-lg">
                        Learn More
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Academy;
