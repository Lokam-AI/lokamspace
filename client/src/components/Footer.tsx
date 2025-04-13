import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gray-800 text-gray-400 text-sm py-6 px-4 md:px-12 mt-auto border-t border-gray-700">
      <div className="flex justify-between items-center">
        <span>&copy; {new Date().getFullYear()} LokamSpace. All rights reserved.</span>
        <a
          href="mailto:office@lokam.com"
          className="hover:underline hover:text-indigo-400 transition"
        >
          Contact Us
        </a>
      </div>
    </footer>
  );
};

export default Footer;