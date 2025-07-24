import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CountdownTimer = ({ targetDate }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents = [];

    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval] && timeLeft[interval] !== 0) {
            return;
        }
        timerComponents.push(
            <span key={interval} className="flex flex-col items-center mx-1 md:mx-2 p-2 rounded-md
                                           bg-gray-700/50 dark:bg-gray-700/50">
                <span className="text-xl md:text-2xl font-bold
                                   text-white dark:text-white">
                    {String(timeLeft[interval]).padStart(2, '0')}
                </span>
                <span className="text-xs md:text-sm uppercase
                                   text-gray-300 dark:text-gray-300">
                    {interval.charAt(0)}
                </span>
            </span>
        );
    });

    return (
        <div className="flex justify-center items-center font-mono">
            {timerComponents.length ? timerComponents : <span className="font-semibold
                                                                       text-red-500 dark:text-red-400">Time's Up!</span>}
        </div>
    );
};

export default CountdownTimer;