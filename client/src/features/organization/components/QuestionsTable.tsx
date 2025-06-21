import React from 'react';
import { Table } from '@/components/ui/table/Table';
import { StatusPill } from '@/components/ui/status/StatusPill';
import { Question } from '../types';
import { Column } from '@/components/ui/table/Table';
import { STATIC_QUESTIONS } from '@/data/staticData';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const columns: Column<Question>[] = [
  {
    header: 'Question',
    accessor: 'text',
    render: (value: Question['text'] | string | number | boolean) => (
      <div className="max-w-xl truncate" title={String(value)}>
        {String(value)}
      </div>
    ),
  },
  {
    header: 'Section',
    accessor: 'section',
    render: (value: Question['section'] | string | number | boolean) => (
      <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        {String(value)}
      </span>
    ),
  },
  {
    header: 'Created At',
    accessor: 'createdAt',
    render: (value: Question['createdAt'] | string | number | boolean) => formatDate(String(value)),
  },
  {
    header: 'Status',
    accessor: 'isActive',
    render: (value: Question['isActive'] | string | number | boolean) => (
      <StatusPill isActive={Boolean(value)} />
    ),
  },
];

export const QuestionsTable: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">AI Voice Agent Questions</h1>
        <p className="mt-2 text-sm text-gray-700">
          Default feedback questions used by your AI voice agent for customer satisfaction surveys
        </p>
      </div>
      <Table data={STATIC_QUESTIONS} columns={columns} />
    </div>
  );
}; 