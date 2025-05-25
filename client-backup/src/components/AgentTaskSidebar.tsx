// client/src/components/AgentTaskSidebar.tsx
import React, { useState } from 'react';

interface Task {
  agentName: string;
  title: string;
  description: string;
  timeTaken: string;
  creditsUsed: number;
}

interface AgentTaskSidebarProps {
  tasks: Task[];
  onClose: () => void;
}

const AgentTaskSidebar: React.FC<AgentTaskSidebarProps> = ({ tasks, onClose }) => {
  const [expandedTaskIndex, setExpandedTaskIndex] = useState<number | null>(null);

  const toggleTask = (index: number) => {
    setExpandedTaskIndex(expandedTaskIndex === index ? null : index);
  };

  return (
    <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg p-4 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Agent Tasks</h2>
        <button onClick={onClose} className="text-red-500 hover:text-red-700">&times;</button>
      </div>
      {tasks.map((task, index) => (
        <div key={index} className="mb-4">
          <div
            className="cursor-pointer p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            onClick={() => toggleTask(index)}
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold">{task.agentName}</span>
              <span className="text-sm text-gray-500">{task.timeTaken}</span>
            </div>
            <div className="text-sm">{task.title}</div>
          </div>
          {expandedTaskIndex === index && (
            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
              <p>{task.description}</p>
              <p className="text-sm text-gray-500">Credits Used: {task.creditsUsed}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AgentTaskSidebar;