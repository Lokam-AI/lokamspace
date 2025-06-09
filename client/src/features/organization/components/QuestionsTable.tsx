import React from 'react';
import { Table } from '@/components/ui/table/Table';
import { StatusPill } from '@/components/ui/status/StatusPill';
import { Question } from '../types';

const SAMPLE_DATA: Question[] = [
  {
    id: 1,
    text: "How would you rate your overall service experience?",
    section: "Overall Service",
    createdAt: "2024-03-15T09:30:00Z",
    isActive: true
  },
  {
    id: 2,
    text: "Was the service completed on time?",
    section: "Timeliness",
    createdAt: "2024-03-15T10:15:00Z",
    isActive: true
  },
  {
    id: 3,
    text: "How would you rate the cleanliness of your vehicle after service?",
    section: "Cleanliness",
    createdAt: "2024-03-15T11:00:00Z",
    isActive: true
  },
  {
    id: 4,
    text: "How would you rate the helpfulness and information provided by the service advisor?",
    section: "Advisor Helpfulness",
    createdAt: "2024-03-16T09:00:00Z",
    isActive: true
  },
  {
    id: 5,
    text: "How would you rate the quality of the work performed on your vehicle?",
    section: "Work Quality",
    createdAt: "2024-03-16T10:30:00Z",
    isActive: true
  },
  {
    id: 6,
    text: "How likely are you to recommend our dealership to others?",
    section: "Recommendation",
    createdAt: "2024-03-16T14:15:00Z",
    isActive: true
  }
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const columns = [
  {
    header: 'Question',
    accessor: 'text' as keyof Question,
    render: (value: string) => (
      <div className="max-w-xl truncate" title={value}>
        {value}
      </div>
    ),
  },
  {
    header: 'Section',
    accessor: 'section' as keyof Question,
    render: (value: string) => (
      <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        {value}
      </span>
    ),
  },
  {
    header: 'Created At',
    accessor: 'createdAt' as keyof Question,
    render: (value: string) => formatDate(value),
  },
  {
    header: 'Status',
    accessor: 'isActive' as keyof Question,
    render: (value: boolean) => <StatusPill isActive={value} />,
  },
];

export const QuestionsTable: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">AI Voice Agent Questions</h1>
        <p className="mt-2 text-sm text-gray-700">
          Default feedback questions used by your AI voice agent
        </p>
      </div>
      <Table data={SAMPLE_DATA} columns={columns} />
    </div>
  );
}; 