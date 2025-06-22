import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Load from '../Components/Load';

const Team = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = `Team - First Digits`;

        const fetchTeams = async () => {
            try {
                const res = await axios.get(`/api/team/view`);
                if (res.data.status === 200) {
                    setTeams(res.data.teams);
                } else {
                    toast.error("Unable to fetch team data");
                }
            } catch (error) {
                toast.error("An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();
    }, []);

    // Separate individual members and group photos
    const individualMembers = teams.filter(
        member => member.role === null || (member.role && member.role.toLowerCase() !== 'group')
    );
    const groupPhotos = teams.filter(
        member => member.role && member.role.toLowerCase() === 'group'
    );
  
    return (
        <div className="relative w-full min-h-screen bg-gray-900 text-white dark:bg-gray-900 dark:text-gray-100">
            {/* Header Section */}
            <div className="flex flex-col items-center justify-center min-h-screen p-5 sm:p-10 bg-black/70 dark:bg-black/90">
                <div className="mt-24"></div>
                <motion.h1
                    initial={{ y: -100, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-4xl sm:text-5xl mb-6 font-bold text-center dark:text-gray-200"
                >
                    Meet Our Team
                </motion.h1>

                <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    whileInView={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-lg sm:text-xl text-gray-300 mb-10 max-w-3xl text-center dark:text-gray-400"
                >
                    At First Digits, we have a diverse team of passionate professionals dedicated to driving innovation in technology. Meet the people behind our success!
                </motion.p>

                {/* Team Members Section */}
                {loading ? (
                    <Load />
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-10">
                        {individualMembers.map((member) => (
                            <motion.div
                                key={member.id}
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                viewport={{ once: true }}
                                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg flex flex-col items-center text-center dark:bg-gray-700"
                            >
                                <img
                                    src={`/${member.image}`} // Assuming the API provides the correct image URL
                                    alt={member.name}
                                    className="w-full h-40 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold dark:text-gray-200">{member.name}</h3>
                                    <p className="text-gray-400 dark:text-gray-500">{member.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Group Photos Section */}
                <h2 className="text-3xl font-bold mb-6 dark:text-gray-200">Our Team in Action</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-6xl mx-auto mb-10">
                    {groupPhotos.map((photo) => (
                        <motion.div
                            key={photo.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg dark:bg-gray-700"
                        >
                            <img
                                src={`/${photo.image}`} // Assuming the API provides the correct image URL
                                alt={photo.name || "Group Photo"}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4 text-center">
                                <p className="text-gray-300 italic dark:text-gray-400">{photo.name || "Team Photo"}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Conclusion Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="max-w-xl mx-auto text-center mb-10"
                >
                    <h2 className="text-2xl font-bold mb-4 dark:text-gray-200">Join Our Team!</h2>
                    <p className="text-gray-300 mb-5 dark:text-gray-400">
                        We’re always looking for talented individuals to join our growing team. If you’re passionate about technology and innovation, explore our career opportunities today!
                    </p>
                    <Link to='/services/internship' className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300 shadow-lg dark:bg-green-600 dark:hover:bg-green-700">
                        Explore Careers
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default Team;
