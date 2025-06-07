import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AgentLayout from './AgentLayout';


const AgentsListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.target.value);
  };

  return (
    <AgentLayout>
      <h1 className="text-4xl font-bold text-indigo-600 mb-10 text-center">Explore Our Agents</h1>
      
      <div className="max-w-3xl mx-auto mb-12 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search agents..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={filter}
          onChange={handleFilterChange}
          className="ml-4 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All</option>
          <option value="marketing">Marketing</option>
          <option value="automation">Automation</option>
          {/* Add more filter options as needed */}
        </select>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow transform hover:-translate-y-1">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              {/* <img src={sambaIcon} alt="SAMBA Icon" className="h-12 w-12 rounded-full" /> */}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">SAMBA - Social Media Marketing & Branding Agent</h2>
            </div>
          </div>
          <p className="text-base text-gray-700 mb-4">
            Automate your LinkedIn posts, generate marketing content, and schedule them effortlessly.
          </p>
          <div className="text-sm text-gray-500 mb-4">
            <p><span className="font-medium">Last Updated:</span> 2023-10-01</p>
            <p><span className="font-medium">Stars:</span> ★★★★☆</p>
            <p><span className="font-medium">Used by:</span> 1,234 users</p>
          </div>
          <Link
            to="/agents/samba"
            className="inline-block bg-indigo-500 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition-colors"
          >
            Go to SAMBA
          </Link>
        </div>
        {/* Future Agents can appear here */}
      </div>
    </AgentLayout>
  );
};

export default AgentsListPage;