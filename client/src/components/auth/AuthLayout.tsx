import React from 'react';
import { motion } from 'framer-motion';
import WaveGoodbyeAnimation from './WaveGoodbyeAnimation';

interface AuthLayoutProps {
  children: React.ReactNode;
  variant?: 'login' | 'signup';
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, variant = 'login' }) => {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Hero Content */}
      <motion.div 
        className="hidden lg:flex lg:w-3/5 bg-white relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center w-full">
          <WaveGoodbyeAnimation />
        </div>

        {/* Bottom Logo/Branding */}
        <motion.div 
          className="absolute bottom-8 left-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="text-sm text-gray-500">
            Powered by <span className="font-semibold text-gray-700">Lokam.ai</span>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Right Side - Auth Forms */}
      <motion.div 
        className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-white"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="w-full max-w-md">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
