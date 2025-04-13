import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="w-full bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg p-4 md:px-12 flex justify-between items-center sticky top-0 z-50">
      <div className="text-2xl font-bold text-white tracking-tight">
        <Link to="/" className="hover:text-indigo-400 transition-colors">LokamSpace</Link>
      </div>
      <div className="space-x-6 text-sm font-medium">
        <Link to="/agents" className="text-white hover:text-indigo-400 transition-colors">Agents</Link>
        <Link to="/signin" className="text-white hover:text-indigo-400 transition-colors">Sign In</Link>
      </div>
    </nav>
  );
};

export default Navbar;