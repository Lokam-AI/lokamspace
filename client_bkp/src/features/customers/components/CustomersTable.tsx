import React from 'react';
import { Table } from '@/components/ui/table/Table';
import { StatusPill } from '@/components/ui/status/StatusPill';
import { Customer } from '../types';
import type { Column } from '@/components/ui/table/Table';

const SAMPLE_DATA: Customer[] = [
    {
      id: 1,
      name: "Raoof Naushad",
      email: "raoofnaushad.7@gmail.com",
      phone: "9029897685",
      vehicle_number: "B3KM6K",
      is_active: true
    },
    {
      id: 2,
      name: "Aisha Rahman",
      email: "aisha.rahman@example.com",
      phone: "4165551234",
      vehicle_number: "ONT1234",
      is_active: true
    },
    {
      id: 3,
      name: "Deepak Menon",
      email: "deepak.menon@example.com",
      phone: "6475559876",
      vehicle_number: "MH12AB1234",
      is_active: false
    },
    {
      id: 4,
      name: "Sara George",
      email: "sara.george@example.com",
      phone: "9055552468",
      vehicle_number: "TN09CA9087",
      is_active: true
    },
    {
      id: 5,
      name: "Jayanth Reddy",
      email: "jayanth.reddy@example.com",
      phone: "7805553344",
      vehicle_number: "TS07GH7865",
      is_active: false
    }
  ];

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
      </div>
      <Table data={SAMPLE_DATA} columns={columns} />
    </div>
  );
}; 