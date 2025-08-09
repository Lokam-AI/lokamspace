import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WaveGoodbyeAnimation: React.FC = () => {
  const messages = [
    "Bad Reviews",
    "Missed Appointments", 
    "Biased Customer Insight"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 2500); // Change every 2.5 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <section className="flex flex-col items-start justify-center h-full max-w-2xl mx-auto px-8">
      {/* Waving Hand Icon */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-8 h-8 relative">
          <img 
            src="https://framerusercontent.com/images/8BXeBQObnslmzSi9htBC7WTLXM.svg" 
            alt="Wave" 
            className="w-full h-full"
          />
        </div>
      </motion.div>

      {/* Static Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h1 className="text-6xl lg:text-7xl font-bold text-black mb-4 leading-tight">
          Wave goodbye to
        </h1>
      </motion.div>

      {/* Animated Cycling Text Container */}
      <div className="relative h-40 lg:h-48 overflow-hidden w-full mb-8">
        <AnimatePresence mode="wait">
          <motion.h2
            key={currentIndex}
            className="text-6xl lg:text-7xl font-bold absolute w-full gradient-text"
            style={{ lineHeight: '1.2' }}
            initial={{ y: 180, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -180, opacity: 0 }}
            transition={{ 
              duration: 0.7,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            {messages[currentIndex]}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* Supporting Text */}
      <motion.p
        className="text-xl text-gray-600 mt-4 max-w-lg leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        Transform your customer feedback process with AI-powered insights and automated call management.
      </motion.p>
    </section>
  );
};

export default WaveGoodbyeAnimation;
