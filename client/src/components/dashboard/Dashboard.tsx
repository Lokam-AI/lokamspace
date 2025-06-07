import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  total_calls: number;
  completed_calls: number;
  average_rating: number;
  detractors_count: number;
  service_feedback_breakdown: {
    timeliness: number;
    cleanliness: number;
    advisor_helpfulness: number;
    work_quality: number;
    recommendation: number;
  };
  ready_for_call_count: number;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicle_number: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [readyForCall, setReadyForCall] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch dashboard stats
        const statsResponse = await fetch('http://localhost:8000/api/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        // Fetch ready for call customers
        const customersResponse = await fetch('http://localhost:8000/api/dashboard/ready-for-call', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (customersResponse.ok) {
          const customersData = await customersResponse.json();
          setReadyForCall(customersData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleStartSurvey = async (customerId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/survey/start/${customerId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Refresh the ready for call list
        const updatedCustomers = readyForCall.filter(c => c.id !== customerId);
        setReadyForCall(updatedCustomers);
      }
    } catch (error) {
      console.error('Error starting survey:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Calls</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{stats?.total_calls}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{stats?.completed_calls}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Ratings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Average</p>
              <p className="text-2xl font-bold">{stats?.average_rating.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Detractors</p>
              <p className="text-2xl font-bold">{stats?.detractors_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Ready for Call</h3>
          <p className="text-2xl font-bold">{stats?.ready_for_call_count}</p>
        </div>
      </div>

      {/* Service Feedback Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold mb-4">Service Feedback Breakdown</h3>
        <div className="space-y-4">
          {stats?.service_feedback_breakdown && Object.entries(stats.service_feedback_breakdown).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
                <span className="text-sm font-medium text-gray-700">{value.toFixed(1)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(value / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ready for Call List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Ready for Call</h3>
        </div>
        <div className="divide-y">
          {readyForCall.map((customer) => (
            <div key={customer.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-gray-600">{customer.vehicle_number}</p>
                <p className="text-sm text-gray-600">{customer.phone}</p>
              </div>
              <button
                onClick={() => handleStartSurvey(customer.id)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Start Survey
              </button>
            </div>
          ))}
          {readyForCall.length === 0 && (
            <div className="px-6 py-4 text-gray-500 text-center">
              No customers ready for call
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 