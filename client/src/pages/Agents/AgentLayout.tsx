import React, { ReactNode } from 'react';

interface AgentLayoutProps {
  children: ReactNode;
}

const AgentLayout: React.FC<AgentLayoutProps> = ({ children }) => {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-gray-100 py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg p-10">
          {children}
        </div>
      </div>
    </section>
  );
};

export default AgentLayout;