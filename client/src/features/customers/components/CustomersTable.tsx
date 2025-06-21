import React from 'react';
import { Table } from '@/components/ui/table/Table';
import { StatusPill } from '@/components/ui/status/StatusPill';
import { Customer } from '../types';
import type { Column } from '@/components/ui/table/Table';
import { STATIC_CUSTOMERS } from '@/data/staticData';

const columns: Column<Customer>[] = [
  {
    header: 'Name',
    accessor: 'name',
  },
  {
    header: 'Email',
    accessor: 'email',
  },
  {
    header: 'Phone',
    accessor: 'phone',
  },
  {
    header: 'Vehicle Number',
    accessor: 'vehicle_number',
  },
  {
    header: 'Status',
    accessor: 'is_active',
    render: (value: Customer['is_active'] | string | number | boolean) => (
      <StatusPill isActive={Boolean(value)} />
    ),
  },
];

export const CustomersTable: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage your customer database and view customer information
        </p>
      </div>
      <Table data={STATIC_CUSTOMERS} columns={columns} />
    </div>
  );
}; 