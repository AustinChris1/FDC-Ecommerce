import React, { useEffect } from 'react'; // Import useEffect
import { MessageSquareText } from 'lucide-react'; // Using Lucide React for the chat icon
import { motion } from 'framer-motion';

const ChatSupportButton = () => {
    useEffect(() => {
        const checkTawk = setInterval(() => {
            if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
                window.Tawk_API.hideWidget();
                clearInterval(checkTawk);
            }
        }, 500); 

        // Clean up the interval when the component unmounts
        return () => clearInterval(checkTawk);
    }, []); // Empty dependency array means this runs once on mount

    const handleChatClick = () => {
        // Check if Tawk_API is available and has the 'toggle' function
        if (window.Tawk_API && typeof window.Tawk_API.toggle === 'function') {
            window.Tawk_API.toggle(); // Toggles the chat widget visibility (open/close)
        } else {
            console.warn("Tawk.to API not loaded or 'toggle' function not available.");
            // Fallback: You might want to show a message or a direct link to a contact page
            alert('Chat service is currently unavailable. Please try again later or contact us via email.');
        }
    };

    return (
        <motion.button
            className="fixed bottom-8 right-4 sm:right-6 md:right-8 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 dark:bg-green-600 dark:hover:bg-green-700 z-50"
            onClick={handleChatClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            aria-label="Chat with support"
        >
            <MessageSquareText className="w-6 h-6" />
        </motion.button>
    );
};

export default ChatSupportButton;