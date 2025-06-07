'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicle_number: string;
  is_active: boolean;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/customers/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }

        const data = await response.json();
        setCustomers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <Link
          href="/customers/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Customer
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {customers.map((customer) => (
            <li key={customer.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {customer.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Vehicle: {customer.vehicle_number}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-4">
                    {customer.phone && (
                      <p className="text-sm text-gray-500">{customer.phone}</p>
                    )}
                    {customer.email && (
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
          {customers.length === 0 && (
            <li>
              <div className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No customers found
              </div>
            </li>
          )}
        </ul>
      </div>
    </Layout>
  );
} 