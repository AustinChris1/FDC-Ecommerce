import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { X, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SITE_NOTIFICATION_DISMISSED_KEY = 'site_notification_dismissed';

const SiteNotification = () => {
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationActive, setNotificationActive] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [loading, setLoading] = useState(true);

    const dismissNotification = useCallback(() => {
        setIsDismissed(true);
        localStorage.setItem(SITE_NOTIFICATION_DISMISSED_KEY, 'true');
    }, []);

    useEffect(() => {
        const dismissed = localStorage.getItem(SITE_NOTIFICATION_DISMISSED_KEY);

        // If already dismissed, set state and stop loading
        if (dismissed === 'true') {
            setIsDismissed(true);
            setLoading(false);
            return;
        }

        axios.get('/api/settings/general')
            .then(res => {
                if (res.data.status === 200 && res.data.settings) {
                    const { site_notification_message, site_notification_active } = res.data.settings;

                    setNotificationMessage(site_notification_message || '');
                    // Ensure boolean conversion for site_notification_active if it comes as a string '1' or '0'
                    setNotificationActive(site_notification_active === true || site_notification_active === 1 || site_notification_active === '1');
                } else {
                    console.error("Failed to fetch site notification settings:", res.data.message);
                }
            })
            .catch(err => {
                console.error("Error fetching site notification settings:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Conditions for displaying the notification
    const shouldDisplayNotification = !loading && notificationActive && !isDismissed && notificationMessage;

    const marqueeVariants = {
        animate: {
            x: ["100%", "-100%"],
            transition: {
                x: {
                    repeat: Infinity, // Loop infinitely
                    repeatType: "loop", // Restart from the beginning
                    duration: 15,
                    ease: "linear", // Constant speed
                },
            },
        },
    };

    return (
        <AnimatePresence>
            {shouldDisplayNotification && ( // Conditionally render the motion.div inside AnimatePresence
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }} // This exit animation will now trigger
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    // --- COLOR CHANGES HERE ---
                    className="fixed top-[96px] sm:top-[104px] lg:top-[108px] left-0 right-0
                               bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200
                               px-3 py-1 text-center text-sm sm:text-base flex items-center justify-between gap-4 z-40 shadow-xl"
                    role="alert"
                >
                    {/* Icon color adjusted */}
                    <BellRing className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-blue-500 dark:text-blue-400" />

                    {/* Marquee Container: Hides overflow, allows text to scroll */}
                    <div className="flex-grow overflow-hidden whitespace-nowrap">
                        <motion.p
                            className="inline-block font-medium"
                            variants={marqueeVariants}
                            animate="animate"
                        >
                            {notificationMessage}
                        </motion.p>
                    </div>

                    <button
                        onClick={dismissNotification}
                        // --- COLOR CHANGES HERE ---
                        className="flex-shrink-0 p-1 rounded-full
                                   text-blue-600 hover:bg-blue-200
                                   dark:text-blue-300 dark:hover:bg-blue-800
                                   transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600"
                        aria-label="Dismiss notification"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SiteNotification;